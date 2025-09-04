package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/rs/cors" 
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

// appState will hold our application's state in memory.
var appState AppState

func loadState() {
	fmt.Println("Loading state from data.json...")
	data, err := os.ReadFile("data.json")
	if err != nil {
		log.Fatalf("Error reading data.json: %v", err)
	}
	if err := json.Unmarshal(data, &appState); err != nil {
		log.Fatalf("Error unmarshaling data.json: %v", err)
	}
	fmt.Println("State loaded successfully.")
}

func saveState() error {
	data, err := json.MarshalIndent(appState, "", "  ")
	if err != nil {
		return fmt.Errorf("error marshaling state: %v", err)
	}
	if err = os.WriteFile("data.json", data, 0644); err != nil {
		return fmt.Errorf("error writing to data.json: %v", err)
	}
	fmt.Println("State saved successfully.")
	return nil
}

func main() {
	loadState()
	r := chi.NewRouter()
		r.Use(cors.New(cors.Options{
        AllowedOrigins:   []string{"http://localhost:3000", "https://thenextpick-lzrlaiybi-jovan0042-5768s-projects.vercel.app"},
        AllowCredentials: true,
        Debug:            true,
    }).Handler)

	r.Use(middleware.Logger)

	// Define our API routes
	r.Get("/api/state", getStateHandler)
	r.Post("/api/suggest", suggestHandler)
	r.Post("/api/vote", voteHandler)
	r.Post("/api/round/close-voting", closeVotingHandler)
	r.Post("/api/completion-status", completionStatusHandler)
	r.Post("/api/round/discussed", discussedHandler)
	r.Post("/api/round/next", nextRoundHandler)
	r.Post("/api/reset", resetStateHandler)

	port := ":8080"
	fmt.Printf("Go API server starting on http://localhost%s\n", port)
	log.Fatal(http.ListenAndServe(port, r))
}
