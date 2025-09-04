"use client";

import { useState, useEffect } from 'react';
import { AppState } from '../types/state'; // We'll create this new file for types
import SuggestionView from '../components/SuggestionView';
import VotingView from '../components/VotingView';
import ReadingView from '../components/ReadingView';

export default function Page() {
  const [state, setState] = useState<AppState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchState = () => {
    fetch('https://thenextpick-api.onrender.com/api/state')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => setState(data))
      .catch(error => setError(error.toString()));
  };

  useEffect(() => {
    fetchState();
  }, []);

  const renderCurrentView = () => {
    if (!state) return <h2>Loading...</h2>;

    const { currentRound } = state;

    // 1. Suggestion Phase
    if (currentRound.suggestions.length === 0) {
      return <SuggestionView appState={state} onSuggestionsSubmitted={fetchState} />;
    }

    // 2. Voting Phase (Placeholder)
    if (!currentRound.isVotingClosed) {
      return <VotingView appState={state} onUpdateState={fetchState} />;
    }

    // 3. Reading/Results Phase (Placeholder)
    if (currentRound.winningItem) {
        return <ReadingView appState={state} onUpdateState={fetchState} />;
    }

    return <h2>Unknown State</h2>;
  };

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>{state ? state.clubName : 'TheNextPick'}</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc' }}>
        {renderCurrentView()}
      </div>
    </main>
  );
}
