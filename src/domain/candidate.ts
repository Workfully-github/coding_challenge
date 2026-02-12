import { CandidateStatus, DecisionAction, CandidateDTO } from '@/contracts/candidate';
import { ValidationError, InvalidStatusTransitionError } from './errors';

const VALID_TRANSITIONS: Record<CandidateStatus, CandidateStatus[]> = {
  NEW: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: [],
  REJECTED: [],
};

const DECISION_TO_STATUS: Record<DecisionAction, CandidateStatus> = {
  SHORTLIST: 'SHORTLISTED',
  REJECT: 'REJECTED',
};

const MINIMUM_REASON_LENGTH = 10;

export class Candidate {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    private readonly _status: CandidateStatus
  ) {}

  get status(): CandidateStatus {
    return this._status;
  }

  static create(id: string, name: string): Candidate {
    const trimmedName = name?.trim();
    if (!trimmedName) {
      throw new ValidationError('Candidate name is required');
    }
    return new Candidate(id, trimmedName, 'NEW');
  }

  static reconstitute(id: string, name: string, status: CandidateStatus): Candidate {
    return new Candidate(id, name, status);
  }

  applyDecision(decision: DecisionAction, reason: string): Candidate {
    const trimmedReason = reason?.trim();
    if (!trimmedReason || trimmedReason.length < MINIMUM_REASON_LENGTH) {
      throw new ValidationError(`Reason must be at least ${MINIMUM_REASON_LENGTH} characters`);
    }

    const targetStatus = DECISION_TO_STATUS[decision];
    const allowedTransitions = VALID_TRANSITIONS[this._status];

    if (!allowedTransitions.includes(targetStatus)) {
      throw new InvalidStatusTransitionError(
        `Cannot transition from ${this._status} to ${targetStatus}`
      );
    }

    return new Candidate(this.id, this.name, targetStatus);
  }

  toDTO(): CandidateDTO {
    return {
      id: this.id,
      name: this.name,
      status: this._status,
    };
  }
}
