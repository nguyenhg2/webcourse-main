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

type handler struct {
	db       *mongo.Database
	payments *mongo.Collection
	redis    *redis.Client
}

func RegisterRoutes(g *gin.RouterGroup, db *mongo.Database, stripeSecretKey string, internalOnly gin.HandlerFunc, redisClient *redis.Client) {
	stripe.Key = strings.TrimSpace(stripeSecretKey)
	h := handler{db: db, payments: db.Collection("payments"), redis: redisClient}

	g.POST("", internalOnly, h.create)
	g.GET("", middleware.RequireRole("admin", "operator"), h.listAll)
	g.GET("/history", h.listMine)
	g.GET("/:id", h.get)
	g.POST("/:id/sync", internalOnly, h.sync)
}

func (h handler) create(c *gin.Context) {
	var req PaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		jsonError(c, http.StatusBadRequest, err)
		return
	}

	res, err := h.createPayment(c.Request.Context(), c.GetString("user_id"), req)
	if err != nil {
		jsonError(c, http.StatusBadRequest, err)
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h handler) listAll(c *gin.Context) {
	items, err := listPayments(c.Request.Context(), h.payments, bson.M{})
	if err != nil {
		jsonError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"payments": items})
}

func (h handler) listMine(c *gin.Context) {
	items, err := listPayments(c.Request.Context(), h.payments, bson.M{"user_id": c.GetString("user_id")})
	if err != nil {
		jsonError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"payments": items})
}

func (h handler) get(c *gin.Context) {
	payment, err := h.find(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy thanh toán"})
		return
	}
	c.JSON(http.StatusOK, payment)
}

func (h handler) sync(c *gin.Context) {
	payment, err := h.find(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy thanh toán"})
		return
	}
	if payment.UserID != c.GetString("user_id") {
		c.JSON(http.StatusForbidden, gin.H{"error": "Không đủ quyền đồng bộ thanh toán này"})
		return
	}

	res, err := h.syncStripe(c.Request.Context(), payment)
	if err != nil {
		jsonError(c, http.StatusBadRequest, err)
		return
	}
	c.JSON(http.StatusOK, res)
}

func (h handler) createPayment(ctx context.Context, userID string, req PaymentRequest) (*PaymentResponse, error) {
	payment, err := newPayment(ctx, h.db, userID, req)
	if err != nil {
		return nil, err
	}

	clientSecret := ""
	if payment.FinalAmount > 0 {
		stripeID, secret, err := createStripeIntent(payment)
		if err != nil {
			return nil, err
		}
		payment.Status = statusPending
		payment.StripePaymentID = stripeID
		clientSecret = secret
	}

	if _, err := h.payments.InsertOne(ctx, payment); err != nil {
		return nil, err
	}
	if payment.Status == statusComplete {
		if err := h.afterCompleted(ctx, payment); err != nil {
			return nil, err
		}
	}
	return paymentResponse(payment, clientSecret), nil
}

func newPayment(ctx context.Context, db *mongo.Database, userID string, req PaymentRequest) (*Payment, error) {
	userID = strings.TrimSpace(userID)
	if userID == "" {
		return nil, errors.New("Không tìm thấy người dùng")
	}
	if req.Amount < 0 {
		return nil, errors.New("Số tiền phải lớn hơn hoặc bằng 0")
	}

	courseIDs := cleanCourseIDs(req.CourseIDs)
	if len(courseIDs) == 0 {
		return nil, errors.New("course_ids là bắt buộc")
	}

	discount, couponCode, err := discountFor(ctx, db, req.CouponCode, req.Amount)
	if err != nil {
		return nil, err
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
		FinalAmount:    positive(req.Amount - discount),
		CouponCode:     couponCode,
		CouponDiscount: discount,
		Method:         methodStripe,
		CardLast4:      last4(req.CardLast4),
		CardBrand:      cardBrand(req.CardBrand),
		Status:         statusComplete,
		BillingAddress: billing,
		CreatedAt:      now,
		UpdatedAt:      now,
	}, nil
}

func discountFor(ctx context.Context, db *mongo.Database, code string, amount int64) (int64, string, error) {
	code = coupon.NormalizeCode(code)
	if code == "" {
		return 0, "", nil
	}
	discount, ok := coupon.Discount(ctx, db, code, amount)
	if !ok {
		return 0, "", errors.New("Mã giảm giá không hợp lệ")
	}
	return discount, code, nil
}

func createStripeIntent(payment *Payment) (string, string, error) {
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
		return "", "", err
	}
	return intent.ID, intent.ClientSecret, nil
}

func (h handler) syncStripe(ctx context.Context, payment *Payment) (*PaymentResponse, error) {
	if payment.Status == statusComplete {
		return paymentResponse(payment, ""), nil
	}
	if strings.TrimSpace(payment.StripePaymentID) == "" {
		return nil, errors.New("Thanh toán này không có Stripe PaymentIntent để đồng bộ")
	}

	intent, err := getStripeIntent(payment.StripePaymentID)
	if err != nil {
		return nil, err
	}

	switch intent.Status {
	case stripe.PaymentIntentStatusSucceeded:
		if err := h.completeByStripeID(ctx, intent.ID, cardFromPaymentIntent(intent)); err != nil {
			return nil, err
		}
	case stripe.PaymentIntentStatusCanceled:
		if err := h.markByStripeID(ctx, intent.ID, statusCanceled); err != nil {
			return nil, err
		}
		return nil, errors.New("Thanh toán đã bị hủy")
	case stripe.PaymentIntentStatusRequiresPaymentMethod:
		if err := h.markByStripeID(ctx, intent.ID, statusFailed); err != nil {
			return nil, err
		}
		return nil, errors.New("Stripe chưa nhận được phương thức thanh toán hợp lệ")
	default:
		return nil, errors.New("Stripe chưa xác nhận thanh toán thành công, trạng thái hiện tại: " + string(intent.Status))
	}

	updated, err := h.find(ctx, payment.ID.Hex())
	if err != nil {
		return nil, err
	}
	return paymentResponse(updated, ""), nil
}

func getStripeIntent(stripePaymentID string) (*stripe.PaymentIntent, error) {
	params := &stripe.PaymentIntentParams{}
	params.AddExpand("latest_charge.payment_method_details")
	return paymentintent.Get(stripePaymentID, params)
}

func (h handler) find(ctx context.Context, id string) (*Payment, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	var payment Payment
	err = h.payments.FindOne(ctx, bson.M{"_id": objectID}).Decode(&payment)
	return &payment, err
}

func (h handler) completeByStripeID(ctx context.Context, stripePaymentID string, card cardSummary) error {
	set := bson.M{"status": statusComplete, "updated_at": time.Now().Unix()}
	if card.Last4 != "" {
		set["card_last4"] = card.Last4
	}
	if card.Brand != "" {
		set["card_brand"] = card.Brand
	}

	result, err := h.payments.UpdateOne(
		ctx,
		bson.M{"stripe_payment_id": stripePaymentID, "status": bson.M{"$ne": statusComplete}},
		bson.M{"$set": set},
	)
	if err != nil || result.MatchedCount == 0 {
		return err
	}

	var payment Payment
	if err := h.payments.FindOne(ctx, bson.M{"stripe_payment_id": stripePaymentID}).Decode(&payment); err != nil {
		return err
	}
	return h.afterCompleted(ctx, &payment)
}

func (h handler) markByStripeID(ctx context.Context, stripePaymentID, status string) error {
	_, err := h.payments.UpdateOne(
		ctx,
		bson.M{"stripe_payment_id": stripePaymentID, "status": bson.M{"$ne": statusComplete}},
		bson.M{"$set": bson.M{"status": status, "updated_at": time.Now().Unix()}},
	)
	return err
}

func (h handler) afterCompleted(ctx context.Context, payment *Payment) error {
	if payment.CouponCode != "" {
		if err := coupon.MarkUsed(ctx, h.db, payment.CouponCode); err != nil {
			return err
		}
	}
	return publishPaymentSuccess(ctx, h.redis, payment)
}

func completePaymentByStripeID(ctx context.Context, db *mongo.Database, col *mongo.Collection, stripePaymentID string, card cardSummary, redisClient *redis.Client) error {
	return handler{db: db, payments: col, redis: redisClient}.completeByStripeID(ctx, stripePaymentID, card)
}

func markPaymentByStripeID(ctx context.Context, col *mongo.Collection, stripePaymentID string, status string) error {
	return handler{payments: col}.markByStripeID(ctx, stripePaymentID, status)
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
	cursor, err := col.Find(ctx, filter, options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}).SetLimit(500))
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

func cleanCourseIDs(ids []string) []string {
	seen := map[string]bool{}
	out := []string{}
	for _, id := range ids {
		id = strings.TrimSpace(id)
		if id != "" && !seen[id] {
			seen[id] = true
			out = append(out, id)
		}
	}
	return out
}

func last4(value string) string {
	digits := []rune{}
	for _, char := range value {
		if char >= '0' && char <= '9' {
			digits = append(digits, char)
		}
	}
	if len(digits) < 4 {
		return ""
	}
	return string(digits[len(digits)-4:])
}

func cardBrand(value string) string {
	brand := strings.ToLower(strings.TrimSpace(value))
	if brand == "american express" {
		return "amex"
	}
	return brand
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
