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
      <h2>Reading Time!</h2>
      <div style={{ margin: '1.5rem 0', padding: '1rem', backgroundColor: '#f8f9fa', borderLeft: '4px solid #17a2b8', color: 'black' }}>
        <p style={{ margin: 0 }}>This round's pick is:</p>
        <h3 style={{ margin: '0.25rem 0' }}>{winningItem.title}</h3>
        <p style={{ margin: 0, color: '#6c757d' }}>by {winningItem.author}</p>
      </div>

      <h4>Completion Status:</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {appState.members.map(member => {
          const isCompleted = completionStatus[member] || false;
          return (
            <div key={member}>
              <label style={{ cursor: isCompleted ? 'default' : 'pointer', color: isCompleted ? '#6c757d' : 'inherit' }}>
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={() => handleToggleCompletion(member)}
                  disabled={isCompleted}
                  style={{ marginRight: '8px' }}
                />
                {member}
              </label>
            </div>
          );
        })}
      </div>

      <hr style={{ margin: '2rem 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* **CHANGE 2: Update the 'disabled' condition.** */}
        <button onClick={handleMarkAsDiscussed} disabled={isDiscussed || !allMembersHaveRead} style={{ padding: '10px' }}>
          {isDiscussed ? 'Round Discussed!' : 'Mark as Discussed'}
        </button>
        <button onClick={handleNextRound} disabled={!isDiscussed} style={{ padding: '10px' }}>
          Start Next Round
        </button>
      </div>
    </div>
  );
}
