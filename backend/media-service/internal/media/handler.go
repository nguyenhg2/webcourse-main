package media

import (
	"bytes"
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"media-service/internal/config"

	"github.com/gin-gonic/gin"
)

const attachmentFolder = "codecamp/attachments"

type Handler struct {
	cfg *config.Config
}

type cloudinaryUpload struct {
	SecureURL    string  `json:"secure_url"`
	PublicID     string  `json:"public_id"`
	Duration     float64 `json:"duration"`
	Bytes        int64   `json:"bytes"`
	Format       string  `json:"format"`
	OriginalName string  `json:"original_filename"`
}

type deleteVideoRequest struct {
	PublicID string `json:"public_id"`
	VideoURL string `json:"video_url"`
}

type uploadResult struct {
	FileName string
	Folder   string
	Data     cloudinaryUpload
}

type apiError struct {
	Status  int
	Message string
}

func (e apiError) Error() string { return e.Message }

func RegisterRoutes(g *gin.RouterGroup, cfg *config.Config) {
	h := &Handler{cfg: cfg}
	g.POST("/upload", h.UploadVideo)
	g.DELETE("/delete", h.DeleteVideo)
}

func RegisterFileRoutes(g *gin.RouterGroup, cfg *config.Config) {
	h := &Handler{cfg: cfg}
	g.POST("/upload", h.UploadFile)
}

func (h *Handler) UploadVideo(c *gin.Context) {
	folder := strings.Trim(strings.TrimSpace(c.PostForm("folder")), "/")
	if folder == "" {
		writeError(c, apiError{Status: http.StatusBadRequest, Message: "Vui lòng nhập thư mục Cloudinary"})
		return
	}

	upload, err := h.upload(c, "video", "video", folder)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"video_url":    upload.Data.SecureURL,
		"public_id":    upload.Data.PublicID,
		"asset_folder": upload.Folder,
		"duration":     upload.Data.Duration,
		"bytes":        upload.Data.Bytes,
		"format":       upload.Data.Format,
	})
}

func (h *Handler) UploadFile(c *gin.Context) {
	upload, err := h.upload(c, "file", "raw", attachmentFolder)
	if err != nil {
		writeError(c, err)
		return
	}

	name := upload.Data.OriginalName
	if name == "" {
		name = upload.FileName
	}

	c.JSON(http.StatusOK, gin.H{
		"name":         name,
		"url":          upload.Data.SecureURL,
		"public_id":    upload.Data.PublicID,
		"asset_folder": upload.Folder,
		"bytes":        upload.Data.Bytes,
		"format":       upload.Data.Format,
	})
}

func (h *Handler) DeleteVideo(c *gin.Context) {
	if err := h.ensureCloudinaryConfig(); err != nil {
		writeError(c, err)
		return
	}

	var payload deleteVideoRequest
	if err := c.ShouldBindJSON(&payload); err != nil && err != io.EOF {
		writeError(c, apiError{Status: http.StatusBadRequest, Message: "Vui lòng gửi public_id hoặc video_url"})
		return
	}

	publicID := strings.TrimSpace(payload.PublicID)
	if publicID == "" {
		publicID = cloudinaryPublicIDFromURL(payload.VideoURL)
	}
	if publicID == "" {
		writeError(c, apiError{Status: http.StatusBadRequest, Message: "public_id hoặc Cloudinary video_url không hợp lệ"})
		return
	}

	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	form := url.Values{}
	form.Set("api_key", h.cfg.CloudinaryKey)
	form.Set("timestamp", timestamp)
	form.Set("public_id", publicID)
	form.Set("invalidate", "true")
	form.Set("signature", signCloudinary("invalidate=true&public_id="+publicID+"&timestamp="+timestamp, h.cfg.CloudinarySecret))

	destroyURL := "https://api.cloudinary.com/v1_1/" + h.cfg.CloudinaryCloud + "/video/destroy"
	resp, err := http.PostForm(destroyURL, form)
	if err != nil {
		writeError(c, apiError{Status: http.StatusBadGateway, Message: err.Error()})
		return
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= http.StatusMultipleChoices {
		writeError(c, apiError{Status: resp.StatusCode, Message: string(respBody)})
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

func (h *Handler) upload(c *gin.Context, formField string, resourceType string, folder string) (*uploadResult, error) {
	if err := h.ensureCloudinaryConfig(); err != nil {
		return nil, err
	}

	file, header, err := c.Request.FormFile(formField)
	if err != nil {
		return nil, apiError{Status: http.StatusBadRequest, Message: "Vui lòng chọn tệp"}
	}
	defer file.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("file", header.Filename)
	if err != nil {
		return nil, err
	}
	if _, err := io.Copy(part, file); err != nil {
		return nil, err
	}

	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	signaturePayload := "asset_folder=" + folder + "&timestamp=" + timestamp
	writer.WriteField("api_key", h.cfg.CloudinaryKey)
	writer.WriteField("timestamp", timestamp)
	writer.WriteField("asset_folder", folder)
	writer.WriteField("signature", signCloudinary(signaturePayload, h.cfg.CloudinarySecret))
	writer.Close()

	uploadURL := "https://api.cloudinary.com/v1_1/" + h.cfg.CloudinaryCloud + "/" + resourceType + "/upload"
	req, err := http.NewRequest(http.MethodPost, uploadURL, body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, apiError{Status: http.StatusBadGateway, Message: err.Error()}
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= http.StatusMultipleChoices {
		return nil, apiError{Status: resp.StatusCode, Message: string(respBody)}
	}

	var upload cloudinaryUpload
	if err := json.Unmarshal(respBody, &upload); err != nil {
		return nil, err
	}

	return &uploadResult{FileName: header.Filename, Folder: folder, Data: upload}, nil
}

func (h *Handler) ensureCloudinaryConfig() error {
	if h.cfg.CloudinaryCloud == "" || h.cfg.CloudinaryKey == "" || h.cfg.CloudinarySecret == "" {
		return apiError{Status: http.StatusInternalServerError, Message: "Thiếu cấu hình Cloudinary"}
	}
	return nil
}

func writeError(c *gin.Context, err error) {
	if apiErr, ok := err.(apiError); ok {
		c.JSON(apiErr.Status, gin.H{"error": apiErr.Message})
		return
	}
	c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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
