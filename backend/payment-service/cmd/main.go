package main

import (
	"context"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/bson"
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
	if err := ensureIndexes(ctx, db); err != nil {
		log.Fatal("Mongo index error:", err)
	}

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

func ensureIndexes(ctx context.Context, db *mongo.Database) error {
	_, err := db.Collection("payments").Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "created_at", Value: -1}}},
		{Keys: bson.D{{Key: "user_id", Value: 1}, {Key: "created_at", Value: -1}}},
		{Keys: bson.D{{Key: "stripe_payment_id", Value: 1}}},
	})
	if err != nil {
		return err
	}

	_, err = db.Collection("coupons").Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "code", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	return err
}
