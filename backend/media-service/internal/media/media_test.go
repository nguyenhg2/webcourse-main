package media

import (
	"errors"
	"net/http"
	"testing"

	"media-service/internal/config"
)

func TestEnsureCloudinaryConfig(t *testing.T) {
	err := ensureCloudinaryConfig(&config.Config{})
	var apiErr apiError
	if !errors.As(err, &apiErr) || apiErr.Status != http.StatusInternalServerError {
		t.Fatal("missing Cloudinary config should return api error")
	}

	err = ensureCloudinaryConfig(&config.Config{CloudinaryCloud: "cloud", CloudinaryKey: "key", CloudinarySecret: "secret"})
	if err != nil {
		t.Fatal(err)
	}
}
