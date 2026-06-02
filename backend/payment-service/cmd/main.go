package main

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"payment-service/internal/config"
	"payment-service/internal/router"
)

func main() {
	cfg := config.Load()

	ctx := context.Background()

	clientOptions := options.Client().ApplyURI(cfg.MongoURI)
	mongoClient, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("Mongo connect error:", err)
	}
	db := mongoClient.Database(cfg.PaymentDB)

	r := router.SetupRouter(db, cfg)

	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
