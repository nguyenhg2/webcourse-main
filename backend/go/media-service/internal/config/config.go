package config

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	JWTSecret         string
	InternalToken     string
	R2AccountID       string
	R2AccessKeyID     string
	R2SecretAccessKey string
	R2Bucket          string
	R2Endpoint        string
	R2PublicBaseURL   string
	R2SignedURLTTL    int
	Port              string
}

func Load() *Config {
	_ = godotenv.Load(".env", "../../.env")
	loadEnvFiles(".env", "../../.env")

	accountID := getEnv("R2_ACCOUNT_ID", "")
	endpoint := getEnv("R2_ENDPOINT", "")
	if endpoint == "" && accountID != "" {
		endpoint = "https://" + accountID + ".r2.cloudflarestorage.com"
	}

	return &Config{
		JWTSecret:         getEnv("JWT_SECRET", "dev-secret"),
		InternalToken:     getEnv("MEDIA_INTERNAL_TOKEN", "dev-internal-token"),
		R2AccountID:       accountID,
		R2AccessKeyID:     getEnv("R2_ACCESS_KEY_ID", ""),
		R2SecretAccessKey: getEnv("R2_SECRET_ACCESS_KEY", ""),
		R2Bucket:          getEnv("R2_BUCKET", ""),
		R2Endpoint:        endpoint,
		R2PublicBaseURL:   strings.TrimRight(getEnv("R2_PUBLIC_BASE_URL", ""), "/"),
		R2SignedURLTTL:    getEnvInt("R2_SIGNED_URL_TTL_SECONDS", 600),
		Port:              getEnv("PORT", "8004"),
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

func getEnvInt(key string, fallback int) int {
	value := strings.TrimSpace(getEnv(key, ""))
	if value == "" {
		return fallback
	}
	number := 0
	for _, char := range value {
		if char < '0' || char > '9' {
			return fallback
		}
		number = number*10 + int(char-'0')
	}
	if number <= 0 {
		return fallback
	}
	return number
}
