package main

type AppState struct {
	ClubName           string         `json:"clubName"`
	ClubType           string         `json:"clubType"`
	Members            []string       `json:"members"`
	CurrentPickerIndex int            `json:"currentPickerIndex"`
	CurrentRound       Round          `json:"currentRound"`
	History            []HistoryEntry `json:"history"`
}

type Round struct {
	Suggestions      []map[string]string       `json:"suggestions"`
	Votes            map[string]map[string]int `json:"votes"`	
	IsVotingClosed   bool                      `json:"isVotingClosed"`
	WinningItem      map[string]string         `json:"winningItem"`
	CompletionStatus map[string]bool           `json:"completionStatus"`
	IsDiscussed      bool                      `json:"isDiscussed"`
}

type HistoryEntry struct {
	WinningItem   map[string]string `json:"winningItem"`
	Picker        string            `json:"picker"`
	DateCompleted string            `json:"dateCompleted"`
}
