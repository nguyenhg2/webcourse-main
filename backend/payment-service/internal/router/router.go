package router

import (
	"payment-service/internal/config"
	"payment-service/internal/coupon"
	"payment-service/internal/middleware"
	"payment-service/internal/payment"
	"payment-service/internal/video"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/mongo"
)

func SetupRouter(db *mongo.Database, rc *redis.Client, cfg *config.Config) *gin.Engine {
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())

	publicAPI := r.Group("/api")
	video.RegisterPublicRoutes(publicAPI.Group("/videos"), cfg)

	api := r.Group("/api")
	api.Use(middleware.JWTAuth(cfg.JWTSecret))

	payment.RegisterRoutes(api.Group("/payments"), db, rc)
	coupon.RegisterRoutes(api.Group("/coupons"), db)
	video.RegisterRoutes(api.Group("/videos", middleware.RequireRole("admin", "instructor")), cfg)
	video.RegisterFileRoutes(api.Group("/files", middleware.RequireRole("admin", "instructor")), cfg)
	video.RegisterSignedRoutes(api.Group("/video"), cfg)

	return r
}
