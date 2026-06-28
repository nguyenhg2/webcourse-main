package controllers

import (
	"errors"
	"io"
	"net/http"
	"strings"

	"media-service/internal/config"
	"media-service/internal/models"
	"media-service/internal/services"

	"github.com/gin-gonic/gin"
)

func RegisterMediaRoutes(g *gin.RouterGroup, cfg *config.Config) {
	g.POST("/images/upload", func(c *gin.Context) { uploadImage(c, cfg) })
	g.POST("/videos/upload", func(c *gin.Context) { uploadVideo(c, cfg) })
	g.DELETE("/videos/delete", func(c *gin.Context) { deleteMedia(c, cfg) })
	g.DELETE("/files/delete", func(c *gin.Context) { deleteMedia(c, cfg) })
	g.POST("/files/upload", func(c *gin.Context) { uploadFile(c, cfg) })
}

func RegisterSignedURLRoute(g *gin.RouterGroup, cfg *config.Config) {
	g.POST("/files/signed-url", func(c *gin.Context) { signedURL(c, cfg) })
}

func RegisterInternalMediaRoutes(g *gin.RouterGroup, cfg *config.Config) {
	g.POST("/files/signed-url", func(c *gin.Context) { signedURL(c, cfg) })
}

func uploadImage(c *gin.Context, cfg *config.Config) {
	folder := strings.Trim(strings.TrimSpace(c.PostForm("folder")), "/")
	if folder == "" {
		folder = "codecamp/course-covers"
	}

	data, err := upload(c, cfg, "image", folder)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"image_url":      data.URL,
		"url":            data.URL,
		"object_key":     data.ObjectKey,
		"storage_folder": data.StorageFolder,
		"bytes":          data.Bytes,
		"format":         data.Format,
		"content_type":   data.ContentType,
		"name":           data.OriginalName,
		"expires_at":     data.ExpiresAt,
		"storage":        "cloudflare_r2",
	})
}

func uploadVideo(c *gin.Context, cfg *config.Config) {
	folder := strings.Trim(strings.TrimSpace(c.PostForm("folder")), "/")
	if folder == "" {
		writeError(c, models.APIError{Status: http.StatusBadRequest, Message: "Vui lòng nhập thư mục lưu trữ"})
		return
	}

	data, err := upload(c, cfg, "video", folder)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"video_url":      data.URL,
		"url":            data.URL,
		"object_key":     data.ObjectKey,
		"storage_folder": data.StorageFolder,
		"delivery_type":  "r2_signed_url",
		"bytes":          data.Bytes,
		"format":         data.Format,
		"content_type":   data.ContentType,
		"name":           data.OriginalName,
		"expires_at":     data.ExpiresAt,
		"storage":        "cloudflare_r2",
	})
}

func uploadFile(c *gin.Context, cfg *config.Config) {
	data, err := upload(c, cfg, "file", models.AttachmentFolder)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"name":           data.OriginalName,
		"url":            data.URL,
		"object_key":     data.ObjectKey,
		"storage_folder": data.StorageFolder,
		"bytes":          data.Bytes,
		"format":         data.Format,
		"content_type":   data.ContentType,
		"expires_at":     data.ExpiresAt,
		"storage":        "cloudflare_r2",
	})
}

func deleteMedia(c *gin.Context, cfg *config.Config) {
	var req models.DeleteMediaRequest
	if err := c.ShouldBindJSON(&req); err != nil && err != io.EOF {
		writeError(c, models.APIError{Status: http.StatusBadRequest, Message: "object_key là bắt buộc"})
		return
	}

	key := objectKeyFromRequest(req.ObjectKey)
	if key == "" {
		writeError(c, models.APIError{Status: http.StatusBadRequest, Message: "object_key là bắt buộc"})
		return
	}

	if err := services.DeleteObject(c.Request.Context(), cfg, key); err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"object_key": key, "deleted": true})
}

func signedURL(c *gin.Context, cfg *config.Config) {
	var req models.SignedURLRequest
	if err := c.ShouldBindJSON(&req); err != nil && err != io.EOF {
		writeError(c, models.APIError{Status: http.StatusBadRequest, Message: "object_key là bắt buộc"})
		return
	}

	key := objectKeyFromRequest(req.ObjectKey)
	if key == "" {
		writeError(c, models.APIError{Status: http.StatusBadRequest, Message: "object_key là bắt buộc"})
		return
	}

	url, expiresAt, err := services.SignedURL(c.Request.Context(), cfg, key, req.ExpiresIn)
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"url":        url,
		"object_key": key,
		"expires_at": expiresAt,
		"storage":    "cloudflare_r2",
	})
}

func upload(c *gin.Context, cfg *config.Config, formField string, folder string) (models.MediaObject, error) {
	file, header, err := c.Request.FormFile(formField)
	if err != nil {
		return models.MediaObject{}, models.APIError{Status: http.StatusBadRequest, Message: "Vui lòng chọn tệp để tải lên"}
	}
	defer file.Close()

	return services.UploadFile(c.Request.Context(), cfg, file, header, folder)
}

func objectKeyFromRequest(objectKey string) string {
	return strings.Trim(strings.TrimSpace(objectKey), "/")
}

func writeError(c *gin.Context, err error) {
	var apiErr models.APIError
	if errors.As(err, &apiErr) {
		c.JSON(apiErr.Status, gin.H{"error": apiErr.Message})
		return
	}
	c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
}
