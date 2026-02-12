import { CandidateDTO, DecisionAction, CreateCandidateRequest, ErrorResponse } from '@/contracts/candidate';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorResponse['code'],
    public readonly status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    const errorData = data as ErrorResponse;
    throw new ApiError(
      errorData.error || 'Unexpected error',
      errorData.code || 'INTERNAL_ERROR',
      response.status
    );
  }
  return data as T;
}

export async function getAllCandidates(): Promise<CandidateDTO[]> {
  const response = await fetch('/api/candidates');
  return handleResponse<CandidateDTO[]>(response);
}

export async function createCandidate(name: string): Promise<CandidateDTO> {
  const response = await fetch('/api/candidates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name } satisfies CreateCandidateRequest),
  });
  return handleResponse<CandidateDTO>(response);
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
  return handleResponse<CandidateDTO>(response);
}
