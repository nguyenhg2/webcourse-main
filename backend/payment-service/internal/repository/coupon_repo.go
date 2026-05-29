package repository

import (
	"context"
	"errors"
	"strings"
	"time"

	"payment-service/internal/model"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
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

func (r *CouponRepo) ListCoupons(ctx context.Context) ([]*model.Coupon, error) {
	opts := options.Find().SetSort(bson.D{{Key: "active", Value: -1}, {Key: "code", Value: 1}})
	cursor, err := r.collection.Find(ctx, bson.M{}, opts)
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

func (r *CouponRepo) CreateCoupon(ctx context.Context, coupon *model.Coupon) (*model.Coupon, error) {
	coupon.Code = strings.ToUpper(strings.TrimSpace(coupon.Code))
	coupon.Used = 0
	count, err := r.collection.CountDocuments(ctx, bson.M{"code": coupon.Code})
	if err != nil {
		return nil, err
	}
	if count > 0 {
		return nil, errors.New("coupon code already exists")
	}
	result, err := r.collection.InsertOne(ctx, coupon)
	if err != nil {
		return nil, err
	}
	if id, ok := result.InsertedID.(primitive.ObjectID); ok {
		coupon.ID = id
	}
	return coupon, nil
}

func (r *CouponRepo) SetCouponActive(ctx context.Context, id primitive.ObjectID, active bool) (*model.Coupon, error) {
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": bson.M{"active": active}})
	if err != nil {
		return nil, err
	}

	var coupon model.Coupon
	if err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&coupon); err != nil {
		return nil, err
	}
	return &coupon, nil
}

func (r *CouponRepo) UseCoupon(ctx context.Context, code string) error {
	code = strings.ToUpper(strings.TrimSpace(code))
	_, err := r.collection.UpdateOne(ctx,
		bson.M{"code": code},
		bson.M{"$inc": bson.M{"used": 1}},
	)
	return err
}
