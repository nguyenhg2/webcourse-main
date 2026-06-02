package payment

import (
	"net/http"

	"payment-service/internal/coupon"
	"payment-service/internal/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func RegisterRoutes(g *gin.RouterGroup, db *mongo.Database, coupons *coupon.Store, stripeSecretKey string, internalOnly gin.HandlerFunc) {
	h := &Handler{service: NewService(NewStore(db), coupons, stripeSecretKey)}

	g.POST("", internalOnly, h.CreatePayment)
	g.GET("", middleware.RequireRole("admin", "operator"), h.ListPayments)
	g.GET("/history", h.PaymentHistory)
	g.GET("/:id", h.GetPayment)
}

type Handler struct {
	service *Service
}

func (h *Handler) CreatePayment(c *gin.Context) {
	userID := c.GetString("user_id")
	var req PaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.service.CreatePayment(c.Request.Context(), userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) GetPayment(c *gin.Context) {
	payment, err := h.service.GetByID(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "payment not found"})
		return
	}
	c.JSON(http.StatusOK, payment)
}

func (h *Handler) PaymentHistory(c *gin.Context) {
	userID := c.GetString("user_id")
	payments, err := h.service.ListByUser(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"payments": payments})
}

func (h *Handler) ListPayments(c *gin.Context) {
	payments, err := h.service.ListAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"payments": payments})
}
