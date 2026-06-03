package media

const attachmentFolder = "codecamp/attachments"

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

type apiError struct {
	Status  int
	Message string
}

func (e apiError) Error() string { return e.Message }
