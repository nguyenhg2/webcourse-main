package payment

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"payment-service/internal/coupon"
	"payment-service/internal/middleware"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v81"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	methodStripe   = "stripe"
	statusPending  = "pending"
	statusComplete = "completed"
)

func RegisterRoutes(g *gin.RouterGroup, db *mongo.Database, stripeSecretKey string, internalOnly gin.HandlerFunc) {
	stripe.Key = strings.TrimSpace(stripeSecretKey)
	payments := db.Collection("payments")

	g.POST("", internalOnly, func(c *gin.Context) {
		var req PaymentRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			jsonError(c, http.StatusBadRequest, err)
			return
		}

		response, err := createPayment(c.Request.Context(), db, payments, c.GetString("user_id"), req)
		if err != nil {
			jsonError(c, http.StatusBadRequest, err)
			return
		}
		c.JSON(http.StatusOK, response)
	})

	g.GET("", middleware.RequireRole("admin", "operator"), func(c *gin.Context) {
		items, err := listPayments(c.Request.Context(), payments, bson.M{})
		if err != nil {
			jsonError(c, http.StatusInternalServerError, err)
			return
		}
		c.JSON(http.StatusOK, gin.H{"payments": items})
	})

	g.GET("/history", func(c *gin.Context) {
		items, err := listPayments(c.Request.Context(), payments, bson.M{"user_id": c.GetString("user_id")})
		if err != nil {
			jsonError(c, http.StatusInternalServerError, err)
			return
		}
		c.JSON(http.StatusOK, gin.H{"payments": items})
	})

	g.GET("/:id", func(c *gin.Context) {
		payment, err := getPayment(c.Request.Context(), payments, c.Param("id"))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "payment not found"})
			return
		}
		c.JSON(http.StatusOK, payment)
	})
}

func createPayment(ctx context.Context, db *mongo.Database, col *mongo.Collection, userID string, req PaymentRequest) (*PaymentResponse, error) {
	payment, err := buildPayment(ctx, db, userID, req)
	if err != nil {
		return nil, err
	}

	clientSecret := ""
	if payment.FinalAmount > 0 {
		intent, err := createStripeIntent(payment)
		if err != nil {
			return nil, err
		}
		payment.Status = statusPending
		payment.StripePaymentID = intent.ID
		clientSecret = intent.ClientSecret
	}

	if _, err := col.InsertOne(ctx, payment); err != nil {
		return nil, err
	}
	return paymentResponse(payment, clientSecret), nil
}

func buildPayment(ctx context.Context, db *mongo.Database, userID string, req PaymentRequest) (*Payment, error) {
	userID = strings.TrimSpace(userID)
	if userID == "" {
		return nil, errors.New("user not found")
	}
	if req.Amount < 0 {
		return nil, errors.New("amount must be greater than or equal to 0")
	}

	courseIDs := normalizedCourseIDs(req)
	if len(courseIDs) == 0 {
		return nil, errors.New("course_ids is required")
	}

	discount, couponCode, err := couponDiscount(ctx, db, req.CouponCode, req.Amount)
	if err != nil {
		return nil, err
	}

	now := time.Now().Unix()
	return &Payment{
		ID:             primitive.NewObjectID(),
		UserID:         userID,
		UserEmail:      strings.TrimSpace(req.UserEmail),
		CourseIDs:      courseIDs,
		Amount:         req.Amount,
		OriginalAmount: req.Amount,
		DiscountAmount: discount,
		FinalAmount:    positive(req.Amount - discount),
		CouponCode:     couponCode,
		CouponDiscount: discount,
		Method:         methodStripe,
		CardLast4:      normalizeCardLast4(req.CardLast4),
		CardBrand:      normalizeCardBrand(req.CardBrand),
		Status:         statusComplete,
		BillingAddress: normalizeBillingAddress(req.BillingAddress, req.UserEmail),
		CreatedAt:      now,
		UpdatedAt:      now,
	}, nil
}

func couponDiscount(ctx context.Context, db *mongo.Database, code string, amount int64) (int64, string, error) {
	code = coupon.NormalizeCode(code)
	if code == "" {
		return 0, "", nil
	}

	discount, ok := coupon.Discount(ctx, db, code, amount)
	if !ok {
		return 0, "", errors.New("coupon is invalid")
	}
	return discount, code, nil
}

func getPayment(ctx context.Context, col *mongo.Collection, id string) (*Payment, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var payment Payment
	err = col.FindOne(ctx, bson.M{"_id": objectID}).Decode(&payment)
	return &payment, err
}

func listPayments(ctx context.Context, col *mongo.Collection, filter bson.M) ([]*Payment, error) {
	cursor, err := col.Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var payments []*Payment
	if err := cursor.All(ctx, &payments); err != nil {
		return nil, err
	}
	return payments, nil
}

func paymentResponse(payment *Payment, clientSecret string) *PaymentResponse {
	return &PaymentResponse{
		ClientSecret:    clientSecret,
		PaymentID:       payment.ID.Hex(),
		StripePaymentID: payment.StripePaymentID,
		Amount:          payment.FinalAmount,
		Status:          payment.Status,
	}
}

func jsonError(c *gin.Context, status int, err error) {
	c.JSON(status, gin.H{"error": err.Error()})
}
