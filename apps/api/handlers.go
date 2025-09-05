package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// getStateHandler marshals the current appState to JSON and sends it as a response.
func getStateHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(appState)
}

// getConfigHandler returns the current application configuration.
func getConfigHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(appConfig)
}

// suggestHandler handles the logic for adding new suggestions for a round.
func suggestHandler(w http.ResponseWriter, r *http.Request) {
	var req SuggestRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if len(appState.CurrentRound.Suggestions) > 0 {
		http.Error(w, "Suggestions have already been made for this round.", http.StatusConflict)
		return
	}
	expectedCount := appConfig.Suggestions.DefaultCount
	if len(req.Suggestions) != expectedCount {
		http.Error(w, fmt.Sprintf("Exactly %d suggestions are required.", expectedCount), http.StatusBadRequest)
		return
	}

	appState.CurrentRound.Suggestions = req.Suggestions

	if err := saveState(); err != nil {
		http.Error(w, "Failed to save state", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Suggestions submitted successfully.")
}

// voteHandler accepts a member's vote and adds it to the current round.
func voteHandler(w http.ResponseWriter, r *http.Request) {
	var req VoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if appState.CurrentRound.IsVotingClosed {
		http.Error(w, "Voting is closed for this round", http.StatusConflict)
		return
	}
	// Initialize with the correct, specific type
	if appState.CurrentRound.Votes == nil {
		appState.CurrentRound.Votes = make(map[string]map[string]int)
	}
	appState.CurrentRound.Votes[req.Member] = req.Rankings

	if err := saveState(); err != nil {
		http.Error(w, "Failed to save state", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Vote from %s recorded successfully.", req.Member)
}

// closeVotingHandler calculates the winner and ends the voting phase.
func closeVotingHandler(w http.ResponseWriter, r *http.Request) {
	if appState.CurrentRound.IsVotingClosed {
		http.Error(w, "Voting is already closed", http.StatusConflict)
		return
	}

	// This logic is now much simpler and type-safe
	scores := make(map[string]int)
	for _, memberVotes := range appState.CurrentRound.Votes {
		for itemTitle, rank := range memberVotes {
			points := 0
			if rank == 1 {
				points = 3
			} else if rank == 2 {
				points = 2
			} else if rank == 3 {
				points = 1
			}
			scores[itemTitle] += points
		}
	}

	// Find the winning title
	var winningTitle string
	maxScore := -1
	for title, score := range scores {
		if score > maxScore {
			maxScore = score
			winningTitle = title
		}
	}

	// Find the winning item object from suggestions and set it
	for _, suggestion := range appState.CurrentRound.Suggestions {
		if suggestion["title"] == winningTitle {
			appState.CurrentRound.WinningItem = suggestion
			break
		}
	}

	appState.CurrentRound.IsVotingClosed = true

	if err := saveState(); err != nil {
		http.Error(w, "Failed to save state", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(appState.CurrentRound.WinningItem)
}

// completionStatusHandler toggles the completion status for a member.
func completionStatusHandler(w http.ResponseWriter, r *http.Request) {
	var req CompletionStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// CHANGE IS HERE: Always set to true, never toggle back to false.
	appState.CurrentRound.CompletionStatus[req.Member] = true

	if err := saveState(); err != nil {
		http.Error(w, "Failed to save state", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Completion status for %s updated.", req.Member)
}

// discussedHandler marks the current round as discussed.
func discussedHandler(w http.ResponseWriter, r *http.Request) {
	appState.CurrentRound.IsDiscussed = true
	if err := saveState(); err != nil {
		http.Error(w, "Failed to save state", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Round marked as discussed.")
}

// nextRoundHandler saves the round to history and advances to the next picker.
func nextRoundHandler(w http.ResponseWriter, r *http.Request) {
	if !appState.CurrentRound.IsDiscussed {
		http.Error(w, "The current round has not been marked as discussed yet", http.StatusConflict)
		return
	}

	// 1. Save to history
	historyEntry := HistoryEntry{
		WinningItem:   appState.CurrentRound.WinningItem,
		Picker:        appState.Members[appState.CurrentPickerIndex],
		DateCompleted: time.Now().Format("2006-01-02"),
	}
	appState.History = append(appState.History, historyEntry)

	// 2. Advance picker
	appState.CurrentPickerIndex = (appState.CurrentPickerIndex + 1) % len(appState.Members)

	// 3. Reset round
	newCompletionStatus := make(map[string]bool)
	for _, member := range appState.Members {
		newCompletionStatus[member] = false
	}
	appState.CurrentRound = Round{
		Suggestions:      []map[string]string{},
		Votes:            make(map[string]map[string]int), // Use correct type here
		IsVotingClosed:   false,
		WinningItem:      nil,
		CompletionStatus: newCompletionStatus,
		IsDiscussed:      false,
	}

	if err := saveState(); err != nil {
		http.Error(w, "Failed to save state", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "New round started. Picker is now %s.", appState.Members[appState.CurrentPickerIndex])
}

func resetStateHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Decode the incoming JSON body into a new AppState struct
	var newState AppState
	if err := json.NewDecoder(r.Body).Decode(&newState); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// 2. Replace the current in-memory state with the new state
	appState = newState

	// 3. Save the new state to the file
	if err := saveState(); err != nil {
		http.Error(w, "Failed to save state", http.StatusInternalServerError)
		return
	}

	// 4. Respond with success
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "State has been reset successfully.")
}
