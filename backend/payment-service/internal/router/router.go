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

func SetupRouter(db *mongo.Database, cfg *config.Config, redisClient *redis.Client) *gin.Engine {
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"service": "payment", "status": "ok"})
	})

	payment.RegisterWebhookRoute(r.Group("/api/payments"), db, cfg.StripeWebhookSecret, redisClient)

	api := r.Group("/api")
	api.Use(middleware.JWTAuth(cfg.JWTSecret))

	coupon.RegisterRoutes(api.Group("/coupons"), db, middleware.RequireRole("admin"))
	payment.RegisterRoutes(api.Group("/payments"), db, cfg.StripeSecretKey, middleware.RequireInternalToken(cfg.InternalToken), redisClient)

	return r
}
