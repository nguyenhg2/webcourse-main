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
	loadEnvFiles(".env", "../../.env")

	return &Config{
		JWTSecret:        getEnv("JWT_SECRET", "dev-secret"),
		CloudinaryCloud:  getEnv("CLOUDINARY_CLOUD_NAME", ""),
		CloudinaryKey:    getEnv("CLOUDINARY_API_KEY", ""),
		CloudinarySecret: getEnv("CLOUDINARY_API_SECRET", ""),
		Port:             getEnv("PORT", "8004"),
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
