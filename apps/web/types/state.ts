export interface AppState {
  clubName: string;
  clubType: string;
  members: string[];
  currentPickerIndex: number;
  currentRound: {
    suggestions: { title: string; author: string }[];
    votes: { [memberName: string]: { [bookTitle: string]: number } };
    isVotingClosed: boolean;
    winningItem: { title: string; author: string } | null;
    completionStatus: { [key: string]: boolean };
    isDiscussed: boolean;
  };
  history: HistoryEntry[];
}

export interface HistoryEntry {
  winningItem: { title: string; author: string };
  picker: string;
  dateCompleted: string;
}
