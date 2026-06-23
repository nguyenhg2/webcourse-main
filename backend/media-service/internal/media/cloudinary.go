package media

import (
	"bytes"
	"crypto/sha1"
	"encoding/hex"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"media-service/internal/config"
)

var cloudinaryClient = &http.Client{
	Timeout: 30 * time.Second,
	Transport: &http.Transport{
		MaxIdleConns:        100,
		MaxIdleConnsPerHost: 100,
		IdleConnTimeout:     90 * time.Second,
		TLSHandshakeTimeout: 10 * time.Second,
	},
}

func uploadBody(cfg *config.Config, file multipart.File, fileName string, folder string, deliveryType string) (*bytes.Buffer, string, error) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("file", fileName)
	if err != nil {
		return nil, "", err
	}
	if _, err := io.Copy(part, file); err != nil {
		return nil, "", err
	}

	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	signatureText := "asset_folder=" + folder + "&timestamp=" + timestamp
	fields := map[string]string{
		"api_key":      cfg.CloudinaryKey,
		"timestamp":    timestamp,
		"asset_folder": folder,
	}
	if deliveryType != "" {
		fields["type"] = deliveryType
		signatureText += "&type=" + deliveryType
	}
	fields["signature"] = signCloudinary(signatureText, cfg.CloudinarySecret)

	for key, value := range fields {
		if err := writer.WriteField(key, value); err != nil {
			return nil, "", err
		}
	}
	if err := writer.Close(); err != nil {
		return nil, "", err
	}

	return body, writer.FormDataContentType(), nil
}

func ensureCloudinaryConfig(cfg *config.Config) error {
	if cfg.CloudinaryCloud == "" || cfg.CloudinaryKey == "" || cfg.CloudinarySecret == "" {
		return apiError{Status: http.StatusInternalServerError, Message: "Thiếu cấu hình Cloudinary"}
	}
	return nil
}

func cloudinaryURL(cfg *config.Config, resourceType string, action string) string {
	return "https://api.cloudinary.com/v1_1/" + cfg.CloudinaryCloud + "/" + resourceType + "/" + action
}

func destroyForm(cfg *config.Config, publicID string) url.Values {
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	signatureText := "invalidate=true&public_id=" + publicID + "&timestamp=" + timestamp

	form := url.Values{}
	form.Set("api_key", cfg.CloudinaryKey)
	form.Set("timestamp", timestamp)
	form.Set("public_id", publicID)
	form.Set("invalidate", "true")
	form.Set("signature", signCloudinary(signatureText, cfg.CloudinarySecret))
	return form
}

func cloudinaryPostForm(endpoint string, form url.Values) ([]byte, error) {
	resp, err := cloudinaryClient.PostForm(endpoint, form)
	if err != nil {
		return nil, apiError{Status: http.StatusBadGateway, Message: err.Error()}
	}
	return readCloudinaryResponse(resp)
}

func cloudinaryPostMultipart(endpoint string, body io.Reader, contentType string) ([]byte, error) {
	resp, err := cloudinaryClient.Post(endpoint, contentType, body)
	if err != nil {
		return nil, apiError{Status: http.StatusBadGateway, Message: err.Error()}
	}
	return readCloudinaryResponse(resp)
}

func readCloudinaryResponse(resp *http.Response) ([]byte, error) {
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode >= http.StatusMultipleChoices {
		return nil, apiError{Status: resp.StatusCode, Message: string(body)}
	}
	return body, nil
}

func signCloudinary(payload string, secret string) string {
	sum := sha1.Sum([]byte(payload + secret))
	return hex.EncodeToString(sum[:])
}
