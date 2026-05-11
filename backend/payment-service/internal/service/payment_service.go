package service

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"sync"
	"time"

	"payment-service/internal/model"
	"payment-service/internal/repository"

	"github.com/redis/go-redis/v9"
	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/paymentintent"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PaymentService struct {
	paymentRepo *repository.PaymentRepo
	couponRepo  *repository.CouponRepo
	redisClient *redis.Client
	cache       map[string]*model.Payment
	mu          sync.RWMutex
}

func NewPaymentService(pr *repository.PaymentRepo, cr *repository.CouponRepo, rc *redis.Client) *PaymentService {
	return &PaymentService{
		paymentRepo: pr,
		couponRepo:  cr,
		redisClient: rc,
		cache:       map[string]*model.Payment{},
	}
}

func (s *PaymentService) CreatePaymentIntent(ctx context.Context, userID string, req model.PaymentRequest) (*model.PaymentResponse, error) {
	amount := int64(599000)
	if req.Amount > 0 {
		amount = req.Amount
	}
	couponDiscount := int64(0)

	if req.CouponCode != "" {
		coupon, err := s.couponRepo.ValidateCoupon(ctx, req.CouponCode)
		if err != nil {
			return nil, err
		}
		couponDiscount = coupon.Discount
		s.couponRepo.UseCoupon(ctx, req.CouponCode)
	}

	finalAmount := amount - couponDiscount
	if finalAmount < 1000 {
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

	payment := &model.Payment{
		ID:              primitive.NewObjectID(),
		UserID:          userID,
		CourseIDs:       req.CourseIDs,
		Amount:          amount,
		CouponCode:      req.CouponCode,
		CouponDiscount:  couponDiscount,
		CardLast4:       "",
		CardBrand:       "",
		Status:          "pending",
		StripePaymentID: intent.ID,
		CreatedAt:       time.Now().Unix(),
	}

	s.mu.Lock()
	s.cache[payment.ID.Hex()] = payment
	s.mu.Unlock()

	if err := s.paymentRepo.CreatePayment(ctx, payment); err != nil {
		log.Printf("Mongo save payment error: %v", err)
	}

	return &model.PaymentResponse{
		ClientSecret: intent.ClientSecret,
		PaymentID:    payment.ID.Hex(),
		Amount:       finalAmount,
		Status:       payment.Status,
	}, nil
}

func (s *PaymentService) PaymentSuccess(ctx context.Context, paymentID string, cardLast4, cardBrand string) error {
	payment, err := s.findPayment(ctx, paymentID)
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
		log.Printf("Mongo update payment error: %v", err)
	}

	s.mu.Lock()
	if cached, ok := s.cache[paymentID]; ok {
		cached.Status = "completed"
		cached.CardLast4 = cardLast4
		cached.CardBrand = cardBrand
	}
	s.mu.Unlock()

	if s.redisClient == nil {
		return nil
	}

	data, _ := json.Marshal(map[string]interface{}{
		"user_id":    payment.UserID,
		"course_ids": payment.CourseIDs,
		"payment_id": paymentID,
	})

	err = s.redisClient.Publish(ctx, "payment.success", data).Err()
	if err != nil {
		log.Printf("Redis publish error: %v", err)
	}

	return nil
}

func (s *PaymentService) ConfirmTestPayment(ctx context.Context, paymentID string) error {
	payment, err := s.findPayment(ctx, paymentID)
	if err != nil {
		return err
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

func (s *PaymentService) GetPayment(ctx context.Context, paymentID string) (*model.Payment, error) {
	return s.findPayment(ctx, paymentID)
}

func (s *PaymentService) PaymentHistory(ctx context.Context, userID string) ([]*model.Payment, error) {
	payments, err := s.paymentRepo.ListPaymentsByUser(ctx, userID)
	if err == nil {
		return payments, nil
	}

	s.mu.RLock()
	defer s.mu.RUnlock()

	list := []*model.Payment{}
	for _, payment := range s.cache {
		if payment.UserID == userID {
			list = append(list, payment)
		}
	}
	return list, nil
}

func (s *PaymentService) findPayment(ctx context.Context, paymentID string) (*model.Payment, error) {
	payment, err := s.paymentRepo.GetPaymentByID(ctx, paymentID)
	if err == nil {
		return payment, nil
	}

	s.mu.RLock()
	defer s.mu.RUnlock()

	if payment, ok := s.cache[paymentID]; ok {
		return payment, nil
	}

	return nil, err
}
