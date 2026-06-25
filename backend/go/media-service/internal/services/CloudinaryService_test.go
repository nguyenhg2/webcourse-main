package services

import (
	"errors"
	"net/http"
	"testing"

	"media-service/internal/config"
	"media-service/internal/models"
)

func TestEnsureCloudinaryConfig(t *testing.T) {
	err := EnsureCloudinaryConfig(&config.Config{})
	var apiErr models.APIError
	if !errors.As(err, &apiErr) || apiErr.Status != http.StatusInternalServerError {
		t.Fatal("missing Cloudinary config should return api error")
	}

	err = EnsureCloudinaryConfig(&config.Config{
		CloudinaryCloud:  "cloud",
		CloudinaryKey:    "key",
		CloudinarySecret: "secret",
	})
	if err != nil {
		t.Fatal(err)
	}
}
