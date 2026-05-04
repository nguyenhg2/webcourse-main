package handler

import (
	"net/http"

	"payment-service/internal/model"
	"payment-service/internal/repository"
	"payment-service/internal/service"

	"github.com/gin-gonic/gin"

	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/mongo"
)

func RegisterPaymentHandlers(g *gin.RouterGroup, db *mongo.Database, rc *redis.Client) {
	paymentRepo := repository.NewPaymentRepo(db)
	couponRepo := repository.NewCouponRepo(db)
	paymentSvc := service.NewPaymentService(paymentRepo, couponRepo, rc)
	h := &PaymentHandler{service: paymentSvc}

	g.POST("/create", h.CreatePaymentIntent)
	g.POST("/webhook", webhookHandler)
}

type PaymentHandler struct {
	service *service.PaymentService
}

func (h *PaymentHandler) CreatePaymentIntent(c *gin.Context) {
	userID := c.GetString("user_id")
	var req model.PaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.service.CreatePaymentIntent(c.Request.Context(), userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func webhookHandler(c *gin.Context) {
	// TODO: Stripe webhook verification + call service.PaymentSuccess
	c.JSON(http.StatusOK, gin.H{"status": "received"})
}
