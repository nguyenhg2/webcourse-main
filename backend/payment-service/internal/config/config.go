package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	MongoURI  string
	PaymentDB string
	JWTSecret string
	RedisURL  string
	StripeKey string
	Port      string
}

func Load() *Config {
	_ = godotenv.Load(".env", "../../.env")

	return &Config{
		MongoURI:  requiredEnv("MONGODB_URI"),
		PaymentDB: getEnv("PAYMENT_MONGODB_DB", "codecamp_payment"),
		JWTSecret: getEnv("JWT_SECRET", "dev-secret"),
		RedisURL:  getEnv("REDIS_URL", "localhost:6379"),
		StripeKey: getEnv("STRIPE_SECRET_KEY", ""),
		Port:      getEnv("PORT", "8002"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok && strings.TrimSpace(value) != "" {
		return value
	}
	return fallback
}

func requiredEnv(key string) string {
	value, ok := os.LookupEnv(key)
	if !ok || strings.TrimSpace(value) == "" {
		log.Fatalf("%s is required; set it to the MongoDB Atlas connection string", key)
	}
	return value
}
