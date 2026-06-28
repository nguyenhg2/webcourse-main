package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"io"
	"mime/multipart"
	"net/http"
	"path"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"media-service/internal/config"
	"media-service/internal/models"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

var safeNamePattern = regexp.MustCompile(`[^a-zA-Z0-9._-]+`)

func EnsureR2Config(cfg *config.Config) error {
	if cfg.R2Endpoint == "" || cfg.R2AccessKeyID == "" || cfg.R2SecretAccessKey == "" || cfg.R2Bucket == "" {
		return models.APIError{Status: http.StatusInternalServerError, Message: "Thiếu cấu hình Cloudflare R2"}
	}
	return nil
}

func UploadFile(ctx context.Context, cfg *config.Config, file multipart.File, header *multipart.FileHeader, folder string) (models.MediaObject, error) {
	if err := EnsureR2Config(cfg); err != nil {
		return models.MediaObject{}, err
	}

	folder = cleanFolder(folder)
	key := objectKey(folder, header.Filename)
	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	client := r2Client(cfg)
	input := &s3.PutObjectInput{
		Bucket:      aws.String(cfg.R2Bucket),
		Key:         aws.String(key),
		Body:        file,
		ContentType: aws.String(contentType),
	}
	if header.Size > 0 {
		input.ContentLength = aws.Int64(header.Size)
	}

	if _, err := client.PutObject(ctx, input); err != nil {
		return models.MediaObject{}, models.APIError{Status: http.StatusBadGateway, Message: err.Error()}
	}

	url, expiresAt, err := SignedURL(ctx, cfg, key, 0)
	if err != nil {
		return models.MediaObject{}, err
	}

	return models.MediaObject{
		URL:           publicURL(cfg, key, url),
		ObjectKey:     key,
		StorageFolder: folder,
		Bytes:         header.Size,
		Format:        strings.TrimPrefix(strings.ToLower(filepath.Ext(header.Filename)), "."),
		ContentType:   contentType,
		OriginalName:  header.Filename,
		ExpiresAt:     expiresAt,
	}, nil
}

func DeleteObject(ctx context.Context, cfg *config.Config, key string) error {
	if err := EnsureR2Config(cfg); err != nil {
		return err
	}
	key = strings.Trim(strings.TrimSpace(key), "/")
	if key == "" {
		return models.APIError{Status: http.StatusBadRequest, Message: "object_key là bắt buộc"}
	}

	_, err := r2Client(cfg).DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(cfg.R2Bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return models.APIError{Status: http.StatusBadGateway, Message: err.Error()}
	}
	return nil
}

func SignedURL(ctx context.Context, cfg *config.Config, key string, expiresIn int64) (string, int64, error) {
	if err := EnsureR2Config(cfg); err != nil {
		return "", 0, err
	}
	key = strings.Trim(strings.TrimSpace(key), "/")
	if key == "" {
		return "", 0, models.APIError{Status: http.StatusBadRequest, Message: "object_key là bắt buộc"}
	}

	ttl := time.Duration(cfg.R2SignedURLTTL) * time.Second
	if expiresIn > 0 {
		ttl = time.Duration(expiresIn) * time.Second
	}
	if ttl < time.Minute {
		ttl = time.Minute
	}
	if ttl > 7*24*time.Hour {
		ttl = 7 * 24 * time.Hour
	}

	presigner := s3.NewPresignClient(r2Client(cfg))
	result, err := presigner.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(cfg.R2Bucket),
		Key:    aws.String(key),
	}, func(options *s3.PresignOptions) {
		options.Expires = ttl
	})
	if err != nil {
		return "", 0, models.APIError{Status: http.StatusBadGateway, Message: err.Error()}
	}
	return result.URL, time.Now().Add(ttl).Unix(), nil
}

func r2Client(cfg *config.Config) *s3.Client {
	awsCfg := aws.Config{
		Region:      "auto",
		Credentials: credentials.NewStaticCredentialsProvider(cfg.R2AccessKeyID, cfg.R2SecretAccessKey, ""),
	}
	return s3.NewFromConfig(awsCfg, func(options *s3.Options) {
		options.BaseEndpoint = aws.String(cfg.R2Endpoint)
		options.UsePathStyle = true
	})
}

func cleanFolder(folder string) string {
	folder = strings.Trim(strings.TrimSpace(folder), "/")
	if folder == "" {
		return "codecamp/uploads"
	}
	parts := strings.Split(folder, "/")
	cleaned := make([]string, 0, len(parts))
	for _, item := range parts {
		item = safeName(item)
		if item != "" {
			cleaned = append(cleaned, item)
		}
	}
	if len(cleaned) == 0 {
		return "codecamp/uploads"
	}
	return strings.Join(cleaned, "/")
}

func objectKey(folder string, filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	name := strings.TrimSuffix(filepath.Base(filename), filepath.Ext(filename))
	name = safeName(name)
	if name == "" {
		name = "file"
	}
	return path.Join(folder, time.Now().Format("20060102"), time.Now().Format("150405")+"-"+randomHex(4)+"-"+name+ext)
}

func safeName(value string) string {
	value = strings.TrimSpace(value)
	value = strings.ReplaceAll(value, " ", "-")
	value = safeNamePattern.ReplaceAllString(value, "-")
	value = strings.Trim(value, "-_.")
	return strings.ToLower(value)
}

func randomHex(size int) string {
	buf := make([]byte, size)
	if _, err := io.ReadFull(rand.Reader, buf); err != nil {
		return "00000000"
	}
	return hex.EncodeToString(buf)
}

func publicURL(cfg *config.Config, key string, fallback string) string {
	if cfg.R2PublicBaseURL == "" {
		return fallback
	}
	return cfg.R2PublicBaseURL + "/" + strings.TrimLeft(key, "/")
}
