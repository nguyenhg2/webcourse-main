package router

import (
	"payment-service/internal/config"
	"payment-service/internal/coupon"
	"payment-service/internal/middleware"
	"payment-service/internal/payment"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func SetupRouter(db *mongo.Database, cfg *config.Config) *gin.Engine {
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())

	api := r.Group("/api")
	api.Use(middleware.JWTAuth(cfg.JWTSecret))

	couponStore := coupon.NewStore(db)
	coupon.RegisterRoutes(api.Group("/coupons"), couponStore)
	payment.RegisterRoutes(api.Group("/payments"), db, couponStore, cfg.StripeSecretKey, middleware.RequireInternalToken(cfg.InternalToken))

	return r
}
