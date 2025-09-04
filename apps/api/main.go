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

const dataFilePath = "/data/data.json"

func loadState() {
	fmt.Println("Loading state from", dataFilePath)
	// Change the filename to use the constant path
	data, err := os.ReadFile(dataFilePath)
	
	// If the file doesn't exist (e.g., first ever deploy), create a default state.
	if os.IsNotExist(err) {
		fmt.Println("data.json not found, creating default state.")
		// Create a default state here or have a default .json in your repo to copy from.
		// For now, we'll just log a fatal error. In a real app, you'd handle this more gracefully.
		log.Fatalf("data.json not found at %s. Please create an initial file on the persistent disk.", dataFilePath)
	} else if err != nil {
		log.Fatalf("Error reading state file: %v", err)
	}

	if err := json.Unmarshal(data, &appState); err != nil {
		log.Fatalf("Error unmarshaling state file: %v", err)
	}
	fmt.Println("State loaded successfully.")
}

func saveState() error {
	data, err := json.MarshalIndent(appState, "", "  ")
	if err != nil {
		return fmt.Errorf("error marshaling state: %v", err)
	}

	// Change the filename to use the constant path
	if err = os.WriteFile(dataFilePath, data, 0644); err != nil {
		return fmt.Errorf("error writing to state file: %v", err)
	}
	
	fmt.Println("State saved successfully to persistent disk.")
	return nil
}

func main() {
	loadState()
	r := chi.NewRouter()
		r.Use(cors.New(cors.Options{
        AllowedOrigins:   []string{"http://localhost:3000", "https://thenextpick-lzrlaiybi-jovan0042-5768s-projects.vercel.app", "https://thenextpick-web.vercel.app"},
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
