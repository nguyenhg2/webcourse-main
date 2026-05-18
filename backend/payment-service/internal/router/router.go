package router

import (
	"payment-service/internal/config"
	"payment-service/internal/handler"
	"payment-service/internal/middleware"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/mongo"
)

func SetupRouter(db *mongo.Database, rc *redis.Client, cfg *config.Config) *gin.Engine {
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())

	publicAPI := r.Group("/api")
	handler.RegisterPublicVideoHandlers(publicAPI.Group("/videos"), cfg)

	api := r.Group("/api")
	api.Use(middleware.JWTAuth(cfg.JWTSecret))

	handler.RegisterPaymentHandlers(api.Group("/payments"), db, rc)
	handler.RegisterCouponHandlers(api.Group("/coupons"), db)
	handler.RegisterVideoHandlers(api.Group("/videos", middleware.RequireRole("admin", "instructor")), cfg)
	handler.RegisterSignedVideoHandlers(api.Group("/video"), cfg)

	return r
}
