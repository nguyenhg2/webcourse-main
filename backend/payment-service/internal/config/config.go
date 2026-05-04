package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	MongoURI  string
	JWTSecret string
	RedisURL  string
	StripeKey string
	Port      string
}

func Load() *Config {
	if err := godotenv.Load("../../.env"); err != nil {
		log.Println("No .env file found")
	}

	return &Config{
		MongoURI:  getEnv("MONGODB_URI", "mongodb://mongo:27017/codecamp_payment"),
		JWTSecret: getEnv("JWT_SECRET", "dev-secret"),
		RedisURL:  getEnv("REDIS_URL", "redis://localhost:6379"),
		StripeKey: getEnv("STRIPE_SECRET_KEY", "sk_test_..."),
		Port:      getEnv("PORT", "8002"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}
