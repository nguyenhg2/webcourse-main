package coupon

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

type Handler struct {
	store *Store
}

func RegisterRoutes(g *gin.RouterGroup, store *Store, adminOnly gin.HandlerFunc) {
	h := &Handler{store: store}

	g.GET("", adminOnly, h.List)
	g.POST("", adminOnly, h.Create)
	g.PATCH("/:id/active", adminOnly, h.SetActive)
	g.POST("/validate", h.Validate)
}

func (h *Handler) List(c *gin.Context) {
	coupons, err := h.store.List(c.Request.Context())
	if err != nil {
		writeError(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"coupons": coupons})
}

func (h *Handler) Create(c *gin.Context) {
	var req CreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		writeError(c, http.StatusBadRequest, err)
		return
	}

	coupon, err := h.store.Create(c.Request.Context(), req)
	if err != nil {
		writeError(c, http.StatusBadRequest, err)
		return
	}

	c.JSON(http.StatusOK, coupon)
}

func (h *Handler) SetActive(c *gin.Context) {
	var req ActiveRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		writeError(c, http.StatusBadRequest, err)
		return
	}

	coupon, err := h.store.SetActive(c.Request.Context(), c.Param("id"), req.Active)
	if err != nil {
		status := http.StatusBadRequest
		if errors.Is(err, mongo.ErrNoDocuments) {
			status = http.StatusNotFound
		}
		writeError(c, status, err)
		return
	}

	c.JSON(http.StatusOK, coupon)
}

func (h *Handler) Validate(c *gin.Context) {
	var req ValidateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		writeError(c, http.StatusBadRequest, err)
		return
	}

	discount, ok := h.store.Discount(c.Request.Context(), req.Code, req.Amount)
	c.JSON(http.StatusOK, gin.H{
		"valid":           ok,
		"discount":        discount,
		"discount_amount": discount,
		"final_amount":    positive(req.Amount - discount),
	})
}

func writeError(c *gin.Context, status int, err error) {
	c.JSON(status, gin.H{"error": err.Error()})
}
