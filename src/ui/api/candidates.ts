import { CandidateDTO, DecisionAction, ErrorResponse, CreateCandidateRequest } from '@/contracts/candidate';

export async function getAllCandidates(): Promise<CandidateDTO[]> {
  const response = await fetch('/api/candidates');
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch candidates');
  }
  
  return data;
}

export async function createCandidate(name: string): Promise<CandidateDTO> {
  const response = await fetch('/api/candidates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name } as CreateCandidateRequest),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create candidate');
  }

  return data;
}

export async function submitDecision(
  candidateId: string,
  decision: DecisionAction,
  reason: string
): Promise<CandidateDTO> {
  const response = await fetch(`/api/candidates/${candidateId}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision, reason }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to submit decision');
  }

  return data;
}
