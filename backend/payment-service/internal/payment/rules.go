package payment

import "strings"

func normalizedCourseIDs(req PaymentRequest) []string {
	seen := map[string]bool{}
	result := []string{}

	for _, id := range req.CourseIDs {
		id = strings.TrimSpace(id)
		if id == "" || seen[id] {
			continue
		}

		seen[id] = true
		result = append(result, id)
	}

	return result
}

func normalizeBillingAddress(value BillingAddress, fallbackEmail string) BillingAddress {
	value.Name = strings.TrimSpace(value.Name)
	value.Email = strings.TrimSpace(value.Email)
	if value.Email == "" {
		value.Email = strings.TrimSpace(fallbackEmail)
	}
	value.Phone = strings.TrimSpace(value.Phone)
	value.Line1 = strings.TrimSpace(value.Line1)
	value.Line2 = strings.TrimSpace(value.Line2)
	value.City = strings.TrimSpace(value.City)
	value.State = strings.TrimSpace(value.State)
	value.PostalCode = strings.TrimSpace(value.PostalCode)
	value.Country = strings.ToUpper(strings.TrimSpace(value.Country))
	return value
}

func normalizeCardLast4(value string) string {
	value = strings.TrimSpace(value)
	if len(value) > 4 {
		value = value[len(value)-4:]
	}
	if len(value) != 4 {
		return ""
	}
	for _, ch := range value {
		if ch < '0' || ch > '9' {
			return ""
		}
	}
	return value
}

func normalizeCardBrand(value string) string {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "visa", "mastercard", "amex", "jcb", "discover", "unionpay":
		return strings.ToLower(strings.TrimSpace(value))
	case "american express":
		return "amex"
	default:
		return ""
	}
}

func positive(value int64) int64 {
	if value < 0 {
		return 0
	}
	return value
}
