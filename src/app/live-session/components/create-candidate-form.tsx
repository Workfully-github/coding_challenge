'use client';

import { useState } from 'react';

interface CreateCandidateFormProps {
  onSubmit: (name: string) => Promise<void>;
  isSubmitting: boolean;
}

export function CreateCandidateForm({ onSubmit, isSubmitting }: CreateCandidateFormProps) {
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(name);
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Candidate name"
        disabled={isSubmitting}
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '16px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          marginBottom: '10px',
          boxSizing: 'border-box',
        }}
      />
      <button
        type="submit"
        disabled={isSubmitting || !name.trim()}
        style={{
          width: '100%',
          padding: '10px',
          fontSize: '16px',
          fontWeight: '500',
          backgroundColor: isSubmitting || !name.trim() ? '#90caf9' : '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isSubmitting || !name.trim() ? 'not-allowed' : 'pointer',
        }}
      >
        {isSubmitting ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
