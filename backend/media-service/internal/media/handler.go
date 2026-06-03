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
	g.POST("/upload", func(c *gin.Context) { uploadVideo(c, cfg) })
	g.DELETE("/delete", func(c *gin.Context) { deleteVideo(c, cfg) })
}

func RegisterFileRoutes(g *gin.RouterGroup, cfg *config.Config) {
	g.POST("/upload", func(c *gin.Context) { uploadFile(c, cfg) })
}

func uploadVideo(c *gin.Context, cfg *config.Config) {
	folder := cleanFolder(c.PostForm("folder"))
	if folder == "" {
		writeError(c, apiError{Status: http.StatusBadRequest, Message: "folder is required"})
		return
	}

	upload, err := upload(c, cfg, "video", "video", folder)
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

func uploadFile(c *gin.Context, cfg *config.Config) {
	upload, err := upload(c, cfg, "file", "raw", attachmentFolder)
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

func deleteVideo(c *gin.Context, cfg *config.Config) {
	if err := ensureCloudinaryConfig(cfg); err != nil {
		writeError(c, err)
		return
	}

	var req deleteVideoRequest
	if err := c.ShouldBindJSON(&req); err != nil && err != io.EOF {
		writeError(c, apiError{Status: http.StatusBadRequest, Message: "public_id is required"})
		return
	}

	publicID := strings.TrimSpace(req.PublicID)
	if publicID == "" {
		writeError(c, apiError{Status: http.StatusBadRequest, Message: "public_id is required"})
		return
	}

	body, err := postCloudinaryForm(cloudinaryURL(cfg, "video", "destroy"), destroyForm(cfg, publicID))
	if err != nil {
		writeError(c, err)
		return
	}

	writeDeleteResult(c, publicID, body)
}

func upload(c *gin.Context, cfg *config.Config, formField string, resourceType string, folder string) (*uploadResult, error) {
	if err := ensureCloudinaryConfig(cfg); err != nil {
		return nil, err
	}

	file, header, err := c.Request.FormFile(formField)
	if err != nil {
		return nil, apiError{Status: http.StatusBadRequest, Message: "choose a file to upload"}
	}
	defer file.Close()

	body, contentType, err := uploadBody(cfg, file, header.Filename, folder)
	if err != nil {
		return nil, err
	}

	respBody, err := postCloudinaryMultipart(cloudinaryURL(cfg, resourceType, "upload"), body, contentType)
	if err != nil {
		return nil, err
	}

	var data cloudinaryUpload
	if err := json.Unmarshal(respBody, &data); err != nil {
		return nil, err
	}

	return &uploadResult{FileName: header.Filename, Folder: folder, Data: data}, nil
}

func writeDeleteResult(c *gin.Context, publicID string, body []byte) {
	var result map[string]any
	if err := json.Unmarshal(body, &result); err != nil {
		c.JSON(http.StatusOK, gin.H{"public_id": publicID, "raw": string(body)})
		return
	}

	result["public_id"] = publicID
	c.JSON(http.StatusOK, result)
}

func writeError(c *gin.Context, err error) {
	var apiErr apiError
	if errors.As(err, &apiErr) {
		c.JSON(apiErr.Status, gin.H{"error": apiErr.Message})
		return
	}
	c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
}

func cleanFolder(folder string) string {
	return strings.Trim(strings.TrimSpace(folder), "/")
}
