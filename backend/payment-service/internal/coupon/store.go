package coupon

import (
	"context"
	"errors"
	"sort"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type Store struct {
	collection *mongo.Collection
}

func NewStore(db *mongo.Database) *Store {
	return &Store{collection: db.Collection("coupons")}
}

func (s *Store) List(ctx context.Context) ([]CouponResponse, error) {
	cursor, err := s.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var docs []Coupon
	if err := cursor.All(ctx, &docs); err != nil {
		return nil, err
	}

	coupons := make([]CouponResponse, 0, len(docs))
	for _, doc := range docs {
		coupons = append(coupons, doc.response())
	}
	sortCoupons(coupons)

	return coupons, nil
}

func (s *Store) Create(ctx context.Context, req CreateRequest) (*CouponResponse, error) {
	coupon, err := newCoupon(req)
	if err != nil {
		return nil, err
	}

	if exists, err := s.exists(ctx, coupon.Code); err != nil {
		return nil, err
	} else if exists {
		return nil, errors.New("coupon already exists")
	}

	result, err := s.collection.InsertOne(ctx, coupon)
	if err != nil {
		return nil, err
	}
	if id, ok := result.InsertedID.(primitive.ObjectID); ok {
		coupon.ID = id
	}

	response := coupon.response()
	return &response, nil
}

func (s *Store) SetActive(ctx context.Context, id string, active bool) (*CouponResponse, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("invalid coupon id")
	}

	result, err := s.collection.UpdateOne(
		ctx,
		bson.M{"_id": objectID},
		bson.M{"$set": bson.M{"active": active, "is_active": active}},
	)
	if err != nil {
		return nil, err
	}
	if result.MatchedCount == 0 {
		return nil, mongo.ErrNoDocuments
	}

	return s.getByObjectID(ctx, objectID)
}

func (s *Store) Discount(ctx context.Context, code string, amount int64) (int64, bool) {
	coupon, err := s.findValid(ctx, code, amount)
	if err != nil {
		return 0, false
	}
	return coupon.discountFor(amount), true
}

func (s *Store) Use(ctx context.Context, code string, discount int64) error {
	code = NormalizeCode(code)
	if code == "" || discount <= 0 {
		return nil
	}

	_, err := s.collection.UpdateOne(
		ctx,
		bson.M{"code": code},
		bson.M{"$inc": bson.M{"used_count": 1, "used": 1}},
	)
	return err
}

func (s *Store) exists(ctx context.Context, code string) (bool, error) {
	count, err := s.collection.CountDocuments(ctx, bson.M{"code": code})
	return count > 0, err
}

func (s *Store) findValid(ctx context.Context, code string, amount int64) (*Coupon, error) {
	var coupon Coupon
	err := s.collection.FindOne(ctx, bson.M{"code": NormalizeCode(code)}).Decode(&coupon)
	if err != nil {
		return nil, err
	}
	if !coupon.validFor(amount) {
		return nil, mongo.ErrNoDocuments
	}
	return &coupon, nil
}

func (s *Store) getByObjectID(ctx context.Context, id primitive.ObjectID) (*CouponResponse, error) {
	var coupon Coupon
	if err := s.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&coupon); err != nil {
		return nil, err
	}

	response := coupon.response()
	return &response, nil
}

func sortCoupons(coupons []CouponResponse) {
	sort.SliceStable(coupons, func(i, j int) bool {
		if coupons[i].Active != coupons[j].Active {
			return coupons[i].Active
		}
		return coupons[i].Code < coupons[j].Code
	})
}
