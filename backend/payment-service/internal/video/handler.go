package video

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

type Handler struct {
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

type createFolderRequest struct {
	Folder string `json:"folder"`
}

type deleteVideoRequest struct {
	PublicID string `json:"public_id"`
	VideoURL string `json:"video_url"`
}

func RegisterRoutes(g *gin.RouterGroup, cfg *config.Config) {
	h := &Handler{cfg: cfg}
	g.POST("/upload", h.Upload)
	g.POST("/folders", h.CreateFolder)
	g.DELETE("/delete", h.Delete)
	g.GET("/:lessonId/signed-url", h.SignedURL)
}

func RegisterFileRoutes(g *gin.RouterGroup, cfg *config.Config) {
	h := &Handler{cfg: cfg}
	g.POST("/upload", h.UploadFile)
}

func RegisterSignedRoutes(g *gin.RouterGroup, cfg *config.Config) {
	h := &Handler{cfg: cfg}
	g.GET("/:lessonId/signed-url", h.SignedURL)
}

func RegisterPublicRoutes(g *gin.RouterGroup, cfg *config.Config) {
	h := &Handler{cfg: cfg}
	g.GET("/preview", h.Preview)
}

func (h *Handler) Preview(c *gin.Context) {
	video, err := h.latestCloudinaryVideo(h.requestedFolder(c))
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"title":        "Video xem thử",
		"video_url":    video.SecureURL,
		"signed_url":   video.SecureURL,
		"public_id":    video.PublicID,
		"asset_folder": video.AssetFolder,
		"duration":     video.Duration,
		"bytes":        video.Bytes,
		"format":       video.Format,
	})
}

func (h *Handler) Upload(c *gin.Context) {
	if err := h.ensureCloudinaryConfig(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	file, header, err := c.Request.FormFile("video")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Vui lòng chọn tệp video"})
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
	folder := h.uploadFolder(c.PostForm("folder"), "codecamp/videos")
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

func (h *Handler) UploadFile(c *gin.Context) {
	if err := h.ensureCloudinaryConfig(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Vui lòng chọn tệp"})
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

func (h *Handler) CreateFolder(c *gin.Context) {
	if err := h.ensureCloudinaryConfig(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var payload createFolderRequest
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Vui lòng nhập thư mục Cloudinary"})
		return
	}

	folder := strings.Trim(payload.Folder, "/")
	if folder == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Vui lòng nhập thư mục Cloudinary"})
		return
	}

	apiURL := fmt.Sprintf(
		"https://api.cloudinary.com/v1_1/%s/folders/%s",
		url.PathEscape(h.cfg.CloudinaryCloud),
		escapeCloudinaryFolderPath(folder),
	)
	req, err := http.NewRequest(http.MethodPost, apiURL, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	req.SetBasicAuth(h.cfg.CloudinaryKey, h.cfg.CloudinarySecret)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode == http.StatusConflict || strings.Contains(strings.ToLower(string(respBody)), "already exists") {
		c.JSON(http.StatusOK, gin.H{"folder": folder, "created": false})
		return
	}
	if resp.StatusCode >= 300 {
		c.JSON(resp.StatusCode, gin.H{"error": string(respBody)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"folder": folder, "created": true})
}

func (h *Handler) Delete(c *gin.Context) {
	if err := h.ensureCloudinaryConfig(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var payload deleteVideoRequest
	if err := c.ShouldBindJSON(&payload); err != nil && err != io.EOF {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Vui lòng gửi public_id hoặc video_url"})
		return
	}

	publicID := strings.TrimSpace(payload.PublicID)
	if publicID == "" {
		publicID = cloudinaryPublicIDFromURL(payload.VideoURL)
	}
	if publicID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "public_id hoặc Cloudinary video_url không hợp lệ"})
		return
	}

	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	signature := signCloudinary("invalidate=true&public_id="+publicID+"&timestamp="+timestamp, h.cfg.CloudinarySecret)

	form := url.Values{}
	form.Set("api_key", h.cfg.CloudinaryKey)
	form.Set("timestamp", timestamp)
	form.Set("public_id", publicID)
	form.Set("invalidate", "true")
	form.Set("signature", signature)

	destroyURL := "https://api.cloudinary.com/v1_1/" + h.cfg.CloudinaryCloud + "/video/destroy"
	resp, err := http.PostForm(destroyURL, form)
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

	var result map[string]any
	if err := json.Unmarshal(respBody, &result); err != nil {
		c.JSON(http.StatusOK, gin.H{"public_id": publicID, "raw": string(respBody)})
		return
	}
	result["public_id"] = publicID
	c.JSON(http.StatusOK, result)
}

func (h *Handler) SignedURL(c *gin.Context) {
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

func (h *Handler) ensureCloudinaryConfig() error {
	if h.cfg.CloudinaryCloud == "" || h.cfg.CloudinaryKey == "" || h.cfg.CloudinarySecret == "" {
		return fmt.Errorf("thiếu cấu hình Cloudinary")
	}
	return nil
}

func (h *Handler) requestedFolder(c *gin.Context) string {
	if folder := strings.TrimSpace(c.Query("folder")); folder != "" {
		return strings.Trim(folder, "/")
	}
	return strings.Trim(strings.TrimSpace(h.cfg.CloudinaryFolder), "/")
}

func (h *Handler) uploadFolder(preferred string, fallback string) string {
	if folder := strings.Trim(strings.TrimSpace(preferred), "/"); folder != "" {
		return folder
	}
	if folder := strings.Trim(strings.TrimSpace(h.cfg.CloudinaryFolder), "/"); folder != "" {
		return folder
	}
	return fallback
}

func (h *Handler) latestCloudinaryVideo(folder string) (*cloudinaryResource, error) {
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
			return nil, fmt.Errorf("không tìm thấy video Cloudinary trong asset_folder %q", folder)
		}
		return nil, fmt.Errorf("không tìm thấy video Cloudinary")
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

func escapeCloudinaryFolderPath(folder string) string {
	parts := strings.Split(strings.Trim(folder, "/"), "/")
	for i, part := range parts {
		parts[i] = url.PathEscape(part)
	}
	return strings.Join(parts, "/")
}

func cloudinaryPublicIDFromURL(videoURL string) string {
	parsed, err := url.Parse(strings.TrimSpace(videoURL))
	if err != nil || parsed.Path == "" {
		return ""
	}

	parts := strings.Split(strings.Trim(parsed.Path, "/"), "/")
	uploadIndex := -1
	for i, part := range parts {
		if part == "upload" {
			uploadIndex = i
			break
		}
	}
	if uploadIndex == -1 || uploadIndex+1 >= len(parts) {
		return ""
	}

	publicParts := parts[uploadIndex+1:]
	if len(publicParts) > 0 && strings.HasPrefix(publicParts[0], "v") {
		if _, err := strconv.ParseInt(strings.TrimPrefix(publicParts[0], "v"), 10, 64); err == nil {
			publicParts = publicParts[1:]
		}
	}
	if len(publicParts) == 0 {
		return ""
	}

	publicID := strings.Join(publicParts, "/")
	if dot := strings.LastIndex(publicID, "."); dot > 0 {
		publicID = publicID[:dot]
	}
	return publicID
}

func signCloudinary(payload string, secret string) string {
	sum := sha1.Sum([]byte(payload + secret))
	return hex.EncodeToString(sum[:])
}
