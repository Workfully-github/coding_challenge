export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends DomainError {}

export class InvalidStatusTransitionError extends DomainError {}

export class CandidateNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Candidate with id '${id}' not found`);
  }
}

export const INTERNAL_SERVER_ERROR_MESSAGE = 'Internal server error';
