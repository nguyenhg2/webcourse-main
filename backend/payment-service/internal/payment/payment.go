package payment

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"payment-service/internal/coupon"
	"payment-service/internal/middleware"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/paymentintent"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const (
	methodStripe          = "stripe"
	statusPending         = "pending"
	statusComplete        = "completed"
	statusFailed          = "failed"
	statusCanceled        = "canceled"
	paymentSuccessChannel = "payment.success"
)

func RegisterRoutes(g *gin.RouterGroup, db *mongo.Database, stripeSecretKey string, internalOnly gin.HandlerFunc, redisClient *redis.Client) {
	stripe.Key = strings.TrimSpace(stripeSecretKey)
	payments := db.Collection("payments")

	g.POST("", internalOnly, func(c *gin.Context) {
		var req PaymentRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			jsonError(c, http.StatusBadRequest, err)
			return
		}

		response, err := createPayment(c.Request.Context(), db, payments, c.GetString("user_id"), req, redisClient)
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

func createPayment(ctx context.Context, db *mongo.Database, col *mongo.Collection, userID string, req PaymentRequest, redisClient *redis.Client) (*PaymentResponse, error) {
	payment, err := buildPayment(ctx, db, userID, req)
	if err != nil {
		return nil, err
	}

	clientSecret := ""
	if payment.FinalAmount > 0 {
		params := &stripe.PaymentIntentParams{
			Amount:             stripe.Int64(payment.FinalAmount),
			Currency:           stripe.String("vnd"),
			PaymentMethodTypes: []*string{stripe.String("card")},
			Metadata: map[string]string{
				"payment_id":   payment.ID.Hex(),
				"user_id":      payment.UserID,
				"course_count": strconv.Itoa(len(payment.CourseIDs)),
			},
		}
		if payment.UserEmail != "" {
			params.ReceiptEmail = stripe.String(payment.UserEmail)
		}

		intent, err := paymentintent.New(params)
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
	if payment.Status == statusComplete {
		if err := afterPaymentCompleted(ctx, db, payment, redisClient); err != nil {
			return nil, err
		}
	}
	return &PaymentResponse{
		ClientSecret:    clientSecret,
		PaymentID:       payment.ID.Hex(),
		StripePaymentID: payment.StripePaymentID,
		Amount:          payment.FinalAmount,
		Status:          payment.Status,
	}, nil
}

func buildPayment(ctx context.Context, db *mongo.Database, userID string, req PaymentRequest) (*Payment, error) {
	userID = strings.TrimSpace(userID)
	if userID == "" {
		return nil, errors.New("user not found")
	}
	if req.Amount < 0 {
		return nil, errors.New("amount must be greater than or equal to 0")
	}

	seen := map[string]bool{}
	courseIDs := []string{}
	for _, id := range req.CourseIDs {
		id = strings.TrimSpace(id)
		if id != "" && !seen[id] {
			seen[id] = true
			courseIDs = append(courseIDs, id)
		}
	}
	if len(courseIDs) == 0 {
		return nil, errors.New("course_ids is required")
	}

	discount, couponCode := int64(0), coupon.NormalizeCode(req.CouponCode)
	if couponCode != "" {
		validDiscount, ok := coupon.Discount(ctx, db, couponCode, req.Amount)
		if !ok {
			return nil, errors.New("coupon is invalid")
		}
		discount = validDiscount
	}

	finalAmount := req.Amount - discount
	if finalAmount < 0 {
		finalAmount = 0
	}

	cardLast4 := strings.TrimSpace(req.CardLast4)
	if len(cardLast4) > 4 {
		cardLast4 = cardLast4[len(cardLast4)-4:]
	}
	if len(cardLast4) != 4 {
		cardLast4 = ""
	}

	cardBrand := strings.ToLower(strings.TrimSpace(req.CardBrand))
	if cardBrand == "american express" {
		cardBrand = "amex"
	}

	billing := req.BillingAddress
	if strings.TrimSpace(billing.Email) == "" {
		billing.Email = strings.TrimSpace(req.UserEmail)
	}
	billing.Country = strings.ToUpper(strings.TrimSpace(billing.Country))

	now := time.Now().Unix()
	return &Payment{
		ID:             primitive.NewObjectID(),
		UserID:         userID,
		UserEmail:      strings.TrimSpace(req.UserEmail),
		CourseIDs:      courseIDs,
		Amount:         req.Amount,
		OriginalAmount: req.Amount,
		DiscountAmount: discount,
		FinalAmount:    finalAmount,
		CouponCode:     couponCode,
		CouponDiscount: discount,
		Method:         methodStripe,
		CardLast4:      cardLast4,
		CardBrand:      cardBrand,
		Status:         statusComplete,
		BillingAddress: billing,
		CreatedAt:      now,
		UpdatedAt:      now,
	}, nil
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

func completePaymentByStripeID(ctx context.Context, db *mongo.Database, col *mongo.Collection, stripePaymentID string, card cardSummary, redisClient *redis.Client) error {
	set := bson.M{"status": statusComplete, "updated_at": time.Now().Unix()}
	if card.Last4 != "" {
		set["card_last4"] = card.Last4
	}
	if card.Brand != "" {
		set["card_brand"] = card.Brand
	}

	result, err := col.UpdateOne(
		ctx,
		bson.M{"stripe_payment_id": stripePaymentID, "status": bson.M{"$ne": statusComplete}},
		bson.M{"$set": set},
	)
	if err != nil {
		return err
	}
	if result.MatchedCount == 0 {
		return nil
	}

	var payment Payment
	if err := col.FindOne(ctx, bson.M{"stripe_payment_id": stripePaymentID}).Decode(&payment); err != nil {
		return err
	}
	return afterPaymentCompleted(ctx, db, &payment, redisClient)
}

func markPaymentByStripeID(ctx context.Context, col *mongo.Collection, stripePaymentID string, status string) error {
	_, err := col.UpdateOne(
		ctx,
		bson.M{"stripe_payment_id": stripePaymentID, "status": bson.M{"$ne": statusComplete}},
		bson.M{"$set": bson.M{"status": status, "updated_at": time.Now().Unix()}},
	)
	return err
}

func afterPaymentCompleted(ctx context.Context, db *mongo.Database, payment *Payment, redisClient *redis.Client) error {
	if payment.CouponCode != "" {
		if err := coupon.MarkUsed(ctx, db, payment.CouponCode); err != nil {
			return err
		}
	}
	return publishPaymentSuccess(ctx, redisClient, payment)
}

func publishPaymentSuccess(ctx context.Context, redisClient *redis.Client, payment *Payment) error {
	if redisClient == nil {
		return nil
	}
	payload, err := json.Marshal(map[string]any{
		"user_id":    payment.UserID,
		"course_ids": payment.CourseIDs,
		"payment_id": payment.ID.Hex(),
	})
	if err != nil {
		return err
	}
	return redisClient.Publish(ctx, paymentSuccessChannel, payload).Err()
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

func jsonError(c *gin.Context, status int, err error) {
	c.JSON(status, gin.H{"error": err.Error()})
}
