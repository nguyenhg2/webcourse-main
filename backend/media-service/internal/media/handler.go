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
	folder := cleanFolder(c.PostForm("folder"))
	if folder == "" {
		writeError(c, apiError{Status: http.StatusBadRequest, Message: "folder is required"})
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
		writeError(c, apiError{Status: http.StatusBadRequest, Message: "public_id is required"})
		return
	}

	publicID := strings.TrimSpace(payload.PublicID)
	if publicID == "" {
		writeError(c, apiError{Status: http.StatusBadRequest, Message: "public_id is required"})
		return
	}

	body, err := postCloudinaryForm(h.cloudinaryURL("video", "destroy"), h.destroyForm(publicID))
	if err != nil {
		writeError(c, err)
		return
	}

	writeDeleteResult(c, publicID, body)
}

func (h *Handler) upload(c *gin.Context, formField string, resourceType string, folder string) (*uploadResult, error) {
	if err := h.ensureCloudinaryConfig(); err != nil {
		return nil, err
	}

	file, header, err := c.Request.FormFile(formField)
	if err != nil {
		return nil, apiError{Status: http.StatusBadRequest, Message: "choose a file to upload"}
	}
	defer file.Close()

	body, contentType, err := h.uploadBody(file, header.Filename, folder)
	if err != nil {
		return nil, err
	}

	respBody, err := postCloudinaryMultipart(h.cloudinaryURL(resourceType, "upload"), body, contentType)
	if err != nil {
		return nil, err
	}

	var upload cloudinaryUpload
	if err := json.Unmarshal(respBody, &upload); err != nil {
		return nil, err
	}

	return &uploadResult{FileName: header.Filename, Folder: folder, Data: upload}, nil
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
