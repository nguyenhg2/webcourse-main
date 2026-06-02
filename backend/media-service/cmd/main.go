package main

import (
	"log"

	"media-service/internal/config"
	"media-service/internal/router"
)

func main() {
	cfg := config.Load()

	r := router.SetupRouter(cfg)

	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}
