package service

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"strings"
	"time"

	"payment-service/internal/model"
	"payment-service/internal/repository"

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

type PaymentService struct {
	paymentRepo *repository.PaymentRepo
	couponRepo  *repository.CouponRepo
	redisClient *redis.Client
}

func NewPaymentService(pr *repository.PaymentRepo, cr *repository.CouponRepo, rc *redis.Client) *PaymentService {
	return &PaymentService{
		paymentRepo: pr,
		couponRepo:  cr,
		redisClient: rc,
	}
}

func (s *PaymentService) CreatePaymentIntent(ctx context.Context, userID string, req model.PaymentRequest) (*model.PaymentResponse, error) {
	if userID == "" {
		return nil, errors.New("user is required")
	}
	if len(req.CourseIDs) == 0 {
		return nil, errors.New("course_ids is required")
	}
	if req.Amount < 0 {
		return nil, errors.New("amount must be greater than or equal to 0")
	}

	amount := req.Amount
	if amount == 0 {
		amount = defaultAmount
	}

	couponCode := strings.ToUpper(strings.TrimSpace(req.CouponCode))
	couponDiscount := int64(0)
	if couponCode != "" {
		coupon, err := s.couponRepo.ValidateCoupon(ctx, couponCode)
		if err != nil {
			return nil, err
		}
		if coupon.MaxUses > 0 && coupon.Used >= coupon.MaxUses {
			return nil, errors.New("coupon usage limit reached")
		}
		couponDiscount = discountAmount(amount, coupon.Type, coupon.Discount)
	}

	finalAmount := amount - couponDiscount
	payment := &model.Payment{
		ID:             primitive.NewObjectID(),
		UserID:         userID,
		CourseIDs:      req.CourseIDs,
		Amount:         amount,
		CouponCode:     couponCode,
		CouponDiscount: couponDiscount,
		CardLast4:      "",
		CardBrand:      "",
		Status:         "pending",
		CreatedAt:      time.Now().Unix(),
	}

	if finalAmount <= 0 {
		payment.Status = "completed"
		payment.CardBrand = "free"
		if err := s.paymentRepo.CreatePayment(ctx, payment); err != nil {
			return nil, err
		}
		s.useCoupon(ctx, couponCode)
		s.publishPaymentSuccess(ctx, payment)
		return &model.PaymentResponse{
			ClientSecret: "",
			PaymentID:    payment.ID.Hex(),
			Amount:       0,
			Status:       payment.Status,
		}, nil
	}

	if finalAmount < minCardAmount {
		return nil, errors.New("amount is too small")
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
	if err := s.paymentRepo.CreatePayment(ctx, payment); err != nil {
		return nil, err
	}
	s.useCoupon(ctx, couponCode)

	return &model.PaymentResponse{
		ClientSecret: intent.ClientSecret,
		PaymentID:    payment.ID.Hex(),
		Amount:       finalAmount,
		Status:       payment.Status,
	}, nil
}

func (s *PaymentService) ConfirmTestPayment(ctx context.Context, paymentID string) error {
	payment, err := s.paymentRepo.GetPaymentByID(ctx, paymentID)
	if err != nil {
		return err
	}
	if payment.Status == "completed" {
		return nil
	}
	if payment.StripePaymentID == "" {
		return errors.New("payment does not have a stripe intent")
	}

	params := &stripe.PaymentIntentConfirmParams{
		PaymentMethod: stripe.String("pm_card_visa"),
	}
	intent, err := paymentintent.Confirm(payment.StripePaymentID, params)
	if err != nil {
		return err
	}
	if intent.Status != stripe.PaymentIntentStatusSucceeded {
		return errors.New("payment was not completed")
	}

	return s.PaymentSuccess(ctx, paymentID, "4242", "visa")
}

func (s *PaymentService) PaymentSuccess(ctx context.Context, paymentID string, cardLast4, cardBrand string) error {
	payment, err := s.paymentRepo.GetPaymentByID(ctx, paymentID)
	if err != nil {
		return err
	}

	update := bson.M{
		"status":     "completed",
		"card_last4": cardLast4,
		"card_brand": cardBrand,
		"updated_at": time.Now().Unix(),
	}
	if err := s.paymentRepo.UpdatePayment(ctx, paymentID, update); err != nil {
		return err
	}

	s.publishPaymentSuccess(ctx, payment)
	return nil
}

func (s *PaymentService) GetPayment(ctx context.Context, paymentID string) (*model.Payment, error) {
	return s.paymentRepo.GetPaymentByID(ctx, paymentID)
}

func (s *PaymentService) PaymentHistory(ctx context.Context, userID string) ([]*model.Payment, error) {
	return s.paymentRepo.ListPaymentsByUser(ctx, userID)
}

func (s *PaymentService) ListPayments(ctx context.Context) ([]*model.Payment, error) {
	return s.paymentRepo.ListPayments(ctx)
}

func (s *PaymentService) useCoupon(ctx context.Context, code string) {
	if code == "" {
		return
	}
	if err := s.couponRepo.UseCoupon(ctx, code); err != nil {
		log.Printf("Cannot update coupon usage: %v", err)
	}
}

func (s *PaymentService) publishPaymentSuccess(ctx context.Context, payment *model.Payment) {
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
