import { Candidate } from '@/domain/candidate';
import { ValidationError, InvalidStatusTransitionError } from '@/domain/errors';

describe('Candidate.create', () => {
  it('creates a NEW candidate with valid name', () => {
    const candidate = Candidate.create('c_1', 'Alice Johnson');

    expect(candidate.id).toBe('c_1');
    expect(candidate.name).toBe('Alice Johnson');
    expect(candidate.status).toBe('NEW');
  });

  it('trims whitespace from name', () => {
    const candidate = Candidate.create('c_1', '  Alice Johnson  ');

    expect(candidate.name).toBe('Alice Johnson');
  });

  it('rejects empty name', () => {
    expect(() => Candidate.create('c_1', '')).toThrow(ValidationError);
    expect(() => Candidate.create('c_1', '')).toThrow('Candidate name is required');
  });

  it('rejects whitespace-only name', () => {
    expect(() => Candidate.create('c_1', '   ')).toThrow(ValidationError);
  });
});

describe('Candidate.applyDecision', () => {
  it('transitions NEW to SHORTLISTED', () => {
    const candidate = Candidate.create('c_1', 'Alice Johnson');
    const updated = candidate.applyDecision('SHORTLIST', 'Strong technical background');

    expect(updated.status).toBe('SHORTLISTED');
    expect(updated.id).toBe('c_1');
    expect(updated.name).toBe('Alice Johnson');
  });

  it('transitions NEW to REJECTED', () => {
    const candidate = Candidate.create('c_1', 'Alice Johnson');
    const updated = candidate.applyDecision('REJECT', 'Does not meet requirements');

    expect(updated.status).toBe('REJECTED');
  });

  it('preserves immutability of original candidate', () => {
    const original = Candidate.create('c_1', 'Alice Johnson');
    original.applyDecision('SHORTLIST', 'Strong technical background');

    expect(original.status).toBe('NEW');
  });

  it('rejects SHORTLISTED to REJECTED transition', () => {
    const candidate = Candidate.reconstitute('c_1', 'Alice Johnson', 'SHORTLISTED');

    expect(() => candidate.applyDecision('REJECT', 'Changed my mind about this'))
      .toThrow(InvalidStatusTransitionError);
    expect(() => candidate.applyDecision('REJECT', 'Changed my mind about this'))
      .toThrow('Cannot transition from SHORTLISTED to REJECTED');
  });

  it('rejects REJECTED to SHORTLISTED transition', () => {
    const candidate = Candidate.reconstitute('c_1', 'Alice Johnson', 'REJECTED');

    expect(() => candidate.applyDecision('SHORTLIST', 'Reconsidering this candidate'))
      .toThrow(InvalidStatusTransitionError);
    expect(() => candidate.applyDecision('SHORTLIST', 'Reconsidering this candidate'))
      .toThrow('Cannot transition from REJECTED to SHORTLISTED');
  });

  it('rejects reason shorter than 10 characters', () => {
    const candidate = Candidate.create('c_1', 'Alice Johnson');

    expect(() => candidate.applyDecision('SHORTLIST', 'Too short'))
      .toThrow(ValidationError);
    expect(() => candidate.applyDecision('SHORTLIST', 'Too short'))
      .toThrow('Reason must be at least 10 characters');
  });

  it('rejects empty reason', () => {
    const candidate = Candidate.create('c_1', 'Alice Johnson');

    expect(() => candidate.applyDecision('SHORTLIST', '')).toThrow(ValidationError);
  });

  it('rejects whitespace-only reason', () => {
    const candidate = Candidate.create('c_1', 'Alice Johnson');

    expect(() => candidate.applyDecision('SHORTLIST', '          ')).toThrow(ValidationError);
  });

  it('accepts reason with exactly 10 characters', () => {
    const candidate = Candidate.create('c_1', 'Alice Johnson');
    const updated = candidate.applyDecision('SHORTLIST', '1234567890');

    expect(updated.status).toBe('SHORTLISTED');
  });
});

describe('Candidate.toDTO', () => {
  it('serializes candidate to DTO', () => {
    const candidate = Candidate.create('c_1', 'Alice Johnson');
    const dto = candidate.toDTO();

    expect(dto).toEqual({
      id: 'c_1',
      name: 'Alice Johnson',
      status: 'NEW',
    });
  });
});
