import { useState } from 'react';
import { AppState } from '../types/state';

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
  // Use a single state variable to hold all three suggestions
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    { title: '', author: '' },
    { title: '', author: '' },
    { title: '', author: '' },
  ]);
  const [error, setError] = useState('');

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
      setError('Please fill out both title and author for all three suggestions.');
      return;
    }

    const payload = { suggestions }; // The state is already in the correct format

    try {
      const response = await fetch('https://thenextpick-api.onrender.com/api/suggest', {
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
      <h2>It's {pickerName}'s turn to suggest items!</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '1rem' }}>
        {suggestions.map((suggestion, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label>Suggestion #{index + 1}</label>
            <input
              type="text"
              value={suggestion.title}
              onChange={(e) => handleSuggestionChange(index, 'title', e.target.value)}
              placeholder="Book Title"
              style={{ padding: '8px' }}
            />
            <input
              type="text"
              value={suggestion.author}
              onChange={(e) => handleSuggestionChange(index, 'author', e.target.value)}
              placeholder="Author"
              style={{ padding: '8px' }}
            />
          </div>
        ))}
        <button type="submit" style={{ padding: '10px', cursor: 'pointer', marginTop: '10px' }}>
          Submit Suggestions
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}
