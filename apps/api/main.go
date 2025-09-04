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
	data, err := os.ReadFile(dataFilePath)

	// If the file doesn't exist, create a default state.
	if os.IsNotExist(err) {
		fmt.Println("data.json not found, creating a default initial state.")
		// Create a default state for the very first run
		appState = AppState{
			ClubName:           "My New Club",
			ClubType:           "Books",
			Members:            []string{"Admin"},
			CurrentPickerIndex: 0,
			CurrentRound: Round{
				Suggestions:      []map[string]string{},
				Votes:            make(map[string]map[string]int),
				IsVotingClosed:   false,
				WinningItem:      nil,
				CompletionStatus: map[string]bool{"Admin": false},
				IsDiscussed:      false,
			},
			History: []HistoryEntry{},
		}
		// Save this new default state to the persistent disk
		if err := saveState(); err != nil {
			log.Fatalf("Could not create initial state file: %v", err)
		}
		return // Continue successfully
	}
	
	// If there's another type of error, then we should crash.
	if err != nil {
		log.Fatalf("Error reading state file: %v", err)
	}

	// If the file exists, load it as before.
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
