package coupon

import "go.mongodb.org/mongo-driver/bson/primitive"

type Coupon struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Code      string             `bson:"code" json:"code"`
	Type      string             `bson:"type" json:"type"`
	Discount  int64              `bson:"discount" json:"discount"`
	Active    bool               `bson:"active" json:"active"`
	Expiry    int64              `bson:"expiry" json:"expiry"`
	MaxUses   int64              `bson:"max_uses,omitempty" json:"max_uses"`
	UsedCount int64              `bson:"used_count,omitempty" json:"used_count"`
}

type ValidateRequest struct {
	Code   string `json:"code"`
	Amount int64  `json:"amount"`
}

type CreateRequest struct {
	Code     string `json:"code"`
	Type     string `json:"type"`
	Discount int64  `json:"discount"`
	Active   bool   `json:"active"`
	Expiry   int64  `json:"expiry"`
	MaxUses  int64  `json:"max_uses,omitempty"`
}

type ActiveRequest struct {
	Active bool `json:"active"`
}
