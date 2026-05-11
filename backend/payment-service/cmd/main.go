package main

import (
	"context"
	"log"
	"strings"

	"github.com/redis/go-redis/v9"
	"github.com/stripe/stripe-go/v81"
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
	db := mongoClient.Database("codecamp_payment")

	redisAddr := strings.TrimPrefix(cfg.RedisURL, "redis://")
	rdb := redis.NewClient(&redis.Options{Addr: redisAddr})
	if _, err := rdb.Ping(ctx).Result(); err != nil {
		log.Println("Redis is not ready, payment events will be skipped:", err)
		rdb = nil
	}

	stripe.Key = cfg.StripeKey

	r := router.SetupRouter(db, rdb, cfg)

	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
