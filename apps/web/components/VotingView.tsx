import { useState, useEffect, useMemo } from 'react';
import { AppState } from '../types/state';

interface VotingViewProps {
  appState: AppState;
  onUpdateState: () => void;
}

// ... (rest of the component logic is the same)
type MemberVotes = {
    [memberName: string]: {
      [bookTitle: string]: number;
    };
  };
  
  export default function VotingView({ appState, onUpdateState }: VotingViewProps) {
    const [votes, setVotes] = useState<MemberVotes>({});
    const [error, setError] = useState('');
  
    const liveScores = useMemo(() => {
      const scores: { [title: string]: number } = {};
      appState.currentRound.suggestions.forEach(s => scores[s.title] = 0);
  
      const backendVotes = appState.currentRound.votes || {};
      for (const member in backendVotes) {
        for (const title in backendVotes[member]) {
          const rank = backendVotes[member][title];
          let points = 0;
          if (rank === 1) points = 3;
          else if (rank === 2) points = 2;
          else if (rank === 3) points = 1;
          scores[title] += points;
        }
      }
      return Object.entries(scores).sort((a, b) => b[1] - a[1]);
    }, [appState.currentRound.votes, appState.currentRound.suggestions]);
  
    useEffect(() => {
      const initialVotes: MemberVotes = {};
      const backendVotes = appState.currentRound.votes || {};
      appState.members.forEach(member => {
        initialVotes[member] = backendVotes[member] || {};
      });
      setVotes(initialVotes);
    }, [appState]);
  
    const handleRankChange = (memberName: string, bookTitle: string, rank: number) => {
      setVotes(prev => ({
        ...prev,
        [memberName]: {
          ...prev[memberName],
          [bookTitle]: rank,
        },
      }));
    };
  
    const handleSubmitVote = async (memberName: string) => {
      setError('');
      const memberRankings = votes[memberName];
      const assignedRanks = Object.values(memberRankings).filter(r => r > 0);
  
      if (new Set(assignedRanks).size !== 3 || assignedRanks.length !== 3) {
        setError(`Error for ${memberName}: You must use each point value (3, 2, and 1) exactly once.`);
        return;
      }
  
      try {
        const payload = { member: memberName, rankings: memberRankings };
        const response = await fetch('https://thenextpick-api.onrender.com/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(await response.text());
        onUpdateState();
      } catch (err: any) {
        setError(err.message);
      }
    };
  
    const handleCloseVoting = async () => {
      try {
        const response = await fetch('https://thenextpick-api.onrender.com/api/round/close-voting', { method: 'POST' });
        if (!response.ok) throw new Error(await response.text());
        onUpdateState();
      } catch (err: any) {
        setError(err.message);
      }
    };
  
  return (
    <div>
      <h2>Voting is Active!</h2>
      <p>Assign points to each book. You must use each point value (3, 2, and 1) exactly once.</p>
      
      {/* ▼▼▼ THE ONLY CHANGE IS HERE: Added color: 'black' ▼▼▼ */}
      <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid #007bff', backgroundColor: '#f0f8ff', color: 'black' }}>
        <h4>Live Scores</h4>
        <ol style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
          {liveScores.map(([title, score]) => (
            <li key={title} style={{ marginBottom: '4px' }}>
              <strong>{title}:</strong> {score} points
            </li>
          ))}
        </ol>
      </div>
      {/* ▲▲▲ THE ONLY CHANGE IS HERE ▲▲▲ */}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
        {appState.members.map(member => {
          const isAlreadyVoted = appState.currentRound.votes && appState.currentRound.votes[member];

          return (
            <div key={member} style={{ border: '1px solid #eee', padding: '1rem', opacity: isAlreadyVoted ? 0.6 : 1 }}>
              <h4>{member}'s Vote</h4>
              {appState.currentRound.suggestions.map(suggestion => (
                <div key={suggestion.title} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span>{suggestion.title}</span>
                  <select
                    value={votes[member]?.[suggestion.title] || 0}
                    onChange={(e) => handleRankChange(member, suggestion.title, parseInt(e.target.value))}
                    disabled={!!isAlreadyVoted}
                  >
                    <option value={0}>- Points -</option>
                    <option value={1}>3 Points (Best)</option>
                    <option value={2}>2 Points</option>
                    <option value={3}>1 Point</option>
                  </select>
                </div>
              ))}
              <button onClick={() => handleSubmitVote(member)} disabled={!!isAlreadyVoted} style={{ marginTop: '1rem' }}>
                {isAlreadyVoted ? 'Vote Submitted' : `Submit ${member}'s Vote`}
              </button>
            </div>
          );
        })}
      </div>

      <hr style={{ margin: '2rem 0' }} />

      <button onClick={handleCloseVoting} style={{ padding: '10px 20px', width: '100%', backgroundColor: '#dc3545', color: 'white', border: 'none' }}>
        Close Voting for Everyone & Pick Winner
      </button>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
}
