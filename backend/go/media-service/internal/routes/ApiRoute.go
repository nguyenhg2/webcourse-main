package routes

import (
	"media-service/internal/config"
	"media-service/internal/controllers"
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

	controllers.RegisterMediaRoutes(api.Group("", middleware.RequireRole("admin", "instructor")), cfg)
	controllers.RegisterSignedURLRoute(api.Group(""), cfg)

	internal := r.Group("/internal")
	internal.Use(middleware.RequireInternalToken(cfg.InternalToken))
	controllers.RegisterInternalMediaRoutes(internal, cfg)

	return r
}
