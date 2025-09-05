import { AppState } from '../types/state';

interface ReadingViewProps {
  appState: AppState;
  onUpdateState: () => void;
}

export default function ReadingView({ appState, onUpdateState }: ReadingViewProps) {
  const { winningItem, completionStatus, isDiscussed } = appState.currentRound;

  // **CHANGE 1: Check if all members have read the item.**
  const allMembersHaveRead = appState.members.every(
    member => completionStatus[member]
  );

  const handleToggleCompletion = async (memberName: string) => {
    try {
      const response = await fetch('https://thenextpick-api.onrender.com/api/completion-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member: memberName }),
      });
      if (!response.ok) throw new Error(await response.text());
      onUpdateState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsDiscussed = async () => {
    try {
      const response = await fetch('https://thenextpick-api.onrender.com/api/round/discussed', { method: 'POST' });
      if (!response.ok) throw new Error(await response.text());
      onUpdateState();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNextRound = async () => {
    try {
      const response = await fetch('https://thenextpick-api.onrender.com/api/round/next', { method: 'POST' });
      if (!response.ok) throw new Error(await response.text());
      onUpdateState();
    } catch (err) {
      console.error(err);
    }
  };

  if (!winningItem) return <div>Waiting for a winner to be selected...</div>;

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', color: '#1a1a1a' }}>
          🎉 This Round's Winner!
        </h2>
        <p style={{ margin: 0, color: '#4a4a4a' }}>
          Time to {appState.clubType.toLowerCase().includes('book') ? 'read' : 'enjoy'} together
        </p>
      </div>
      
      <div style={{ 
        margin: '2rem 0', 
        padding: '2rem', 
        backgroundColor: '#d4edda', 
        border: '2px solid #28a745',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ 
            display: 'inline-block',
            padding: '0.5rem 1rem',
            backgroundColor: '#28a745',
            color: 'white',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '500',
            marginBottom: '1rem'
          }}>
            🏆 WINNER
          </span>
        </div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#155724', fontSize: '1.5rem' }}>
          {winningItem.title}
        </h3>
        <p style={{ margin: 0, color: '#155724', fontSize: '1.1rem', fontWeight: '500' }}>
          by {winningItem.author}
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#2a2a2a' }}>📋 Completion Status</h4>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.75rem',
          padding: '1.5rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          {appState.members.map(member => {
            const isCompleted = completionStatus[member] || false;
            return (
              <div 
                key={member}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem',
                  backgroundColor: isCompleted ? '#d4edda' : 'white',
                  border: `1px solid ${isCompleted ? '#c3e6cb' : '#e9ecef'}`,
                  borderRadius: '4px',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={() => handleToggleCompletion(member)}
                  disabled={isCompleted}
                  style={{ 
                    marginRight: '12px',
                    transform: 'scale(1.2)',
                    cursor: isCompleted ? 'default' : 'pointer'
                  }}
                />
                <span style={{ 
                  fontWeight: '500',
                  color: isCompleted ? '#155724' : '#2a2a2a',
                  textDecoration: isCompleted ? 'line-through' : 'none'
                }}>
                  {isCompleted ? '✅' : '⏳'} {member}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem',
        padding: '1.5rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#2a2a2a' }}>🎯 Next Steps</h4>
          <p style={{ margin: 0, color: '#4a4a4a', fontSize: '0.9rem' }}>
            {!allMembersHaveRead 
              ? `Waiting for ${appState.members.filter(m => !completionStatus[m]).join(', ')} to complete`
              : isDiscussed 
                ? 'Round completed! Ready to start the next round.'
                : 'All members have completed. Mark as discussed to proceed.'
            }
          </p>
        </div>
        
        <button 
          onClick={handleMarkAsDiscussed} 
          disabled={isDiscussed || !allMembersHaveRead} 
          style={{ 
            padding: '1rem 2rem',
            backgroundColor: isDiscussed || !allMembersHaveRead ? '#6c757d' : '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: isDiscussed || !allMembersHaveRead ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (!isDiscussed && allMembersHaveRead) {
              e.currentTarget.style.backgroundColor = '#138496';
            }
          }}
          onMouseOut={(e) => {
            if (!isDiscussed && allMembersHaveRead) {
              e.currentTarget.style.backgroundColor = '#17a2b8';
            }
          }}
        >
          {isDiscussed ? '✅ Round Discussed!' : '💬 Mark as Discussed'}
        </button>
        
        <button 
          onClick={handleNextRound} 
          disabled={!isDiscussed} 
          style={{ 
            padding: '1rem 2rem',
            backgroundColor: !isDiscussed ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: !isDiscussed ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => {
            if (isDiscussed) {
              e.currentTarget.style.backgroundColor = '#218838';
            }
          }}
          onMouseOut={(e) => {
            if (isDiscussed) {
              e.currentTarget.style.backgroundColor = '#28a745';
            }
          }}
        >
          🚀 Start Next Round
        </button>
      </div>
    </div>
  );
}
