# Media Service

Go service for Cloudinary-backed media uploads and deletion.

## Structure

```text
cmd/main.go              Starts the app and loads config
internal/routes          ApiRoute.go registers HTTP routes
internal/controllers     MediaController.go handles HTTP request/response
internal/services        CloudinaryService.go talks to Cloudinary
internal/models          MediaModel.go stores request/response structs
internal/middleware      JWT, role checks, CORS
internal/config          Environment config
```

## Routes

```text
POST   /api/videos/upload  Upload video, form fields: video, folder
DELETE /api/videos/delete  Delete video, JSON field: public_id
POST   /api/files/upload   Upload attachment, form field: file
```

## Data

This service is stateless and does not own a database. Course and lesson media metadata stays in the core database, for example `video_url`, `video_public_id`, `video_asset_folder`, and `attachments` on lesson documents.
