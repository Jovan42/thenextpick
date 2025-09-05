import { useState, useEffect } from 'react';
import { AppState } from '../types/state';
import { loadConfig, getSuggestionCount, getApiBaseUrl } from '../utils/config';

// Define the component's props
interface SuggestionViewProps {
  appState: AppState;
  onSuggestionsSubmitted: () => void; // A function to refresh the state
}

// Define the shape of a single suggestion
interface Suggestion {
  title: string;
  author: string;
}

export default function SuggestionView({ appState, onSuggestionsSubmitted }: SuggestionViewProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState('');
  const [suggestionCount, setSuggestionCount] = useState(3);

  useEffect(() => {
    const initializeConfig = async () => {
      await loadConfig();
      const count = getSuggestionCount();
      setSuggestionCount(count);
      // Initialize suggestions array with the configured count
      setSuggestions(Array(count).fill(null).map(() => ({ title: '', author: '' })));
    };
    initializeConfig();
  }, []);

  const pickerName = appState.members[appState.currentPickerIndex];

  // A single handler to update any field of any suggestion
  const handleSuggestionChange = (index: number, field: keyof Suggestion, value: string) => {
    const newSuggestions = [...suggestions];
    newSuggestions[index][field] = value;
    setSuggestions(newSuggestions);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    // Validate that all fields are filled
    if (suggestions.some(s => !s.title || !s.author)) {
      setError(`Please fill out both title and author for all ${suggestionCount} suggestions.`);
      return;
    }

    const payload = { suggestions }; // The state is already in the correct format

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // If successful, tell the parent component to refresh its state
      onSuggestionsSubmitted();

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', color: '#1a1a1a' }}>
          🎯 It's {pickerName}'s turn to suggest!
        </h2>
        <p style={{ margin: 0, color: '#4a4a4a' }}>
          Choose {suggestionCount} {appState.clubType.toLowerCase()} for the group to vote on
        </p>
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {suggestions.map((suggestion, index) => (
          <div 
            key={index} 
            style={{ 
              padding: '1.5rem', 
              border: '2px solid #e0e0e0', 
              borderRadius: '8px',
              backgroundColor: '#fafafa'
            }}
          >
            <h4 style={{ margin: '0 0 1rem 0', color: '#2a2a2a' }}>
              Suggestion #{index + 1}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', color: '#2a2a2a' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={suggestion.title}
                  onChange={(e) => handleSuggestionChange(index, 'title', e.target.value)}
                  placeholder="Enter the title..."
                  style={{ 
                    width: '100%',
                    padding: '0.75rem', 
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', color: '#2a2a2a' }}>
                  Author
                </label>
                <input
                  type="text"
                  value={suggestion.author}
                  onChange={(e) => handleSuggestionChange(index, 'author', e.target.value)}
                  placeholder="Enter the author..."
                  style={{ 
                    width: '100%',
                    padding: '0.75rem', 
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        
        <button 
          type="submit" 
          style={{ 
            padding: '1rem 2rem', 
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1.1rem',
            fontWeight: '500',
            cursor: 'pointer',
            marginTop: '1rem',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
        >
          Submit Suggestions
        </button>
        
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
      </form>
    </div>
  );
}
