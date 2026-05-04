package handler

import (
	"net/http"

	"payment-service/internal/model"
	"payment-service/internal/repository"
	"payment-service/internal/service"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func RegisterCouponHandlers(g *gin.RouterGroup, db *mongo.Database) {
	couponRepo := repository.NewCouponRepo(db)
	couponSvc := service.NewCouponService(couponRepo)
	h := &CouponHandler{service: couponSvc}
	g.POST("/validate", h.ValidateCoupon)
	g.GET("/list", h.ListActiveCoupons)
}

type CouponHandler struct {
	service *service.CouponService
}

func (h *CouponHandler) ValidateCoupon(c *gin.Context) {
	var req model.ValidateCouponRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	valid, discount, err := h.service.ValidateCoupon(c.Request.Context(), req.Code, req.Amount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"valid":    valid,
		"discount": discount,
	})
}

func (h *CouponHandler) ListActiveCoupons(c *gin.Context) {
	coupons, err := h.service.ListActiveCoupons(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"coupons": coupons})
}
