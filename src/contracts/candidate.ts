export type CandidateStatus = 'NEW' | 'SHORTLISTED' | 'REJECTED';

export type DecisionAction = 'SHORTLIST' | 'REJECT';

export interface CandidateDTO {
  id: string;
  name: string;
  status: CandidateStatus;
}

export interface CreateCandidateRequest {
  name: string;
}

export interface DecisionRequest {
  decision: DecisionAction;
  reason: string;
}

export interface ErrorResponse {
  error: string;
}
