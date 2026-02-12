import { CandidateService } from '@/application/candidate-service';
import { CandidateRepository } from '@/infrastructure/candidate-repository';
import { Candidate } from '@/domain/candidate';
import { CandidateNotFoundError, ValidationError, InvalidStatusTransitionError } from '@/domain/errors';

function createMockRepository(): jest.Mocked<CandidateRepository> {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    nextId: jest.fn(),
  } as unknown as jest.Mocked<CandidateRepository>;
}

describe('CandidateService.listCandidates', () => {
  it('returns all candidates as DTOs', () => {
    const repository = createMockRepository();
    const service = new CandidateService(repository);
    repository.findAll.mockReturnValue([
      Candidate.reconstitute('c_1', 'Alice', 'NEW'),
      Candidate.reconstitute('c_2', 'Bob', 'SHORTLISTED'),
    ]);

    const result = service.listCandidates();

    expect(result).toEqual([
      { id: 'c_1', name: 'Alice', status: 'NEW' },
      { id: 'c_2', name: 'Bob', status: 'SHORTLISTED' },
    ]);
  });
});

describe('CandidateService.createCandidate', () => {
  it('creates and persists a new candidate', () => {
    const repository = createMockRepository();
    const service = new CandidateService(repository);
    repository.nextId.mockReturnValue('c_3');

    const result = service.createCandidate('Charlie');

    expect(result).toEqual({ id: 'c_3', name: 'Charlie', status: 'NEW' });
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('propagates validation error for empty name', () => {
    const repository = createMockRepository();
    const service = new CandidateService(repository);
    repository.nextId.mockReturnValue('c_3');

    expect(() => service.createCandidate('')).toThrow(ValidationError);
    expect(repository.save).not.toHaveBeenCalled();
  });
});

describe('CandidateService.applyDecision', () => {
  it('applies decision and persists updated candidate', () => {
    const repository = createMockRepository();
    const service = new CandidateService(repository);
    repository.findById.mockReturnValue(Candidate.reconstitute('c_1', 'Alice', 'NEW'));

    const result = service.applyDecision('c_1', 'SHORTLIST', 'Strong technical background');

    expect(result).toEqual({ id: 'c_1', name: 'Alice', status: 'SHORTLISTED' });
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it('throws CandidateNotFoundError for unknown id', () => {
    const repository = createMockRepository();
    const service = new CandidateService(repository);
    repository.findById.mockReturnValue(null);

    expect(() => service.applyDecision('c_99', 'SHORTLIST', 'Strong technical background'))
      .toThrow(CandidateNotFoundError);
  });

  it('propagates InvalidStatusTransitionError', () => {
    const repository = createMockRepository();
    const service = new CandidateService(repository);
    repository.findById.mockReturnValue(Candidate.reconstitute('c_1', 'Alice', 'REJECTED'));

    expect(() => service.applyDecision('c_1', 'SHORTLIST', 'Reconsidering this candidate'))
      .toThrow(InvalidStatusTransitionError);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('propagates ValidationError for short reason', () => {
    const repository = createMockRepository();
    const service = new CandidateService(repository);
    repository.findById.mockReturnValue(Candidate.reconstitute('c_1', 'Alice', 'NEW'));

    expect(() => service.applyDecision('c_1', 'SHORTLIST', 'Short'))
      .toThrow(ValidationError);
    expect(repository.save).not.toHaveBeenCalled();
  });
});
