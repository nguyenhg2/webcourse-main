package router

import (
	"payment-service/internal/handler"
	"payment-service/internal/middleware"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/mongo"
)

func SetupRouter(db *mongo.Database, rc *redis.Client) *gin.Engine {
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())

	api := r.Group("/api")
	api.Use(middleware.JWTAuth("dev-secret")) // TODO: from cfg

	handler.RegisterPaymentHandlers(api.Group("/payments"), db, rc)
	handler.RegisterCouponHandlers(api.Group("/coupons"), db)

	return r
}
