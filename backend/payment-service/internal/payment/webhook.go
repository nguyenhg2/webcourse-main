package payment

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/webhook"
	"go.mongodb.org/mongo-driver/mongo"
)

type cardSummary struct {
	Last4 string
	Brand string
}

func RegisterWebhookRoute(g *gin.RouterGroup, db *mongo.Database, webhookSecret string, redisClient *redis.Client) {
	payments := db.Collection("payments")
	webhookSecret = strings.TrimSpace(webhookSecret)

	g.POST("/webhook", func(c *gin.Context) {
		payload, err := io.ReadAll(c.Request.Body)
		if err != nil {
			jsonError(c, http.StatusBadRequest, err)
			return
		}

		var event stripe.Event
		if webhookSecret == "" {
			err = json.Unmarshal(payload, &event)
		} else {
			event, err = webhook.ConstructEvent(payload, c.GetHeader("Stripe-Signature"), webhookSecret)
		}
		if err != nil {
			jsonError(c, http.StatusBadRequest, err)
			return
		}

		if event.Type == stripe.EventTypePaymentIntentSucceeded ||
			event.Type == stripe.EventTypePaymentIntentPaymentFailed ||
			event.Type == stripe.EventTypePaymentIntentCanceled {
			intent, err := paymentIntentFromEvent(event)
			if err != nil {
				jsonError(c, http.StatusBadRequest, err)
				return
			}

			status := statusFailed
			if event.Type == stripe.EventTypePaymentIntentSucceeded {
				err = completePaymentByStripeID(c.Request.Context(), db, payments, intent.ID, cardFromPaymentIntent(intent), redisClient)
			} else {
				if event.Type == stripe.EventTypePaymentIntentCanceled {
					status = statusCanceled
				}
				err = markPaymentByStripeID(c.Request.Context(), payments, intent.ID, status)
			}
			if err != nil {
				jsonError(c, http.StatusInternalServerError, err)
				return
			}
		}

		c.JSON(http.StatusOK, gin.H{"received": true})
	})
}

func paymentIntentFromEvent(event stripe.Event) (*stripe.PaymentIntent, error) {
	if event.Data == nil || len(event.Data.Raw) == 0 {
		return nil, errors.New("Thiếu payload PaymentIntent")
	}

	var intent stripe.PaymentIntent
	if err := json.Unmarshal(event.Data.Raw, &intent); err != nil {
		return nil, err
	}
	if strings.TrimSpace(intent.ID) == "" {
		return nil, errors.New("Thiếu ID PaymentIntent")
	}
	return &intent, nil
}

func cardFromPaymentIntent(intent *stripe.PaymentIntent) cardSummary {
	if intent == nil || intent.LatestCharge == nil || intent.LatestCharge.PaymentMethodDetails == nil || intent.LatestCharge.PaymentMethodDetails.Card == nil {
		return cardSummary{}
	}
	card := intent.LatestCharge.PaymentMethodDetails.Card
	return cardSummary{Last4: card.Last4, Brand: string(card.Brand)}
}
