'use client';

import { CandidateDTO } from '@/contracts/candidate';
import { CandidateCard } from './candidate-card';

interface CandidateBoardProps {
  candidates: CandidateDTO[];
  selectedId: string | null;
  onSelectCandidate: (id: string) => void;
  isLoading: boolean;
}

export function CandidateBoard({ candidates, selectedId, onSelectCandidate, isLoading }: CandidateBoardProps) {
  if (isLoading) {
    return <p>Loading candidates...</p>;
  }

  if (candidates.length === 0) {
    return <p>No candidates yet. Create one to get started.</p>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
      {candidates.map(candidate => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          isSelected={candidate.id === selectedId}
          onSelect={onSelectCandidate}
        />
      ))}
    </div>
  );
}
