package handler

import (
	"bytes"
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"payment-service/internal/config"

	"github.com/gin-gonic/gin"
)

type VideoHandler struct {
	cfg *config.Config
}

type cloudinaryUploadResponse struct {
	SecureURL string  `json:"secure_url"`
	PublicID  string  `json:"public_id"`
	Duration  float64 `json:"duration"`
	Bytes     int64   `json:"bytes"`
	Format    string  `json:"format"`
}

type fileUploadResponse struct {
	SecureURL    string `json:"secure_url"`
	PublicID     string `json:"public_id"`
	Bytes        int64  `json:"bytes"`
	Format       string `json:"format"`
	OriginalName string `json:"original_filename"`
}

type cloudinaryResource struct {
	SecureURL   string   `json:"secure_url"`
	PublicID    string   `json:"public_id"`
	AssetFolder string   `json:"asset_folder"`
	DisplayName string   `json:"display_name"`
	CreatedAt   string   `json:"created_at"`
	Duration    *float64 `json:"duration"`
	Bytes       int64    `json:"bytes"`
	Format      string   `json:"format"`
	Width       int      `json:"width"`
	Height      int      `json:"height"`
}

type cloudinaryResourcesResponse struct {
	Resources  []cloudinaryResource `json:"resources"`
	NextCursor string               `json:"next_cursor"`
}

func RegisterVideoHandlers(g *gin.RouterGroup, cfg *config.Config) {
	h := &VideoHandler{cfg: cfg}
	g.POST("/upload", h.Upload)
	g.GET("/:lessonId/signed-url", h.SignedURL)
}

func RegisterFileHandlers(g *gin.RouterGroup, cfg *config.Config) {
	h := &VideoHandler{cfg: cfg}
	g.POST("/upload", h.UploadFile)
}

func RegisterSignedVideoHandlers(g *gin.RouterGroup, cfg *config.Config) {
	h := &VideoHandler{cfg: cfg}
	g.GET("/:lessonId/signed-url", h.SignedURL)
}

func RegisterPublicVideoHandlers(g *gin.RouterGroup, cfg *config.Config) {
	h := &VideoHandler{cfg: cfg}
	g.GET("/preview", h.Preview)
}

func (h *VideoHandler) Preview(c *gin.Context) {
	video, err := h.latestCloudinaryVideo(h.requestedFolder(c))
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"title":        "Video xem thu",
		"video_url":    video.SecureURL,
		"signed_url":   video.SecureURL,
		"public_id":    video.PublicID,
		"asset_folder": video.AssetFolder,
		"duration":     video.Duration,
		"bytes":        video.Bytes,
		"format":       video.Format,
	})
}

func (h *VideoHandler) Upload(c *gin.Context) {
	if err := h.ensureCloudinaryConfig(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	file, header, err := c.Request.FormFile("video")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "video file is required"})
		return
	}
	defer file.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("file", header.Filename)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if _, err := io.Copy(part, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	folder := h.uploadFolder("codecamp/videos")
	signature := signCloudinary("asset_folder="+folder+"&timestamp="+timestamp, h.cfg.CloudinarySecret)

	writer.WriteField("api_key", h.cfg.CloudinaryKey)
	writer.WriteField("timestamp", timestamp)
	writer.WriteField("asset_folder", folder)
	writer.WriteField("signature", signature)
	writer.Close()

	uploadURL := "https://api.cloudinary.com/v1_1/" + h.cfg.CloudinaryCloud + "/video/upload"
	req, err := http.NewRequest(http.MethodPost, uploadURL, body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 300 {
		c.JSON(resp.StatusCode, gin.H{"error": string(respBody)})
		return
	}

	var upload cloudinaryUploadResponse
	if err := json.Unmarshal(respBody, &upload); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"video_url":    upload.SecureURL,
		"public_id":    upload.PublicID,
		"asset_folder": folder,
		"duration":     upload.Duration,
		"bytes":        upload.Bytes,
		"format":       upload.Format,
	})
}

func (h *VideoHandler) UploadFile(c *gin.Context) {
	if err := h.ensureCloudinaryConfig(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
		return
	}
	defer file.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("file", header.Filename)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if _, err := io.Copy(part, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	folder := "codecamp/attachments"
	signature := signCloudinary("asset_folder="+folder+"&timestamp="+timestamp, h.cfg.CloudinarySecret)

	writer.WriteField("api_key", h.cfg.CloudinaryKey)
	writer.WriteField("timestamp", timestamp)
	writer.WriteField("asset_folder", folder)
	writer.WriteField("signature", signature)
	writer.Close()

	uploadURL := "https://api.cloudinary.com/v1_1/" + h.cfg.CloudinaryCloud + "/raw/upload"
	req, err := http.NewRequest(http.MethodPost, uploadURL, body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 300 {
		c.JSON(resp.StatusCode, gin.H{"error": string(respBody)})
		return
	}

	var upload fileUploadResponse
	if err := json.Unmarshal(respBody, &upload); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	name := upload.OriginalName
	if name == "" {
		name = header.Filename
	}

	c.JSON(http.StatusOK, gin.H{
		"name":         name,
		"url":          upload.SecureURL,
		"public_id":    upload.PublicID,
		"asset_folder": folder,
		"bytes":        upload.Bytes,
		"format":       upload.Format,
	})
}

func (h *VideoHandler) SignedURL(c *gin.Context) {
	video, err := h.latestCloudinaryVideo(h.requestedFolder(c))
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"lesson_id":     c.Param("lessonId"),
		"expires_in":    0,
		"signed_url":    video.SecureURL,
		"video_url":     video.SecureURL,
		"public_id":     video.PublicID,
		"asset_folder":  video.AssetFolder,
		"duration":      video.Duration,
		"bytes":         video.Bytes,
		"format":        video.Format,
		"can_preview":   true,
		"signed_source": false,
	})
}

func (h *VideoHandler) ensureCloudinaryConfig() error {
	if h.cfg.CloudinaryCloud == "" || h.cfg.CloudinaryKey == "" || h.cfg.CloudinarySecret == "" {
		return fmt.Errorf("Cloudinary config is missing")
	}
	return nil
}

func (h *VideoHandler) requestedFolder(c *gin.Context) string {
	if folder := strings.TrimSpace(c.Query("folder")); folder != "" {
		return strings.Trim(folder, "/")
	}
	return strings.Trim(strings.TrimSpace(h.cfg.CloudinaryFolder), "/")
}

func (h *VideoHandler) uploadFolder(fallback string) string {
	if folder := strings.Trim(strings.TrimSpace(h.cfg.CloudinaryFolder), "/"); folder != "" {
		return folder
	}
	return fallback
}

func (h *VideoHandler) latestCloudinaryVideo(folder string) (*cloudinaryResource, error) {
	if err := h.ensureCloudinaryConfig(); err != nil {
		return nil, err
	}

	folder = strings.Trim(strings.TrimSpace(folder), "/")
	var best *cloudinaryResource
	nextCursor := ""

	for page := 0; page < 5; page++ {
		query := url.Values{}
		query.Set("max_results", "100")
		if nextCursor != "" {
			query.Set("next_cursor", nextCursor)
		}

		apiURL := fmt.Sprintf(
			"https://api.cloudinary.com/v1_1/%s/resources/video/upload?%s",
			url.PathEscape(h.cfg.CloudinaryCloud),
			query.Encode(),
		)
		req, err := http.NewRequest(http.MethodGet, apiURL, nil)
		if err != nil {
			return nil, err
		}
		req.SetBasicAuth(h.cfg.CloudinaryKey, h.cfg.CloudinarySecret)

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			return nil, err
		}

		respBody, readErr := io.ReadAll(resp.Body)
		resp.Body.Close()
		if readErr != nil {
			return nil, readErr
		}
		if resp.StatusCode >= 300 {
			return nil, fmt.Errorf("Cloudinary Admin API error: %s", string(respBody))
		}

		var payload cloudinaryResourcesResponse
		if err := json.Unmarshal(respBody, &payload); err != nil {
			return nil, err
		}

		for i := range payload.Resources {
			resource := payload.Resources[i]
			if resource.SecureURL == "" || !matchesCloudinaryFolder(resource, folder) {
				continue
			}
			if best == nil || cloudinaryCreatedAfter(resource.CreatedAt, best.CreatedAt) {
				copyResource := resource
				best = &copyResource
			}
		}

		if payload.NextCursor == "" {
			break
		}
		nextCursor = payload.NextCursor
	}

	if best == nil {
		if folder != "" {
			return nil, fmt.Errorf("no Cloudinary videos found in asset_folder %q", folder)
		}
		return nil, fmt.Errorf("no Cloudinary videos found")
	}

	return best, nil
}

func matchesCloudinaryFolder(resource cloudinaryResource, folder string) bool {
	if folder == "" {
		return true
	}
	assetFolder := strings.Trim(resource.AssetFolder, "/")
	publicID := strings.Trim(resource.PublicID, "/")
	return assetFolder == folder || strings.HasPrefix(publicID, folder+"/")
}

func cloudinaryCreatedAfter(left string, right string) bool {
	leftTime, leftErr := time.Parse(time.RFC3339, left)
	rightTime, rightErr := time.Parse(time.RFC3339, right)
	if leftErr == nil && rightErr == nil {
		return leftTime.After(rightTime)
	}
	return left > right
}

func signCloudinary(payload string, secret string) string {
	sum := sha1.Sum([]byte(payload + secret))
	return hex.EncodeToString(sum[:])
}
