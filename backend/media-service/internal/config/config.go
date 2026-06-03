package config

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	JWTSecret        string
	CloudinaryCloud  string
	CloudinaryKey    string
	CloudinarySecret string
	Port             string
}

func Load() *Config {
	_ = godotenv.Load(".env", "../../.env")

	return &Config{
		JWTSecret:        getEnv("JWT_SECRET", "dev-secret"),
		CloudinaryCloud:  getEnv("CLOUDINARY_CLOUD_NAME", ""),
		CloudinaryKey:    getEnv("CLOUDINARY_API_KEY", ""),
		CloudinarySecret: getEnv("CLOUDINARY_API_SECRET", ""),
		Port:             getEnv("PORT", "8004"),
	}
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok && strings.TrimSpace(value) != "" {
		return value
	}
	return fallback
}
