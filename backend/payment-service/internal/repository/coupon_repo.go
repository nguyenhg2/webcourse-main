package repository

import (
	"context"
	"strings"
	"time"

	"payment-service/internal/model"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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
	code = strings.ToUpper(strings.TrimSpace(code))
	filter := bson.M{
		"code":   code,
		"active": true,
		"expiry": bson.M{"$gte": time.Now().Unix()},
	}

	var coupon model.Coupon
	err := r.collection.FindOne(ctx, filter).Decode(&coupon)
	return &coupon, err
}

func (r *CouponRepo) ListActiveCoupons(ctx context.Context) ([]*model.Coupon, error) {
	filter := bson.M{
		"active": true,
		"expiry": bson.M{"$gte": time.Now().Unix()},
	}
	opts := options.Find().SetSort(bson.D{{Key: "code", Value: 1}})
	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var coupons []*model.Coupon
	if err := cursor.All(ctx, &coupons); err != nil {
		return nil, err
	}
	return coupons, nil
}

func (r *CouponRepo) UseCoupon(ctx context.Context, code string) error {
	code = strings.ToUpper(strings.TrimSpace(code))
	_, err := r.collection.UpdateOne(ctx,
		bson.M{"code": code},
		bson.M{"$inc": bson.M{"used": 1}},
	)
	return err
}
