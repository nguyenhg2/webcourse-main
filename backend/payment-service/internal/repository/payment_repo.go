package repository

import (
	"context"
	"time"

	"payment-service/internal/model"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type PaymentRepo struct {
	collection *mongo.Collection
}

func NewPaymentRepo(db *mongo.Database) *PaymentRepo {
	return &PaymentRepo{
		collection: db.Collection("payments"),
	}
}

func (r *PaymentRepo) CreatePayment(ctx context.Context, payment *model.Payment) error {
	payment.CreatedAt = time.Now().Unix()
	_, err := r.collection.InsertOne(ctx, payment)
	return err
}

func (r *PaymentRepo) GetPaymentByID(ctx context.Context, id string) (*model.Payment, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}
	var payment model.Payment
	err = r.collection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&payment)
	return &payment, err
}

func (r *PaymentRepo) UpdatePayment(ctx context.Context, id string, update bson.M) error {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return err
	}
	_, err = r.collection.UpdateOne(ctx, bson.M{"_id": objectID}, bson.M{"$set": update})
	return err
}

func (r *PaymentRepo) ListPaymentsByUser(ctx context.Context, userID string) ([]*model.Payment, error) {
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := r.collection.Find(ctx, bson.M{"user_id": userID}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var payments []*model.Payment
	if err := cursor.All(ctx, &payments); err != nil {
		return nil, err
	}
	return payments, nil
}

func (r *PaymentRepo) ListPayments(ctx context.Context) ([]*model.Payment, error) {
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := r.collection.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var payments []*model.Payment
	if err := cursor.All(ctx, &payments); err != nil {
		return nil, err
	}
	return payments, nil
}
