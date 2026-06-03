package coupon

import (
	"context"
	"errors"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

const (
	couponTypeFixed      = "fixed"
	couponTypePercent    = "percent"
	couponTypePercentage = "percentage"
)

func RegisterRoutes(g *gin.RouterGroup, db *mongo.Database, adminOnly gin.HandlerFunc) {
	col := db.Collection("coupons")

	g.GET("", adminOnly, func(c *gin.Context) {
		coupons, err := listCoupons(c.Request.Context(), col)
		if err != nil {
			jsonError(c, http.StatusInternalServerError, err)
			return
		}
		c.JSON(http.StatusOK, gin.H{"coupons": coupons})
	})

	g.POST("", adminOnly, func(c *gin.Context) {
		var req CreateRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			jsonError(c, http.StatusBadRequest, err)
			return
		}

		coupon, err := createCoupon(c.Request.Context(), col, req)
		if err != nil {
			jsonError(c, http.StatusBadRequest, err)
			return
		}
		c.JSON(http.StatusOK, coupon)
	})

	g.PATCH("/:id/active", adminOnly, func(c *gin.Context) {
		var req ActiveRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			jsonError(c, http.StatusBadRequest, err)
			return
		}

		coupon, err := setActive(c.Request.Context(), col, c.Param("id"), req.Active)
		if err != nil {
			status := http.StatusBadRequest
			if errors.Is(err, mongo.ErrNoDocuments) {
				status = http.StatusNotFound
			}
			jsonError(c, status, err)
			return
		}
		c.JSON(http.StatusOK, coupon)
	})

	g.POST("/validate", func(c *gin.Context) {
		var req ValidateRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			jsonError(c, http.StatusBadRequest, err)
			return
		}

		discount, ok := Discount(c.Request.Context(), db, req.Code, req.Amount)
		c.JSON(http.StatusOK, gin.H{
			"valid":           ok,
			"discount":        discount,
			"discount_amount": discount,
			"final_amount":    positive(req.Amount - discount),
		})
	})
}

func Discount(ctx context.Context, db *mongo.Database, code string, amount int64) (int64, bool) {
	var coupon Coupon
	err := db.Collection("coupons").FindOne(ctx, bson.M{"code": NormalizeCode(code)}).Decode(&coupon)
	if err != nil || !coupon.validFor(amount) {
		return 0, false
	}
	return coupon.discountFor(amount), true
}

func listCoupons(ctx context.Context, col *mongo.Collection) ([]CouponResponse, error) {
	cursor, err := col.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var docs []Coupon
	if err := cursor.All(ctx, &docs); err != nil {
		return nil, err
	}

	items := make([]CouponResponse, 0, len(docs))
	for _, doc := range docs {
		items = append(items, doc.response())
	}
	sort.SliceStable(items, func(i, j int) bool {
		if items[i].Active != items[j].Active {
			return items[i].Active
		}
		return items[i].Code < items[j].Code
	})
	return items, nil
}

func createCoupon(ctx context.Context, col *mongo.Collection, req CreateRequest) (*CouponResponse, error) {
	coupon, err := newCoupon(req)
	if err != nil {
		return nil, err
	}
	if count, err := col.CountDocuments(ctx, bson.M{"code": coupon.Code}); err != nil {
		return nil, err
	} else if count > 0 {
		return nil, errors.New("coupon already exists")
	}

	result, err := col.InsertOne(ctx, coupon)
	if err != nil {
		return nil, err
	}
	if id, ok := result.InsertedID.(primitive.ObjectID); ok {
		coupon.ID = id
	}

	response := coupon.response()
	return &response, nil
}

func setActive(ctx context.Context, col *mongo.Collection, id string, active bool) (*CouponResponse, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("invalid coupon id")
	}

	result, err := col.UpdateOne(ctx, bson.M{"_id": objectID}, bson.M{"$set": bson.M{"active": active}})
	if err != nil {
		return nil, err
	}
	if result.MatchedCount == 0 {
		return nil, mongo.ErrNoDocuments
	}

	var coupon Coupon
	if err := col.FindOne(ctx, bson.M{"_id": objectID}).Decode(&coupon); err != nil {
		return nil, err
	}
	response := coupon.response()
	return &response, nil
}

func newCoupon(req CreateRequest) (*Coupon, error) {
	couponType := normalizeType(req.Type)
	code := NormalizeCode(req.Code)

	if code == "" {
		return nil, errors.New("coupon code is required")
	}
	if couponType == "" {
		return nil, errors.New("coupon type must be percentage or fixed")
	}
	if req.Discount <= 0 {
		return nil, errors.New("discount must be greater than 0")
	}
	if couponType == couponTypePercentage && req.Discount > 100 {
		return nil, errors.New("percentage discount cannot be greater than 100")
	}
	if req.Expiry <= 0 {
		req.Expiry = time.Now().Add(365 * 24 * time.Hour).Unix()
	}

	return &Coupon{Code: code, Type: couponType, Discount: req.Discount, Active: req.Active, Expiry: req.Expiry}, nil
}

func NormalizeCode(code string) string {
	return strings.ToUpper(strings.TrimSpace(code))
}

func normalizeType(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case couponTypePercent, couponTypePercentage:
		return couponTypePercentage
	case couponTypeFixed:
		return couponTypeFixed
	default:
		return ""
	}
}

func (c Coupon) validFor(amount int64) bool {
	return amount >= 0 && c.Active && !c.expired() && c.Discount > 0 && normalizeType(c.Type) != ""
}

func (c Coupon) expired() bool {
	return c.Expiry > 0 && c.Expiry < time.Now().Unix()
}

func (c Coupon) discountFor(amount int64) int64 {
	if amount <= 0 {
		return 0
	}
	switch normalizeType(c.Type) {
	case couponTypePercentage:
		return min(amount*c.Discount/100, amount)
	case couponTypeFixed:
		return min(c.Discount, amount)
	default:
		return 0
	}
}

func (c Coupon) response() CouponResponse {
	return CouponResponse{ID: c.ID.Hex(), Code: c.Code, Type: c.Type, Discount: c.Discount, Active: c.Active, Expiry: c.Expiry}
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

func jsonError(c *gin.Context, status int, err error) {
	c.JSON(status, gin.H{"error": err.Error()})
}
