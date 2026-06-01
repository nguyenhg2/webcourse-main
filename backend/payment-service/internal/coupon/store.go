package coupon

import (
	"context"
	"errors"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Store struct {
	collection *mongo.Collection
}

func NewStore(db *mongo.Database) *Store {
	return &Store{
		collection: db.Collection("coupons"),
	}
}

func (s *Store) FindValid(ctx context.Context, code string) (*Coupon, error) {
	code = strings.ToUpper(strings.TrimSpace(code))
	filter := bson.M{
		"code":   code,
		"active": true,
		"expiry": bson.M{"$gte": time.Now().Unix()},
	}

	var coupon Coupon
	err := s.collection.FindOne(ctx, filter).Decode(&coupon)
	return &coupon, err
}

func (s *Store) ListActive(ctx context.Context) ([]*Coupon, error) {
	filter := bson.M{
		"active": true,
		"expiry": bson.M{"$gte": time.Now().Unix()},
	}
	opts := options.Find().SetSort(bson.D{{Key: "code", Value: 1}})
	cursor, err := s.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var coupons []*Coupon
	if err := cursor.All(ctx, &coupons); err != nil {
		return nil, err
	}
	return coupons, nil
}

func (s *Store) ListAll(ctx context.Context) ([]*Coupon, error) {
	opts := options.Find().SetSort(bson.D{{Key: "active", Value: -1}, {Key: "code", Value: 1}})
	cursor, err := s.collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var coupons []*Coupon
	if err := cursor.All(ctx, &coupons); err != nil {
		return nil, err
	}
	return coupons, nil
}

func (s *Store) Create(ctx context.Context, coupon *Coupon) (*Coupon, error) {
	coupon.Code = strings.ToUpper(strings.TrimSpace(coupon.Code))
	coupon.Used = 0
	count, err := s.collection.CountDocuments(ctx, bson.M{"code": coupon.Code})
	if err != nil {
		return nil, err
	}
	if count > 0 {
		return nil, errors.New("mã giảm giá đã tồn tại")
	}
	result, err := s.collection.InsertOne(ctx, coupon)
	if err != nil {
		return nil, err
	}
	if id, ok := result.InsertedID.(primitive.ObjectID); ok {
		coupon.ID = id
	}
	return coupon, nil
}

func (s *Store) SetActive(ctx context.Context, id primitive.ObjectID, active bool) (*Coupon, error) {
	_, err := s.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": bson.M{"active": active}})
	if err != nil {
		return nil, err
	}

	var coupon Coupon
	if err := s.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&coupon); err != nil {
		return nil, err
	}
	return &coupon, nil
}

func (s *Store) Use(ctx context.Context, code string) error {
	code = strings.ToUpper(strings.TrimSpace(code))
	_, err := s.collection.UpdateOne(ctx,
		bson.M{"code": code},
		bson.M{"$inc": bson.M{"used": 1}},
	)
	return err
}
