import { AppState, HistoryEntry } from '../types/state';

interface HistoryPanelProps {
  appState: AppState;
}

export default function HistoryPanel({ appState }: HistoryPanelProps) {
  const { history, clubType } = appState;

  if (history.length === 0) {
    return (
      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        backgroundColor: '#f8f9fa', 
        border: '1px solid #dee2e6',
        borderRadius: '8px'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#2a2a2a' }}>📚 History</h3>
        <p style={{ margin: 0, color: '#4a4a4a', fontStyle: 'italic' }}>
          No {clubType.toLowerCase()} have been completed yet. Complete your first round to see it here!
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      marginTop: '2rem', 
      padding: '1.5rem', 
      backgroundColor: '#f8f9fa', 
      border: '1px solid #dee2e6',
      borderRadius: '8px'
    }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#2a2a2a' }}>📚 History</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {history.slice().reverse().map((entry: HistoryEntry, index: number) => (
          <div 
            key={`${entry.dateCompleted}-${entry.winningItem.title}`}
            style={{ 
              padding: '1rem', 
              backgroundColor: 'white', 
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', color: '#1a1a1a' }}>
                  {entry.winningItem.title}
                </h4>
                <p style={{ margin: '0 0 0.5rem 0', color: '#4a4a4a', fontSize: '0.9rem' }}>
                  by {entry.winningItem.author}
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#4a4a4a' }}>
                <div>Picked by <strong>{entry.picker}</strong></div>
                <div>{new Date(entry.dateCompleted).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
