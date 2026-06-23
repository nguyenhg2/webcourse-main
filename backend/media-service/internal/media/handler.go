package media

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"

	"media-service/internal/config"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(g *gin.RouterGroup, cfg *config.Config) {
	g.POST("/images/upload", func(c *gin.Context) { uploadImage(c, cfg) })
	g.POST("/videos/upload", func(c *gin.Context) { uploadVideo(c, cfg) })
	g.DELETE("/videos/delete", func(c *gin.Context) { deleteVideo(c, cfg) })
	g.POST("/files/upload", func(c *gin.Context) { uploadFile(c, cfg) })
}

func uploadImage(c *gin.Context, cfg *config.Config) {
	folder := strings.Trim(strings.TrimSpace(c.PostForm("folder")), "/")
	if folder == "" {
		folder = "codecamp/course-covers"
	}

	data, fileName, err := upload(c, cfg, "image", "image", folder, "")
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"image_url":    data.SecureURL,
		"url":          data.SecureURL,
		"public_id":    data.PublicID,
		"asset_folder": folder,
		"bytes":        data.Bytes,
		"format":       data.Format,
		"name":         fileName,
	})
}

func uploadVideo(c *gin.Context, cfg *config.Config) {
	folder := strings.Trim(strings.TrimSpace(c.PostForm("folder")), "/")
	if folder == "" {
		writeError(c, apiError{Status: http.StatusBadRequest, Message: "Vui lòng nhập thư mục"})
		return
	}

	data, fileName, err := upload(c, cfg, "video", "video", folder, "authenticated")
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"video_url":    data.SecureURL,
		"public_id":    data.PublicID,
		"asset_folder": folder,
		"delivery_type": data.Type,
		"duration":     data.Duration,
		"bytes":        data.Bytes,
		"format":       data.Format,
		"version":      data.Version,
		"name":         fileName,
	})
}

func uploadFile(c *gin.Context, cfg *config.Config) {
	data, fileName, err := upload(c, cfg, "file", "raw", attachmentFolder, "")
	if err != nil {
		writeError(c, err)
		return
	}

	name := data.OriginalName
	if name == "" {
		name = fileName
	}

	c.JSON(http.StatusOK, gin.H{
		"name":         name,
		"url":          data.SecureURL,
		"public_id":    data.PublicID,
		"asset_folder": attachmentFolder,
		"bytes":        data.Bytes,
		"format":       data.Format,
	})
}

func deleteVideo(c *gin.Context, cfg *config.Config) {
	if err := ensureCloudinaryConfig(cfg); err != nil {
		writeError(c, err)
		return
	}

	var req deleteVideoRequest
	if err := c.ShouldBindJSON(&req); err != nil && err != io.EOF {
		writeError(c, apiError{Status: http.StatusBadRequest, Message: "public_id là bắt buộc"})
		return
	}

	publicID := strings.TrimSpace(req.PublicID)
	if publicID == "" {
		writeError(c, apiError{Status: http.StatusBadRequest, Message: "public_id là bắt buộc"})
		return
	}

	body, err := cloudinaryPostForm(cloudinaryURL(cfg, "video", "destroy"), destroyForm(cfg, publicID))
	if err != nil {
		writeError(c, err)
		return
	}

	var result map[string]any
	if err := json.Unmarshal(body, &result); err != nil {
		c.JSON(http.StatusOK, gin.H{"public_id": publicID, "raw": string(body)})
		return
	}
	result["public_id"] = publicID
	c.JSON(http.StatusOK, result)
}

func upload(c *gin.Context, cfg *config.Config, formField string, resourceType string, folder string, deliveryType string) (cloudinaryUpload, string, error) {
	if err := ensureCloudinaryConfig(cfg); err != nil {
		return cloudinaryUpload{}, "", err
	}

	file, header, err := c.Request.FormFile(formField)
	if err != nil {
		return cloudinaryUpload{}, "", apiError{Status: http.StatusBadRequest, Message: "Vui lòng chọn tệp để tải lên"}
	}
	defer file.Close()

	body, contentType, err := uploadBody(cfg, file, header.Filename, folder, deliveryType)
	if err != nil {
		return cloudinaryUpload{}, "", err
	}

	respBody, err := cloudinaryPostMultipart(cloudinaryURL(cfg, resourceType, "upload"), body, contentType)
	if err != nil {
		return cloudinaryUpload{}, "", err
	}

	var data cloudinaryUpload
	if err := json.Unmarshal(respBody, &data); err != nil {
		return cloudinaryUpload{}, "", err
	}
	return data, header.Filename, nil
}

func writeError(c *gin.Context, err error) {
	var apiErr apiError
	if errors.As(err, &apiErr) {
		c.JSON(apiErr.Status, gin.H{"error": apiErr.Message})
		return
	}
	c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
}
