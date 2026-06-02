package router

import (
	"payment-service/internal/config"
	"payment-service/internal/coupon"
	"payment-service/internal/middleware"
	"payment-service/internal/payment"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/mongo"
)

func SetupRouter(db *mongo.Database, rc *redis.Client, cfg *config.Config) *gin.Engine {
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())

	api := r.Group("/api")
	api.Use(middleware.JWTAuth(cfg.JWTSecret))

	payment.RegisterRoutes(api.Group("/payments"), db, rc)
	coupon.RegisterRoutes(api.Group("/coupons"), db)

	return r
}
