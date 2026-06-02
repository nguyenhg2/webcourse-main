package payment

import (
	"net/http"

	"payment-service/internal/coupon"

	"github.com/gin-gonic/gin"

	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/mongo"
)

func RegisterRoutes(g *gin.RouterGroup, db *mongo.Database, rc *redis.Client) {
	paymentStore := NewStore(db)
	couponStore := coupon.NewStore(db)
	h := &Handler{service: NewService(paymentStore, couponStore, rc)}

	g.POST("", h.CreatePaymentIntent)
	g.POST("/confirm-test", h.ConfirmTestPayment)
	g.GET("", h.ListPayments)
	g.GET("/history", h.PaymentHistory)
	g.GET("/:id", h.GetPayment)
}

type Handler struct {
	service *Service
}

func (h *Handler) CreatePaymentIntent(c *gin.Context) {
	userID := c.GetString("user_id")
	var req PaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.service.CreateIntent(c.Request.Context(), userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) ConfirmTestPayment(c *gin.Context) {
	var req ConfirmPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.ConfirmTest(c.Request.Context(), req.PaymentID, req.CardLast4, req.CardBrand); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "completed"})
}

func (h *Handler) GetPayment(c *gin.Context) {
	payment, err := h.service.GetByID(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy thanh toán"})
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
	role := c.GetString("role")
	if role != "admin" && role != "operator" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Không đủ quyền thực hiện"})
		return
	}

	payments, err := h.service.ListAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"payments": payments})
}
