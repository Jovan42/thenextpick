export interface AppState {
  clubName: string;
  members: string[];
  currentPickerIndex: number;
  currentRound: {
    suggestions: { title: string; author: string }[];
    votes: { [memberName: string]: { [bookTitle: string]: number } }; // <-- Add this line
    isVotingClosed: boolean;
    winningItem: { title: string; author: string } | null;
    completionStatus: { [key: string]: boolean };
    isDiscussed: boolean;
  };
  history: any[];
}
