# Media Service

Go service for Cloudflare R2-backed media upload, deletion, and short-lived signed URLs.

## Structure

```text
cmd/main.go              Starts the app and loads config
internal/routes          ApiRoute.go registers HTTP routes
internal/controllers     MediaController.go handles HTTP request/response
internal/services        R2Service.go talks to Cloudflare R2
internal/models          MediaModel.go stores request/response structs
internal/middleware      JWT, internal token, role checks, CORS
internal/config          Environment config
```

## Routes

```text
POST   /api/images/upload        Upload image, form fields: image, folder
POST   /api/videos/upload        Upload video, form fields: video, folder
POST   /api/files/upload         Upload attachment, form field: file
POST   /api/files/signed-url     Create a short-lived signed URL for a logged-in user
DELETE /api/videos/delete        Delete object, JSON field: object_key
DELETE /api/files/delete         Delete object, JSON field: object_key
POST   /internal/files/signed-url Create signed URL for Core Service with X-Internal-Token
```

## Data

This service is stateless and does not own a database. Course and lesson media metadata stays in the core database.

Lessons store video metadata with `video_object_key` and `video_storage_folder`.
