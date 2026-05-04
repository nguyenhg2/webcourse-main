package service

import (
	"context"
	"encoding/json"
	"log"
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
}

func NewPaymentService(pr *repository.PaymentRepo, cr *repository.CouponRepo, rc *redis.Client) *PaymentService {
	stripe.Key = "sk_test..."
	return &PaymentService{
		paymentRepo: pr,
		couponRepo:  cr,
		redisClient: rc,
	}
}

func (s *PaymentService) CreatePaymentIntent(ctx context.Context, userID string, req model.PaymentRequest) (*model.PaymentResponse, error) {
	// TODO: Get real total from core-service or cache
	amount := int64(599000)
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

	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(finalAmount * 100), // cents
		Currency: stripe.String("vnd"),
	}

	intent, err := paymentintent.New(params)
	if err != nil {
		return nil, err
	}

	// Save payment record
	payment := &model.Payment{
		ID:              primitive.NewObjectID(),
		UserID:          userID,
		CourseIDs:       req.CourseIDs,
		Amount:          amount,
		CouponCode:      req.CouponCode,
		CouponDiscount:  couponDiscount,
		CardLast4:       "", // update after confirm
		CardBrand:       "",
		Status:          "pending",
		StripePaymentID: intent.ID,
		CreatedAt:       time.Now().Unix(),
	}

	err = s.paymentRepo.CreatePayment(ctx, payment)
	if err != nil {
		return nil, err
	}

	return &model.PaymentResponse{
		ClientSecret: intent.ClientSecret,
		PaymentID:    payment.ID.Hex(),
	}, nil
}

func (s *PaymentService) PaymentSuccess(ctx context.Context, paymentID string, cardLast4, cardBrand string) error {
	// Update payment status
	update := bson.M{
		"status":     "completed",
		"card_last4": cardLast4,
		"card_brand": cardBrand,
		"updated_at": time.Now().Unix(),
	}

	if err := s.paymentRepo.UpdatePayment(ctx, paymentID, update); err != nil {
		log.Printf("Update payment error: %v", err)
	}

	// TODO: get real user/course from payment doc
	data, _ := json.Marshal(map[string]interface{}{
		"user_id":    "user123", // fetch from payment.UserID
		"course_ids": []string{"course1"},
		"payment_id": paymentID,
	})

	err := s.redisClient.Publish(ctx, "payment.success", data).Err()
	if err != nil {
		log.Printf("Redis publish error: %v", err)
	}

	return nil
}
