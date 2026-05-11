package model

import "go.mongodb.org/mongo-driver/bson/primitive"

type Payment struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID          string             `bson:"user_id" json:"user_id"`
	CourseIDs       []string           `bson:"course_ids" json:"course_ids"`
	Amount          int64              `bson:"amount" json:"amount"`
	CouponCode      string             `bson:"coupon_code,omitempty" json:"coupon_code"`
	CouponDiscount  int64              `bson:"coupon_discount,omitempty" json:"coupon_discount"`
	CardLast4       string             `bson:"card_last4" json:"card_last4"`
	CardBrand       string             `bson:"card_brand" json:"card_brand"`
	Status          string             `bson:"status" json:"status"`
	StripePaymentID string             `bson:"stripe_payment_id" json:"stripe_payment_id"`
	CreatedAt       int64              `bson:"created_at" json:"created_at"`
}

type PaymentRequest struct {
	CourseIDs  []string `json:"course_ids"`
	CouponCode string   `json:"coupon_code,omitempty"`
	Amount     int64    `json:"amount,omitempty"`
}

type PaymentResponse struct {
	ClientSecret string `json:"client_secret"`
	PaymentID    string `json:"payment_id"`
	Amount       int64  `json:"amount"`
	Status       string `json:"status"`
}

type ConfirmPaymentRequest struct {
	PaymentID string `json:"payment_id"`
}
