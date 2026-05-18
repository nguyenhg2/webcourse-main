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

	g.POST("", h.CreatePaymentIntent)
	g.POST("/create", h.CreatePaymentIntent)
	g.POST("/confirm-test", h.ConfirmTestPayment)
	g.GET("", h.ListPayments)
	g.GET("/history", h.PaymentHistory)
	g.GET("/:id", h.GetPayment)
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

func (h *PaymentHandler) ConfirmTestPayment(c *gin.Context) {
	var req model.ConfirmPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.ConfirmTestPayment(c.Request.Context(), req.PaymentID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "completed"})
}

func (h *PaymentHandler) GetPayment(c *gin.Context) {
	payment, err := h.service.GetPayment(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "payment not found"})
		return
	}
	c.JSON(http.StatusOK, payment)
}

func (h *PaymentHandler) PaymentHistory(c *gin.Context) {
	userID := c.GetString("user_id")
	payments, err := h.service.PaymentHistory(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"payments": payments})
}

func (h *PaymentHandler) ListPayments(c *gin.Context) {
	role := c.GetString("role")
	if role != "admin" && role != "operator" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient role"})
		return
	}

	payments, err := h.service.ListPayments(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"payments": payments})
}

func webhookHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "received"})
}
