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
	g.GET("", h.ListCoupons)
	g.POST("", h.CreateCoupon)
	g.PATCH("/:id/active", h.UpdateCouponStatus)
	g.PUT("/:id/active", h.UpdateCouponStatus)
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

func (h *CouponHandler) ListCoupons(c *gin.Context) {
	if c.GetString("role") != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient role"})
		return
	}

	coupons, err := h.service.ListCoupons(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"coupons": coupons})
}

func (h *CouponHandler) CreateCoupon(c *gin.Context) {
	if c.GetString("role") != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient role"})
		return
	}

	var req model.CreateCouponRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	coupon, err := h.service.CreateCoupon(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, coupon)
}

func (h *CouponHandler) UpdateCouponStatus(c *gin.Context) {
	if c.GetString("role") != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient role"})
		return
	}

	var req model.UpdateCouponStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	coupon, err := h.service.SetCouponActive(c.Request.Context(), c.Param("id"), req.Active)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, coupon)
}
