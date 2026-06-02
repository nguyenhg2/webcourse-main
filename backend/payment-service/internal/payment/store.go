package payment

import (
	"context"

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
		collection: db.Collection("payments"),
	}
}

func (s *Store) Create(ctx context.Context, payment *Payment) error {
	_, err := s.collection.InsertOne(ctx, payment)
	return err
}

func (s *Store) GetByID(ctx context.Context, id string) (*Payment, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	var payment Payment
	err = s.collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&payment)
	return &payment, err
}

func (s *Store) ListByUser(ctx context.Context, userID string) ([]*Payment, error) {
	return s.list(ctx, bson.M{"user_id": userID})
}

func (s *Store) ListAll(ctx context.Context) ([]*Payment, error) {
	return s.list(ctx, bson.M{})
}

func (s *Store) list(ctx context.Context, filter bson.M) ([]*Payment, error) {
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := s.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var payments []*Payment
	if err := cursor.All(ctx, &payments); err != nil {
		return nil, err
	}
	return payments, nil
}
