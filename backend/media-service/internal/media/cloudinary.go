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
)

func (h *Handler) uploadBody(file multipart.File, fileName string, folder string) (*bytes.Buffer, string, error) {
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
		"api_key":      h.cfg.CloudinaryKey,
		"timestamp":    timestamp,
		"asset_folder": folder,
		"signature":    signCloudinary(signatureText, h.cfg.CloudinarySecret),
	}

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

func (h *Handler) ensureCloudinaryConfig() error {
	if h.cfg.CloudinaryCloud == "" || h.cfg.CloudinaryKey == "" || h.cfg.CloudinarySecret == "" {
		return apiError{Status: http.StatusInternalServerError, Message: "Cloudinary config is missing"}
	}
	return nil
}

func (h *Handler) cloudinaryURL(resourceType string, action string) string {
	return "https://api.cloudinary.com/v1_1/" + h.cfg.CloudinaryCloud + "/" + resourceType + "/" + action
}

func (h *Handler) destroyForm(publicID string) url.Values {
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	signatureText := "invalidate=true&public_id=" + publicID + "&timestamp=" + timestamp

	form := url.Values{}
	form.Set("api_key", h.cfg.CloudinaryKey)
	form.Set("timestamp", timestamp)
	form.Set("public_id", publicID)
	form.Set("invalidate", "true")
	form.Set("signature", signCloudinary(signatureText, h.cfg.CloudinarySecret))
	return form
}

func postCloudinaryForm(endpoint string, form url.Values) ([]byte, error) {
	resp, err := http.PostForm(endpoint, form)
	if err != nil {
		return nil, apiError{Status: http.StatusBadGateway, Message: err.Error()}
	}
	return readCloudinaryResponse(resp)
}

func postCloudinaryMultipart(endpoint string, body io.Reader, contentType string) ([]byte, error) {
	req, err := http.NewRequest(http.MethodPost, endpoint, body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", contentType)

	resp, err := http.DefaultClient.Do(req)
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
