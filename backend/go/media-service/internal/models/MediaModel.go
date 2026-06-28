package models

const AttachmentFolder = "codecamp/attachments"

type MediaObject struct {
	URL           string `json:"url"`
	ObjectKey     string `json:"object_key"`
	StorageFolder string `json:"storage_folder"`
	Bytes         int64  `json:"bytes"`
	Format        string `json:"format"`
	ContentType   string `json:"content_type"`
	OriginalName  string `json:"original_filename"`
	ExpiresAt     int64  `json:"expires_at,omitempty"`
}

type DeleteMediaRequest struct {
	ObjectKey string `json:"object_key"`
}

type SignedURLRequest struct {
	ObjectKey string `json:"object_key"`
	ExpiresIn int64  `json:"expires_in"`
}

type APIError struct {
	Status  int
	Message string
}

func (e APIError) Error() string {
	return e.Message
}
