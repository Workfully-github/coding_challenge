'use client';

import { useState } from 'react';
import { CandidateDTO, CandidateStatus, DecisionAction } from '@/contracts/candidate';

const AVAILABLE_DECISIONS: Record<CandidateStatus, DecisionAction[]> = {
  NEW: ['SHORTLIST', 'REJECT'],
  SHORTLISTED: [],
  REJECTED: [],
};

const DECISION_LABELS: Record<DecisionAction, string> = {
  SHORTLIST: 'Shortlist',
  REJECT: 'Reject',
};

const MINIMUM_REASON_LENGTH = 10;

interface DecisionFormProps {
  candidate: CandidateDTO;
  onSubmit: (candidateId: string, decision: DecisionAction, reason: string) => Promise<void>;
  isSubmitting: boolean;
}

export function DecisionForm({ candidate, onSubmit, isSubmitting }: DecisionFormProps) {
  const availableDecisions = AVAILABLE_DECISIONS[candidate.status];
  const [decision, setDecision] = useState<DecisionAction>(availableDecisions[0] ?? 'SHORTLIST');
  const [reason, setReason] = useState('');

  const isReasonValid = reason.trim().length >= MINIMUM_REASON_LENGTH;
  const hasAvailableDecisions = availableDecisions.length > 0;
  const canSubmit = hasAvailableDecisions && isReasonValid && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(candidate.id, decision, reason);
    setReason('');
  };

  return (
    <div>
      <h2>Update Status</h2>
      <div style={{
        padding: '15px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '15px'
      }}>
        <div><strong>Name:</strong> {candidate.name}</div>
        <div><strong>Status:</strong> {candidate.status}</div>
      </div>

      {!hasAvailableDecisions ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>
          No further transitions available for {candidate.status} candidates.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Decision
            </label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value as DecisionAction)}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                boxSizing: 'border-box',
              }}
            >
              {availableDecisions.map(d => (
                <option key={d} value={d}>
                  {DECISION_LABELS[d]}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Reason (min {MINIMUM_REASON_LENGTH} characters)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Enter your reason..."
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '4px',
                border: `1px solid ${reason.length > 0 && !isReasonValid ? '#d32f2f' : '#ccc'}`,
                fontFamily: 'system-ui',
                boxSizing: 'border-box',
              }}
            />
            {reason.length > 0 && !isReasonValid && (
              <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>
                {MINIMUM_REASON_LENGTH - reason.trim().length} more characters required
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              fontWeight: '500',
              backgroundColor: canSubmit ? '#1976d2' : '#90caf9',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Decision'}
          </button>
        </form>
      )}
    </div>
  );
}
