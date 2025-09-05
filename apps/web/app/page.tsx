"use client";

import { useState, useEffect } from 'react';
import { AppState } from '../types/state';
import SuggestionView from '../components/SuggestionView';
import VotingView from '../components/VotingView';
import ReadingView from '../components/ReadingView';
import HistoryPanel from '../components/HistoryPanel';

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
    <main style={{ 
      fontFamily: 'sans-serif', 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: '#ffffff',
      minHeight: '100vh'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', color: '#1a1a1a' }}>
          {state ? state.clubName : 'TheNextPick'}
        </h1>
        {state && (
          <p style={{ margin: 0, color: '#4a4a4a', fontSize: '1.1rem' }}>
            {state.clubType} Club
          </p>
        )}
      </header>
      
      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          Error: {error}
        </div>
      )}
      
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1.5rem', 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {renderCurrentView()}
      </div>
      
      {state && <HistoryPanel appState={state} />}
    </main>
  );
}
