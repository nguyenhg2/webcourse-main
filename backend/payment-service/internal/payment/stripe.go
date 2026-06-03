package payment

import (
	"strconv"

	"github.com/stripe/stripe-go/v81"
	"github.com/stripe/stripe-go/v81/paymentintent"
)

func createStripeIntent(payment *Payment) (*stripe.PaymentIntent, error) {
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
	return paymentintent.New(params)
}
