package router

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"media-service/internal/config"
)

func TestHealthRoute(t *testing.T) {
	r := SetupRouter(&config.Config{})
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/health", nil)

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
}
