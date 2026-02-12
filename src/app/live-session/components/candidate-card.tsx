'use client';

import { CandidateDTO, CandidateStatus } from '@/contracts/candidate';

const STATUS_COLORS: Record<CandidateStatus, { bg: string; color: string }> = {
  NEW: { bg: '#e3f2fd', color: '#1976d2' },
  SHORTLISTED: { bg: '#e8f5e9', color: '#388e3c' },
  REJECTED: { bg: '#ffebee', color: '#d32f2f' },
};

interface CandidateCardProps {
  candidate: CandidateDTO;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function CandidateCard({ candidate, isSelected, onSelect }: CandidateCardProps) {
  const colors = STATUS_COLORS[candidate.status];

  return (
    <div
      onClick={() => onSelect(candidate.id)}
      style={{
        padding: '15px',
        border: isSelected ? '2px solid #1976d2' : '1px solid #ddd',
        borderRadius: '8px',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#f5f5f5' : 'white',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{candidate.name}</div>
      <div style={{
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: colors.bg,
        color: colors.color,
        fontSize: '12px',
        textAlign: 'center',
        fontWeight: 'bold'
      }}>
        {candidate.status}
      </div>
    </div>
  );
}
