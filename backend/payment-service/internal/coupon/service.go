package coupon

import (
	"context"
	"errors"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Service struct {
	store *Store
}

func NewService(store *Store) *Service {
	return &Service{store: store}
}

func (s *Service) Validate(ctx context.Context, code string, amount int64) (bool, int64, error) {
	if code == "" || amount < 0 {
		return false, 0, nil
	}

	coupon, err := s.store.FindValid(ctx, code)
	if err != nil {
		return false, 0, nil
	}
	if coupon.MaxUses > 0 && coupon.Used >= coupon.MaxUses {
		return false, 0, nil
	}

	discount := discountAmount(amount, coupon.Type, coupon.Discount)
	return true, discount, nil
}

func (s *Service) ListAll(ctx context.Context) ([]*Coupon, error) {
	return s.store.ListAll(ctx)
}

func (s *Service) Create(ctx context.Context, req CreateCouponRequest) (*Coupon, error) {
	code := strings.ToUpper(strings.TrimSpace(req.Code))
	if code == "" {
		return nil, errors.New("vui lòng nhập mã giảm giá")
	}
	if req.Type != "percentage" && req.Type != "fixed" {
		return nil, errors.New("loại mã giảm giá phải là percentage hoặc fixed")
	}
	if req.Discount <= 0 {
		return nil, errors.New("giá trị giảm phải lớn hơn 0")
	}
	if req.Type == "percentage" && req.Discount > 100 {
		return nil, errors.New("phần trăm giảm giá không được lớn hơn 100")
	}
	if req.Expiry <= 0 {
		req.Expiry = time.Now().AddDate(1, 0, 0).Unix()
	}

	return s.store.Create(ctx, &Coupon{
		Code:     code,
		Discount: req.Discount,
		Type:     req.Type,
		MaxUses:  req.MaxUses,
		Expiry:   req.Expiry,
		Active:   req.Active,
	})
}

func (s *Service) SetActive(ctx context.Context, id string, active bool) (*Coupon, error) {
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, errors.New("id mã giảm giá không hợp lệ")
	}
	return s.store.SetActive(ctx, objectID, active)
}

func discountAmount(amount int64, couponType string, discount int64) int64 {
	if couponType == "percentage" {
		discount = amount * discount / 100
	}
	if discount > amount {
		return amount
	}
	return discount
}
