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
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"service": "media", "status": "ok"})
	})

	api := r.Group("/api")
	api.Use(middleware.JWTAuth(cfg.JWTSecret))

	media.RegisterRoutes(api.Group("", middleware.RequireRole("admin", "instructor")), cfg)

	return r
}
