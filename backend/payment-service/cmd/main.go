package main

import (
	"context"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"payment-service/internal/config"
	"payment-service/internal/router"
)

func main() {
	cfg := config.Load()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI(cfg.MongoURI))
	if err != nil {
		log.Fatal("Mongo connect error:", err)
	}
	defer mongoClient.Disconnect(context.Background())

	db := mongoClient.Database(cfg.PaymentDB)
	var redisClient *redis.Client
	if cfg.RedisURL != "" {
		redisOptions, err := redis.ParseURL(cfg.RedisURL)
		if err != nil {
			log.Fatal("Redis config error:", err)
		}
		redisClient = redis.NewClient(redisOptions)
		defer redisClient.Close()
	}

	r := router.SetupRouter(db, cfg, redisClient)
	log.Printf("payment service running on port %s", cfg.Port)

	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
