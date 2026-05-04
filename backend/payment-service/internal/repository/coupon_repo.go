package repository

import (
	"context"
	"time"

	"payment-service/internal/model"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type CouponRepo struct {
	collection *mongo.Collection
}

func NewCouponRepo(db *mongo.Database) *CouponRepo {
	return &CouponRepo{
		collection: db.Collection("coupons"),
	}
}

func (r *CouponRepo) ValidateCoupon(ctx context.Context, code string) (*model.Coupon, error) {
	filter := bson.M{
		"code":   code,
		"active": true,
		"used":   bson.M{"$lte": "$max_uses"},
		"expiry": bson.M{"$gte": time.Now().Unix()},
	}

	var coupon model.Coupon
	err := r.collection.FindOne(ctx, filter).Decode(&coupon)
	return &coupon, err
}

func (r *CouponRepo) UseCoupon(ctx context.Context, code string) error {
	_, err := r.collection.UpdateOne(ctx,
		bson.M{"code": code},
		bson.M{"$inc": bson.M{"used": 1}},
	)
	return err
}
