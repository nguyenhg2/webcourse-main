package model

import "go.mongodb.org/mongo-driver/bson/primitive"

type Coupon struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Code     string             `bson:"code" json:"code"`
	Discount int64              `bson:"discount" json:"discount"`
	Type     string             `bson:"type" json:"type"` // "percentage" or "fixed"
	MaxUses  int64              `bson:"max_uses" json:"max_uses"`
	Used     int64              `bson:"used" json:"used"`
	Expiry   int64              `bson:"expiry" json:"expiry"`
	Active   bool               `bson:"active" json:"active"`
}

type ValidateCouponRequest struct {
	Code   string `json:"code"`
	Amount int64  `json:"amount"`
}
