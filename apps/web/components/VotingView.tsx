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
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [unvotedMembers, setUnvotedMembers] = useState<string[]>([]);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
  
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
        setErrorMessage(`You must assign points to all ${appState.clubType.toLowerCase()}. Each point value (3, 2, and 1) must be used exactly once.`);
        setShowErrorModal(true);
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
      // Check if all members have voted
      const allVotes = appState.currentRound.votes || {};
      const membersWhoHaventVoted = appState.members.filter(member => !allVotes[member]);
      
      if (membersWhoHaventVoted.length > 0) {
        setUnvotedMembers(membersWhoHaventVoted);
        setShowConfirmModal(true);
        return;
      }
      
      await closeVoting();
    };

    const closeVoting = async () => {
      try {
        const response = await fetch('https://thenextpick-api.onrender.com/api/round/close-voting', { method: 'POST' });
        if (!response.ok) throw new Error(await response.text());
        onUpdateState();
        setShowConfirmModal(false);
      } catch (err: any) {
        setError(err.message);
      }
    };

    const handleConfirmClose = () => {
      closeVoting();
    };

    const handleCancelClose = () => {
      setShowConfirmModal(false);
      setUnvotedMembers([]);
    };

    const handleCloseErrorModal = () => {
      setShowErrorModal(false);
      setErrorMessage('');
    };
  
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', color: '#1a1a1a' }}>
          🗳️ Voting is Active!
        </h2>
        <p style={{ margin: 0, color: '#4a4a4a' }}>
          Assign points to each {appState.clubType.toLowerCase()}. You must use each point value (3, 2, and 1) exactly once.
        </p>
      </div>
      
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1.5rem', 
        border: '2px solid #007bff', 
        backgroundColor: '#f0f8ff', 
        borderRadius: '8px'
      }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#0056b3' }}>📊 Live Scores</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {liveScores.map(([title, score], index) => (
            <div 
              key={title} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.5rem',
                backgroundColor: index === 0 ? '#e3f2fd' : 'transparent',
                borderRadius: '4px',
                border: index === 0 ? '1px solid #2196f3' : 'none'
              }}
            >
              <span style={{ fontWeight: '500', color: '#2a2a2a' }}>{title}</span>
              <span style={{ 
                fontWeight: 'bold', 
                color: index === 0 ? '#1976d2' : '#2a2a2a',
                fontSize: '1.1rem'
              }}>
                {score} points
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {appState.members.map(member => {
          const isAlreadyVoted = appState.currentRound.votes && appState.currentRound.votes[member];

          return (
            <div 
              key={member} 
              style={{ 
                border: '2px solid #e9ecef', 
                borderRadius: '8px',
                padding: '1.5rem', 
                backgroundColor: isAlreadyVoted ? '#f8f9fa' : 'white',
                opacity: isAlreadyVoted ? 0.8 : 1,
                transition: 'all 0.2s'
              }}
            >
              <h4 style={{ 
                margin: '0 0 1rem 0', 
                color: isAlreadyVoted ? '#6c757d' : '#2a2a2a',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {isAlreadyVoted ? '✅' : '👤'} {member}'s Vote
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {appState.currentRound.suggestions.map(suggestion => (
                  <div 
                    key={suggestion.title} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '0.75rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px',
                      border: '1px solid #e9ecef'
                    }}
                  >
                    <span style={{ fontWeight: '500', color: '#2a2a2a' }}>{suggestion.title}</span>
                    <select
                      value={votes[member]?.[suggestion.title] || 0}
                      onChange={(e) => handleRankChange(member, suggestion.title, parseInt(e.target.value))}
                      disabled={!!isAlreadyVoted}
                      style={{
                        padding: '0.5rem',
                        border: '1px solid #ced4da',
                        borderRadius: '4px',
                        backgroundColor: isAlreadyVoted ? '#e9ecef' : 'white',
                        cursor: isAlreadyVoted ? 'not-allowed' : 'pointer',
                        color: '#2a2a2a',
                        fontSize: '0.9rem'
                      }}
                    >
                      <option value={0} style={{ color: '#2a2a2a' }}>- Points -</option>
                      <option value={1} style={{ color: '#2a2a2a' }}>3 Points (Best)</option>
                      <option value={2} style={{ color: '#2a2a2a' }}>2 Points</option>
                      <option value={3} style={{ color: '#2a2a2a' }}>1 Point</option>
                    </select>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => handleSubmitVote(member)} 
                disabled={!!isAlreadyVoted} 
                style={{ 
                  marginTop: '1rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: isAlreadyVoted ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isAlreadyVoted ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => {
                  if (!isAlreadyVoted) {
                    e.currentTarget.style.backgroundColor = '#218838';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isAlreadyVoted) {
                    e.currentTarget.style.backgroundColor = '#28a745';
                  }
                }}
              >
                {isAlreadyVoted ? 'Vote Submitted' : `Submit ${member}'s Vote`}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        border: '2px solid #dc3545', 
        borderRadius: '8px',
        backgroundColor: '#fff5f5'
      }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#dc3545' }}>⚠️ Admin Action</h4>
        {(() => {
          const allVotes = appState.currentRound.votes || {};
          const membersWhoHaventVoted = appState.members.filter(member => !allVotes[member]);
          const hasUnvotedMembers = membersWhoHaventVoted.length > 0;
          
          return (
            <div>
              <p style={{ margin: '0 0 1rem 0', color: '#721c24', fontSize: '0.9rem' }}>
                Once you close voting, no more votes can be submitted and the winner will be calculated automatically.
              </p>
              {hasUnvotedMembers && (
                <div style={{ 
                  padding: '0.75rem', 
                  backgroundColor: '#f8d7da', 
                  border: '1px solid #f5c6cb',
                  borderRadius: '4px',
                  marginBottom: '1rem'
                }}>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#721c24', fontSize: '0.9rem', fontWeight: '500' }}>
                    ⚠️ Members who haven't voted yet:
                  </p>
                  <p style={{ margin: 0, color: '#721c24', fontSize: '0.9rem' }}>
                    {membersWhoHaventVoted.join(', ')}
                  </p>
                </div>
              )}
            </div>
          );
        })()}
        <button 
          onClick={handleCloseVoting} 
          style={{ 
            padding: '1rem 2rem', 
            width: '100%', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none',
            borderRadius: '6px',
            fontSize: '1.1rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
        >
          🔒 Close Voting & Pick Winner
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginTop: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>⚠️</div>
              <h3 style={{
                margin: '0 0 0.5rem 0',
                color: '#dc3545',
                fontSize: '1.5rem',
                fontWeight: '600'
              }}>
                Confirm Close Voting
              </h3>
              <p style={{
                margin: 0,
                color: '#4a4a4a',
                fontSize: '1rem',
                lineHeight: '1.5'
              }}>
                Some members haven't voted yet. Are you sure you want to close voting?
              </p>
            </div>

            <div style={{
              backgroundColor: '#fff5f5',
              border: '1px solid #f5c6cb',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{
                margin: '0 0 0.5rem 0',
                color: '#dc3545',
                fontSize: '1rem',
                fontWeight: '500'
              }}>
                Members who haven't voted:
              </h4>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                {unvotedMembers.map(member => (
                  <span key={member} style={{
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    {member}
                  </span>
                ))}
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleCancelClose}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClose}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
              >
                Close Voting Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Error Modal */}
      {showErrorModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>❌</div>
              <h3 style={{
                margin: '0 0 0.5rem 0',
                color: '#dc3545',
                fontSize: '1.5rem',
                fontWeight: '600'
              }}>
                Incomplete Vote
              </h3>
              <p style={{
                margin: 0,
                color: '#4a4a4a',
                fontSize: '1rem',
                lineHeight: '1.5'
              }}>
                {errorMessage}
              </p>
            </div>

            <div style={{
              backgroundColor: '#fff5f5',
              border: '1px solid #f5c6cb',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <h4 style={{
                margin: '0 0 0.5rem 0',
                color: '#dc3545',
                fontSize: '1rem',
                fontWeight: '500'
              }}>
                Voting Rules:
              </h4>
              <ul style={{
                margin: 0,
                paddingLeft: '1.5rem',
                color: '#721c24',
                fontSize: '0.9rem',
                lineHeight: '1.6'
              }}>
                <li>You must assign points to all {appState.clubType.toLowerCase()}</li>
                <li>Use each point value (3, 2, 1) exactly once</li>
                <li>3 points = your top choice</li>
                <li>2 points = your second choice</li>
                <li>1 point = your third choice</li>
              </ul>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleCloseErrorModal}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
