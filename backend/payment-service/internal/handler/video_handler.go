package handler

import (
	"bytes"
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"strconv"
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

func RegisterVideoHandlers(g *gin.RouterGroup, cfg *config.Config) {
	h := &VideoHandler{cfg: cfg}
	g.POST("/upload", h.Upload)
	g.GET("/:lessonId/signed-url", h.SignedURL)
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
	c.JSON(http.StatusOK, gin.H{
		"title":     "Video xem thử",
		"video_url": "https://res.cloudinary.com/ddskipu10/video/upload/v1778484853/codecamp/videos/bffyy4vzlsnmwfboorwu.mp4",
	})
}

func (h *VideoHandler) Upload(c *gin.Context) {
	if h.cfg.CloudinaryCloud == "" || h.cfg.CloudinaryKey == "" || h.cfg.CloudinarySecret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cloudinary config is missing"})
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
	folder := "codecamp/videos"
	signature := signCloudinary("folder="+folder+"&timestamp="+timestamp, h.cfg.CloudinarySecret)

	writer.WriteField("api_key", h.cfg.CloudinaryKey)
	writer.WriteField("timestamp", timestamp)
	writer.WriteField("folder", folder)
	writer.WriteField("signature", signature)
	writer.Close()

	url := "https://api.cloudinary.com/v1_1/" + h.cfg.CloudinaryCloud + "/video/upload"
	req, err := http.NewRequest(http.MethodPost, url, body)
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
		"video_url": upload.SecureURL,
		"public_id": upload.PublicID,
		"duration":  upload.Duration,
		"bytes":     upload.Bytes,
		"format":    upload.Format,
	})
}

func (h *VideoHandler) SignedURL(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"lesson_id":   c.Param("lessonId"),
		"expires_in":  7200,
		"signed_url":  "https://res.cloudinary.com/ddskipu10/video/upload/v1778484853/codecamp/videos/bffyy4vzlsnmwfboorwu.mp4",
		"video_url":   "https://res.cloudinary.com/ddskipu10/video/upload/v1778484853/codecamp/videos/bffyy4vzlsnmwfboorwu.mp4",
		"can_preview": true,
	})
}

func signCloudinary(payload string, secret string) string {
	sum := sha1.Sum([]byte(payload + secret))
	return hex.EncodeToString(sum[:])
}
