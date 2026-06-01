package coupon

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func RegisterRoutes(g *gin.RouterGroup, db *mongo.Database) {
	store := NewStore(db)
	h := &Handler{service: NewService(store)}

	g.POST("/validate", h.ValidateCoupon)
	g.GET("/list", h.ListActiveCoupons)
	g.GET("", h.ListCoupons)
	g.POST("", h.CreateCoupon)
	g.PATCH("/:id/active", h.UpdateCouponStatus)
	g.PUT("/:id/active", h.UpdateCouponStatus)
}

type Handler struct {
	service *Service
}

func (h *Handler) ValidateCoupon(c *gin.Context) {
	var req ValidateCouponRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	valid, discount, err := h.service.Validate(c.Request.Context(), req.Code, req.Amount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"valid":    valid,
		"discount": discount,
	})
}

func (h *Handler) ListActiveCoupons(c *gin.Context) {
	coupons, err := h.service.ListActive(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"coupons": coupons})
}

func (h *Handler) ListCoupons(c *gin.Context) {
	if c.GetString("role") != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Không đủ quyền thực hiện"})
		return
	}

	coupons, err := h.service.ListAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"coupons": coupons})
}

func (h *Handler) CreateCoupon(c *gin.Context) {
	if c.GetString("role") != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Không đủ quyền thực hiện"})
		return
	}

	var req CreateCouponRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	coupon, err := h.service.Create(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, coupon)
}

func (h *Handler) UpdateCouponStatus(c *gin.Context) {
	if c.GetString("role") != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Không đủ quyền thực hiện"})
		return
	}

	var req UpdateCouponStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	coupon, err := h.service.SetActive(c.Request.Context(), c.Param("id"), req.Active)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, coupon)
}
