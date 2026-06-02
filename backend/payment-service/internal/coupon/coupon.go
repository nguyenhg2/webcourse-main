package coupon

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

const (
	couponTypeFixed      = "fixed"
	couponTypePercent    = "percent"
	couponTypePercentage = "percentage"
)

type Coupon struct {
	Code          string `bson:"code" json:"code"`
	DiscountType  string `bson:"discount_type,omitempty" json:"discount_type,omitempty"`
	DiscountValue int64  `bson:"discount_value,omitempty" json:"discount_value,omitempty"`
	MinOrder      int64  `bson:"min_order,omitempty" json:"min_order,omitempty"`
	MaxDiscount   int64  `bson:"max_discount,omitempty" json:"max_discount,omitempty"`
	MaxUses       int64  `bson:"max_uses" json:"max_uses"`
	UsedCount     int64  `bson:"used_count,omitempty" json:"used_count,omitempty"`
	ExpiresAt     int64  `bson:"expires_at,omitempty" json:"expires_at,omitempty"`
	IsActive      *bool  `bson:"is_active,omitempty" json:"is_active,omitempty"`

	// Old field names are kept so Payment Service can validate coupons created by Core.
	Type     string `bson:"type,omitempty" json:"type,omitempty"`
	Discount int64  `bson:"discount,omitempty" json:"discount,omitempty"`
	Used     int64  `bson:"used,omitempty" json:"used,omitempty"`
	Expiry   int64  `bson:"expiry,omitempty" json:"expiry,omitempty"`
	Active   *bool  `bson:"active,omitempty" json:"active,omitempty"`
}

type ValidateRequest struct {
	Code   string `json:"code"`
	Amount int64  `json:"amount"`
}

type Store struct {
	collection *mongo.Collection
}

func NewStore(db *mongo.Database) *Store {
	return &Store{collection: db.Collection("coupons")}
}

func RegisterRoutes(g *gin.RouterGroup, store *Store) {
	g.POST("/validate", func(c *gin.Context) {
		var req ValidateRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		discount, ok := store.Discount(c.Request.Context(), req.Code, req.Amount)

		c.JSON(http.StatusOK, gin.H{
			"valid":           ok,
			"discount":        discount,
			"discount_amount": discount,
			"final_amount":    positive(req.Amount - discount),
		})
	})
}

func (s *Store) Discount(ctx context.Context, code string, amount int64) (int64, bool) {
	coupon, err := s.findValid(ctx, code, amount)
	if err != nil {
		return 0, false
	}
	return coupon.discountFor(amount), true
}

func (s *Store) findValid(ctx context.Context, code string, amount int64) (*Coupon, error) {
	var coupon Coupon
	err := s.collection.FindOne(ctx, bson.M{"code": NormalizeCode(code)}).Decode(&coupon)
	if err != nil {
		return nil, err
	}
	if !coupon.validFor(amount) {
		return nil, mongo.ErrNoDocuments
	}
	return &coupon, nil
}

func (s *Store) Use(ctx context.Context, code string, discount int64) error {
	code = NormalizeCode(code)
	if code == "" || discount <= 0 {
		return nil
	}

	_, err := s.collection.UpdateOne(
		ctx,
		bson.M{"code": code},
		bson.M{"$inc": bson.M{"used_count": 1, "used": 1}},
	)
	return err
}

func (c Coupon) validFor(amount int64) bool {
	if amount < 0 {
		return false
	}
	if !c.active() || c.expired() || c.outOfUses() {
		return false
	}
	if amount < c.MinOrder {
		return false
	}
	return c.discountValue() > 0
}

func (c Coupon) discountFor(amount int64) int64 {
	discount := discountAmount(amount, c.discountType(), c.discountValue())
	if c.MaxDiscount > 0 && discount > c.MaxDiscount {
		discount = c.MaxDiscount
	}
	return positive(min(discount, amount))
}

func discountAmount(amount int64, couponType string, discount int64) int64 {
	if amount <= 0 || discount <= 0 {
		return 0
	}

	switch strings.ToLower(strings.TrimSpace(couponType)) {
	case couponTypePercent, couponTypePercentage:
		discount = amount * discount / 100
	case couponTypeFixed:
		// fixed discount already has the right value
	default:
		return 0
	}

	return min(discount, amount)
}

func NormalizeCode(code string) string {
	return strings.ToUpper(strings.TrimSpace(code))
}

func (c Coupon) active() bool {
	if c.IsActive != nil {
		return *c.IsActive
	}
	if c.Active != nil {
		return *c.Active
	}
	return false
}

func (c Coupon) expired() bool {
	expiresAt := c.ExpiresAt
	if expiresAt == 0 {
		expiresAt = c.Expiry
	}
	return expiresAt > 0 && expiresAt < time.Now().Unix()
}

func (c Coupon) outOfUses() bool {
	used := c.UsedCount
	if used == 0 {
		used = c.Used
	}
	return c.MaxUses > 0 && used >= c.MaxUses
}

func (c Coupon) discountType() string {
	if strings.TrimSpace(c.DiscountType) != "" {
		return c.DiscountType
	}
	return c.Type
}

func (c Coupon) discountValue() int64 {
	if c.DiscountValue > 0 {
		return c.DiscountValue
	}
	return c.Discount
}

func min(a, b int64) int64 {
	if a < b {
		return a
	}
	return b
}

func positive(value int64) int64 {
	if value < 0 {
		return 0
	}
	return value
}
