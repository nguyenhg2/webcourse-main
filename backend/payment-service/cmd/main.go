package main

import (
	"context"
	"log"

	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"payment-service/internal/config"
	"payment-service/internal/router"
)

func main() {
	cfg := config.Load()

	ctx := context.Background()

	// MongoDB
	clientOptions := options.Client().ApplyURI(cfg.MongoURI)
	mongoClient, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("Mongo connect error:", err)
	}
	db := mongoClient.Database("codecamp_payment")

	// Redis
	rdb := redis.NewClient(&redis.Options{Addr: "localhost:6379"})
	if _, err := rdb.Ping(ctx).Result(); err != nil {
		log.Fatal("Redis connect error:", err)
	}

	r := router.SetupRouter(db, rdb)

	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
