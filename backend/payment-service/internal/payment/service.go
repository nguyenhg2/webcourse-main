package payment

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"strings"
	"time"

	"payment-service/internal/coupon"

	"github.com/redis/go-redis/v9"
	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/paymentintent"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const (
	defaultAmount = int64(599000)
	minCardAmount = int64(1000)
)

type Service struct {
	paymentStore *Store
	couponStore  *coupon.Store
	redisClient  *redis.Client
}

func NewService(paymentStore *Store, couponStore *coupon.Store, redisClient *redis.Client) *Service {
	return &Service{
		paymentStore: paymentStore,
		couponStore:  couponStore,
		redisClient:  redisClient,
	}
}

func (s *Service) CreateIntent(ctx context.Context, userID string, req PaymentRequest) (*PaymentResponse, error) {
	if userID == "" {
		return nil, errors.New("không tìm thấy người dùng")
	}
	if len(req.CourseIDs) == 0 {
		return nil, errors.New("vui lòng chọn khóa học cần thanh toán")
	}
	if req.Amount < 0 {
		return nil, errors.New("số tiền phải lớn hơn hoặc bằng 0")
	}

	amount := req.Amount
	if amount == 0 {
		amount = defaultAmount
	}

	couponCode := strings.ToUpper(strings.TrimSpace(req.CouponCode))
	couponDiscount := int64(0)
	if couponCode != "" {
		coupon, err := s.couponStore.FindValid(ctx, couponCode)
		if err != nil {
			return nil, err
		}
		if coupon.MaxUses > 0 && coupon.Used >= coupon.MaxUses {
			return nil, errors.New("mã giảm giá đã hết lượt sử dụng")
		}
		couponDiscount = discountAmount(amount, coupon.Type, coupon.Discount)
	}

	finalAmount := amount - couponDiscount
	cardLast4 := normalizeCardLast4(req.CardLast4)
	cardBrand := normalizeCardBrand(req.CardBrand)
	payment := &Payment{
		ID:             primitive.NewObjectID(),
		UserID:         userID,
		CourseIDs:      req.CourseIDs,
		Amount:         amount,
		CouponCode:     couponCode,
		CouponDiscount: couponDiscount,
		CardLast4:      cardLast4,
		CardBrand:      cardBrand,
		Status:         "pending",
		CreatedAt:      time.Now().Unix(),
	}

	if finalAmount <= 0 {
		payment.Status = "completed"
		payment.CardBrand = "free"
		if err := s.paymentStore.Create(ctx, payment); err != nil {
			return nil, err
		}
		s.useCoupon(ctx, couponCode)
		s.publishPaymentSuccess(ctx, payment)
		return &PaymentResponse{
			ClientSecret: "",
			PaymentID:    payment.ID.Hex(),
			Amount:       0,
			Status:       payment.Status,
		}, nil
	}

	if finalAmount < minCardAmount {
		return nil, errors.New("số tiền thanh toán quá nhỏ")
	}

	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(finalAmount),
		Currency: stripe.String("vnd"),
		PaymentMethodTypes: []*string{
			stripe.String("card"),
		},
	}
	intent, err := paymentintent.New(params)
	if err != nil {
		return nil, err
	}

	payment.StripePaymentID = intent.ID
	if err := s.paymentStore.Create(ctx, payment); err != nil {
		return nil, err
	}
	s.useCoupon(ctx, couponCode)

	return &PaymentResponse{
		ClientSecret: intent.ClientSecret,
		PaymentID:    payment.ID.Hex(),
		Amount:       finalAmount,
		Status:       payment.Status,
	}, nil
}

func (s *Service) ConfirmTest(ctx context.Context, paymentID, cardLast4, cardBrand string) error {
	payment, err := s.paymentStore.GetByID(ctx, paymentID)
	if err != nil {
		return err
	}
	if payment.Status == "completed" {
		return nil
	}
	if payment.StripePaymentID == "" {
		return errors.New("giao dịch chưa có Stripe intent")
	}

	params := &stripe.PaymentIntentConfirmParams{
		PaymentMethod: stripe.String("pm_card_visa"),
	}
	intent, err := paymentintent.Confirm(payment.StripePaymentID, params)
	if err != nil {
		return err
	}
	if intent.Status != stripe.PaymentIntentStatusSucceeded {
		return errors.New("thanh toán chưa hoàn tất")
	}

	cardLast4 = normalizeCardLast4(cardLast4)
	cardBrand = normalizeCardBrand(cardBrand)
	if cardLast4 == "" {
		cardLast4 = payment.CardLast4
	}
	if cardBrand == "" {
		cardBrand = payment.CardBrand
	}

	return s.MarkCompleted(ctx, paymentID, cardLast4, cardBrand)
}

func (s *Service) MarkCompleted(ctx context.Context, paymentID string, cardLast4, cardBrand string) error {
	payment, err := s.paymentStore.GetByID(ctx, paymentID)
	if err != nil {
		return err
	}

	update := bson.M{
		"status":     "completed",
		"card_last4": cardLast4,
		"card_brand": cardBrand,
		"updated_at": time.Now().Unix(),
	}
	if err := s.paymentStore.Update(ctx, paymentID, update); err != nil {
		return err
	}

	s.publishPaymentSuccess(ctx, payment)
	return nil
}

func (s *Service) GetByID(ctx context.Context, paymentID string) (*Payment, error) {
	return s.paymentStore.GetByID(ctx, paymentID)
}

func (s *Service) ListByUser(ctx context.Context, userID string) ([]*Payment, error) {
	return s.paymentStore.ListByUser(ctx, userID)
}

func (s *Service) ListAll(ctx context.Context) ([]*Payment, error) {
	return s.paymentStore.ListAll(ctx)
}

func (s *Service) useCoupon(ctx context.Context, code string) {
	if code == "" {
		return
	}
	if err := s.couponStore.Use(ctx, code); err != nil {
		log.Printf("Không thể cập nhật lượt dùng mã giảm giá: %v", err)
	}
}

func (s *Service) publishPaymentSuccess(ctx context.Context, payment *Payment) {
	if s.redisClient == nil {
		return
	}

	data, _ := json.Marshal(map[string]interface{}{
		"user_id":    payment.UserID,
		"course_ids": payment.CourseIDs,
		"payment_id": payment.ID.Hex(),
	})
	if err := s.redisClient.Publish(ctx, "payment.success", data).Err(); err != nil {
		log.Printf("Redis publish error: %v", err)
	}
}

func discountAmount(amount int64, couponType string, discount int64) int64 {
	if couponType == "percentage" {
		discount = amount * discount / 100
	}
	if discount > amount {
		return amount
	}
	return discount
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
	default:
		return ""
	}
}
