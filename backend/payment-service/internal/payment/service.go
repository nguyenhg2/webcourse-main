package payment

import (
	"context"
	"errors"
	"log"
	"strconv"
	"strings"
	"time"

	"payment-service/internal/coupon"

	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/paymentintent"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	methodStripe   = "stripe"
	statusPending  = "pending"
	statusComplete = "completed"
)

type Service struct {
	payments *Store
	coupons  *coupon.Store
}

func NewService(payments *Store, coupons *coupon.Store, stripeSecretKey string) *Service {
	stripe.Key = strings.TrimSpace(stripeSecretKey)
	return &Service{payments: payments, coupons: coupons}
}

func (s *Service) CreatePayment(ctx context.Context, userID string, req PaymentRequest) (*PaymentResponse, error) {
	payment, err := s.buildPayment(ctx, userID, req)
	if err != nil {
		return nil, err
	}

	clientSecret := ""
	if payment.FinalAmount > 0 {
		intent, err := createStripeIntent(payment)
		if err != nil {
			return nil, err
		}
		payment.Status = statusPending
		payment.StripePaymentID = intent.ID
		clientSecret = intent.ClientSecret
	}

	if err := s.payments.Create(ctx, payment); err != nil {
		return nil, err
	}
	if payment.Status == statusComplete {
		s.useCoupon(ctx, payment)
	}

	return paymentResponse(payment, clientSecret), nil
}

func (s *Service) buildPayment(ctx context.Context, userID string, req PaymentRequest) (*Payment, error) {
	userID = strings.TrimSpace(userID)
	if userID == "" {
		return nil, errors.New("user not found")
	}
	if req.Amount < 0 {
		return nil, errors.New("amount must be greater than or equal to 0")
	}

	courseIDs := normalizedCourseIDs(req)
	if len(courseIDs) == 0 {
		return nil, errors.New("course_ids is required")
	}

	discount, couponCode, err := s.discount(ctx, req.CouponCode, req.Amount)
	if err != nil {
		return nil, err
	}

	now := time.Now().Unix()
	return &Payment{
		ID:             primitive.NewObjectID(),
		UserID:         userID,
		UserEmail:      strings.TrimSpace(req.UserEmail),
		CourseIDs:      courseIDs,
		Amount:         req.Amount,
		OriginalAmount: req.Amount,
		DiscountAmount: discount,
		FinalAmount:    positive(req.Amount - discount),
		CouponCode:     couponCode,
		CouponDiscount: discount,
		Method:         methodStripe,
		CardLast4:      normalizeCardLast4(req.CardLast4),
		CardBrand:      normalizeCardBrand(req.CardBrand),
		Status:         statusComplete,
		BillingAddress: normalizeBillingAddress(req.BillingAddress, req.UserEmail),
		CreatedAt:      now,
		UpdatedAt:      now,
	}, nil
}

func createStripeIntent(payment *Payment) (*stripe.PaymentIntent, error) {
	params := &stripe.PaymentIntentParams{
		Amount:             stripe.Int64(payment.FinalAmount),
		Currency:           stripe.String("vnd"),
		PaymentMethodTypes: []*string{stripe.String("card")},
		Metadata: map[string]string{
			"payment_id":   payment.ID.Hex(),
			"user_id":      payment.UserID,
			"course_count": strconv.Itoa(len(payment.CourseIDs)),
		},
	}
	if payment.UserEmail != "" {
		params.ReceiptEmail = stripe.String(payment.UserEmail)
	}
	return paymentintent.New(params)
}

func (s *Service) discount(ctx context.Context, code string, amount int64) (int64, string, error) {
	code = coupon.NormalizeCode(code)
	if code == "" {
		return 0, "", nil
	}

	discount, ok := s.coupons.Discount(ctx, code, amount)
	if !ok {
		return 0, "", errors.New("coupon is invalid")
	}
	return discount, code, nil
}

func (s *Service) useCoupon(ctx context.Context, payment *Payment) {
	if payment.DiscountAmount <= 0 {
		return
	}
	if err := s.coupons.Use(ctx, payment.CouponCode, payment.DiscountAmount); err != nil {
		log.Printf("cannot update coupon usage: %v", err)
	}
}

func paymentResponse(payment *Payment, clientSecret string) *PaymentResponse {
	return &PaymentResponse{
		ClientSecret:    clientSecret,
		PaymentID:       payment.ID.Hex(),
		StripePaymentID: payment.StripePaymentID,
		Amount:          payment.FinalAmount,
		Status:          payment.Status,
	}
}

func (s *Service) GetByID(ctx context.Context, paymentID string) (*Payment, error) {
	return s.payments.GetByID(ctx, paymentID)
}

func (s *Service) ListByUser(ctx context.Context, userID string) ([]*Payment, error) {
	return s.payments.ListByUser(ctx, userID)
}

func (s *Service) ListAll(ctx context.Context) ([]*Payment, error) {
	return s.payments.ListAll(ctx)
}

func normalizedCourseIDs(req PaymentRequest) []string {
	seen := map[string]bool{}
	result := []string{}
	for _, id := range req.CourseIDs {
		id = strings.TrimSpace(id)
		if id == "" || seen[id] {
			continue
		}
		seen[id] = true
		result = append(result, id)
	}
	return result
}

func normalizeBillingAddress(value BillingAddress, fallbackEmail string) BillingAddress {
	value.Name = strings.TrimSpace(value.Name)
	value.Email = strings.TrimSpace(value.Email)
	if value.Email == "" {
		value.Email = strings.TrimSpace(fallbackEmail)
	}
	value.Phone = strings.TrimSpace(value.Phone)
	value.Line1 = strings.TrimSpace(value.Line1)
	value.Line2 = strings.TrimSpace(value.Line2)
	value.City = strings.TrimSpace(value.City)
	value.State = strings.TrimSpace(value.State)
	value.PostalCode = strings.TrimSpace(value.PostalCode)
	value.Country = strings.ToUpper(strings.TrimSpace(value.Country))
	return value
}

func normalizeCardLast4(value string) string {
	value = strings.TrimSpace(value)
	if len(value) > 4 {
		value = value[len(value)-4:]
	}
	if len(value) != 4 {
		return ""
	}
	for _, ch := range value {
		if ch < '0' || ch > '9' {
			return ""
		}
	}
	return value
}

func normalizeCardBrand(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	switch value {
	case "visa", "mastercard", "amex", "jcb", "discover", "unionpay":
		return value
	case "american express":
		return "amex"
	default:
		return ""
	}
}

func positive(value int64) int64 {
	if value < 0 {
		return 0
	}
	return value
}
