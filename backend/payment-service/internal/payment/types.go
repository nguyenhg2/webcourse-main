package payment

import "go.mongodb.org/mongo-driver/bson/primitive"

type Payment struct {
	ID              primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID          string             `bson:"user_id" json:"user_id"`
	UserEmail       string             `bson:"user_email,omitempty" json:"user_email,omitempty"`
	CourseIDs       []string           `bson:"course_ids" json:"course_ids"`
	Amount          int64              `bson:"amount" json:"amount"`
	OriginalAmount  int64              `bson:"original_amount" json:"original_amount"`
	DiscountAmount  int64              `bson:"discount_amount" json:"discount_amount"`
	FinalAmount     int64              `bson:"final_amount" json:"final_amount"`
	CouponCode      string             `bson:"coupon_code,omitempty" json:"coupon_code"`
	CouponDiscount  int64              `bson:"coupon_discount,omitempty" json:"coupon_discount"`
	Method          string             `bson:"method" json:"method"`
	CardLast4       string             `bson:"card_last4" json:"card_last4"`
	CardBrand       string             `bson:"card_brand" json:"card_brand"`
	Status          string             `bson:"status" json:"status"`
	StripePaymentID string             `bson:"stripe_payment_id,omitempty" json:"stripe_payment_id,omitempty"`
	BillingAddress  BillingAddress     `bson:"billing_address,omitempty" json:"billing_address,omitempty"`
	CreatedAt       int64              `bson:"created_at" json:"created_at"`
	UpdatedAt       int64              `bson:"updated_at" json:"updated_at"`
}

type PaymentRequest struct {
	CourseIDs      []string       `json:"course_ids"`
	Amount         int64          `json:"amount"`
	CouponCode     string         `json:"coupon_code,omitempty"`
	UserEmail      string         `json:"user_email,omitempty"`
	CardLast4      string         `json:"card_last4,omitempty"`
	CardBrand      string         `json:"card_brand,omitempty"`
	BillingAddress BillingAddress `json:"billing_address,omitempty"`
}

type PaymentResponse struct {
	ClientSecret    string `json:"client_secret,omitempty"`
	PaymentID       string `json:"payment_id"`
	StripePaymentID string `json:"stripe_payment_id,omitempty"`
	Amount          int64  `json:"amount"`
	Status          string `json:"status"`
}

type BillingAddress struct {
	Name       string `bson:"name,omitempty" json:"name,omitempty"`
	Email      string `bson:"email,omitempty" json:"email,omitempty"`
	Phone      string `bson:"phone,omitempty" json:"phone,omitempty"`
	Line1      string `bson:"line1,omitempty" json:"line1,omitempty"`
	Line2      string `bson:"line2,omitempty" json:"line2,omitempty"`
	City       string `bson:"city,omitempty" json:"city,omitempty"`
	State      string `bson:"state,omitempty" json:"state,omitempty"`
	PostalCode string `bson:"postal_code,omitempty" json:"postal_code,omitempty"`
	Country    string `bson:"country,omitempty" json:"country,omitempty"`
}
