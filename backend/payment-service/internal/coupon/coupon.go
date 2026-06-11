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
	"go.mongodb.org/mongo-driver/mongo/options"
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

func listCoupons(ctx context.Context, col *mongo.Collection) ([]Coupon, error) {
	cursor, err := col.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var coupons []Coupon
	if err := cursor.All(ctx, &coupons); err != nil {
		return nil, err
	}
	sort.SliceStable(coupons, func(i, j int) bool {
		if coupons[i].Active != coupons[j].Active {
			return coupons[i].Active
		}
		return coupons[i].Code < coupons[j].Code
	})
	return coupons, nil
}

func createCoupon(ctx context.Context, col *mongo.Collection, req CreateRequest) (*Coupon, error) {
	coupon, err := newCoupon(req)
	if err != nil {
		return nil, err
	}
	if count, err := col.CountDocuments(ctx, bson.M{"code": coupon.Code}); err != nil {
		return nil, err
	} else if count > 0 {
		return nil, errors.New("Mã giảm giá đã tồn tại")
	}

	result, err := col.InsertOne(ctx, coupon)
	if err != nil {
		return nil, err
	}
	if id, ok := result.InsertedID.(primitive.ObjectID); ok {
		coupon.ID = id
	}
	return coupon, nil
}

func setActive(ctx context.Context, col *mongo.Collection, id string, active bool) (*Coupon, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("ID mã giảm giá không hợp lệ")
	}

	var coupon Coupon
	err = col.FindOneAndUpdate(
		ctx,
		bson.M{"_id": objectID},
		bson.M{"$set": bson.M{"active": active}},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&coupon)
	if err != nil {
		return nil, err
	}
	return &coupon, nil
}

func newCoupon(req CreateRequest) (*Coupon, error) {
	couponType := normalizeType(req.Type)
	code := NormalizeCode(req.Code)

	if code == "" {
		return nil, errors.New("Vui lòng nhập mã giảm giá")
	}
	if couponType == "" {
		return nil, errors.New("Loại mã giảm giá phải là percentage hoặc fixed")
	}
	if req.Discount <= 0 {
		return nil, errors.New("Giá trị giảm giá phải lớn hơn 0")
	}
	if couponType == couponTypePercentage && req.Discount > 100 {
		return nil, errors.New("Giảm giá theo phần trăm không được lớn hơn 100")
	}
	if req.MaxUses < 0 {
		return nil, errors.New("max_uses phải lớn hơn hoặc bằng 0")
	}
	if req.Expiry <= 0 {
		req.Expiry = time.Now().Add(365 * 24 * time.Hour).Unix()
	}

	return &Coupon{Code: code, Type: couponType, Discount: req.Discount, Active: req.Active, Expiry: req.Expiry, MaxUses: req.MaxUses}, nil
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
	expired := c.Expiry > 0 && c.Expiry < time.Now().Unix()
	usedUp := c.MaxUses > 0 && c.UsedCount >= c.MaxUses
	return amount >= 0 && c.Active && !expired && !usedUp && c.Discount > 0 && normalizeType(c.Type) != ""
}

func (c Coupon) discountFor(amount int64) int64 {
	if amount <= 0 {
		return 0
	}
	discount := int64(0)
	switch normalizeType(c.Type) {
	case couponTypePercentage:
		discount = amount * c.Discount / 100
	case couponTypeFixed:
		discount = c.Discount
	}
	if discount > amount {
		return amount
	}
	return discount
}

func MarkUsed(ctx context.Context, db *mongo.Database, code string) error {
	code = NormalizeCode(code)
	if code == "" {
		return nil
	}
	_, err := db.Collection("coupons").UpdateOne(ctx, bson.M{"code": code}, bson.M{"$inc": bson.M{"used_count": 1}})
	return err
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
