package router

import (
	"media-service/internal/config"
	"media-service/internal/media"
	"media-service/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter(cfg *config.Config) *gin.Engine {
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())

	api := r.Group("/api")
	api.Use(middleware.JWTAuth(cfg.JWTSecret))

	media.RegisterRoutes(api.Group("", middleware.RequireRole("admin", "instructor")), cfg)

	return r
}
