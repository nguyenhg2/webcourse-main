package repository

import (
	"context"
	"time"

	"payment-service/internal/model"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
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
	var payment model.Payment
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&payment)
	return &payment, err
}

func (r *PaymentRepo) UpdatePayment(ctx context.Context, id string, update bson.M) error {
	_, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": update})
	return err
}
