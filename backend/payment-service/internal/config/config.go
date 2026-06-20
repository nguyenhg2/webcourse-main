package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	MongoURI            string
	PaymentDB           string
	JWTSecret           string
	InternalToken       string
	StripeSecretKey     string
	StripeWebhookSecret string
	RedisURL            string
	Port                string
}

func Load() *Config {
	_ = godotenv.Load(".env", "../../.env")
	loadEnvFiles(".env", "../../.env")

	return &Config{
		MongoURI:            requiredEnv("MONGODB_URI"),
		PaymentDB:           getEnv("PAYMENT_MONGODB_DB", "codecamp_payment"),
		JWTSecret:           getEnv("JWT_SECRET", "dev-secret"),
		InternalToken:       getEnv("PAYMENT_INTERNAL_TOKEN", "dev-internal-token"),
		StripeSecretKey:     requiredEnv("STRIPE_SECRET_KEY"),
		StripeWebhookSecret: getEnv("STRIPE_WEBHOOK_SECRET", ""),
		RedisURL:            getEnv("REDIS_URL", ""),
		Port:                getEnv("PORT", "8002"),
	}
}

func loadEnvFiles(paths ...string) {
	for _, path := range paths {
		data, err := os.ReadFile(path)
		if err != nil {
			continue
		}

		for _, line := range strings.Split(string(data), "\n") {
			line = strings.TrimSpace(strings.TrimPrefix(line, "\ufeff"))
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}

			key, value, ok := strings.Cut(line, "=")
			if !ok {
				continue
			}

			key = strings.TrimSpace(strings.TrimPrefix(key, "\ufeff"))
			if key == "" {
				continue
			}
			if _, exists := os.LookupEnv(key); !exists {
				_ = os.Setenv(key, strings.TrimSpace(value))
			}
		}
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
		log.Fatalf("%s là bắt buộc", key)
	}
	return value
}
