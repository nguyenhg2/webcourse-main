# Media Service

Go service for Cloudinary-backed media uploads and deletion.

## Structure

```text
cmd/main.go              Starts the app and loads config
internal/router          Registers HTTP routes
internal/media           Video/file upload and Cloudinary video deletion
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

## Check

```bash
go test ./...
```
