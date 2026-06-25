package main

import (
	"log"

	"media-service/internal/config"
	"media-service/internal/routes"
)

func main() {
	cfg := config.Load()

	r := routes.SetupRouter(cfg)
	log.Printf("media service running on port %s", cfg.Port)

	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
