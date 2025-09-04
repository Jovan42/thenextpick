package main

// SuggestRequest defines the structure for the /api/suggest request body.
type SuggestRequest struct {
	Suggestions []map[string]string `json:"suggestions"`
}

// VoteRequest defines the structure for a member's vote.
type VoteRequest struct {
	Member   string         `json:"member"`
	Rankings map[string]int `json:"rankings"`
}

// CompletionStatusRequest defines the structure for toggling a member's status.
type CompletionStatusRequest struct {
	Member string `json:"member"`
}
