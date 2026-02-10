import { CandidateStatus, DecisionAction } from '@/contracts/candidate';

export class Candidate {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public status: CandidateStatus
  ) {}

  static create(id: string, name: string, status: CandidateStatus = 'NEW'): Candidate {
    return new Candidate(id, name, status);
  }
}
