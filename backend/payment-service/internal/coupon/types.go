package coupon

import "go.mongodb.org/mongo-driver/bson/primitive"

type Coupon struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Code          string             `bson:"code" json:"code"`
	DiscountType  string             `bson:"discount_type,omitempty" json:"discount_type,omitempty"`
	DiscountValue int64              `bson:"discount_value,omitempty" json:"discount_value,omitempty"`
	MinOrder      int64              `bson:"min_order,omitempty" json:"min_order,omitempty"`
	MaxDiscount   int64              `bson:"max_discount,omitempty" json:"max_discount,omitempty"`
	MaxUses       int64              `bson:"max_uses" json:"max_uses"`
	UsedCount     int64              `bson:"used_count,omitempty" json:"used_count,omitempty"`
	ExpiresAt     int64              `bson:"expires_at,omitempty" json:"expires_at,omitempty"`
	IsActive      *bool              `bson:"is_active,omitempty" json:"is_active,omitempty"`

	// These old field names are kept for coupons already saved in MongoDB.
	Type     string `bson:"type,omitempty" json:"type,omitempty"`
	Discount int64  `bson:"discount,omitempty" json:"discount,omitempty"`
	Used     int64  `bson:"used,omitempty" json:"used,omitempty"`
	Expiry   int64  `bson:"expiry,omitempty" json:"expiry,omitempty"`
	Active   *bool  `bson:"active,omitempty" json:"active,omitempty"`
}

type ValidateRequest struct {
	Code   string `json:"code"`
	Amount int64  `json:"amount"`
}

type CreateRequest struct {
	Code     string `json:"code"`
	Type     string `json:"type"`
	Discount int64  `json:"discount"`
	MaxUses  int64  `json:"max_uses"`
	Expiry   int64  `json:"expiry"`
	Active   bool   `json:"active"`
}

type ActiveRequest struct {
	Active bool `json:"active"`
}

type CouponResponse struct {
	ID       string `json:"id"`
	Code     string `json:"code"`
	Type     string `json:"type"`
	Discount int64  `json:"discount"`
	MaxUses  int64  `json:"max_uses"`
	Used     int64  `json:"used"`
	Expiry   int64  `json:"expiry"`
	Active   bool   `json:"active"`
}
