import { Candidate } from '@/domain/candidate';
import { CandidateNotFoundError } from '@/domain/errors';
import { CandidateDTO, DecisionAction } from '@/contracts/candidate';
import { CandidateRepository } from '@/infrastructure/candidate-repository';

export class CandidateService {
  constructor(private readonly repository: CandidateRepository) {}

  listCandidates(): CandidateDTO[] {
    return this.repository.findAll().map(c => c.toDTO());
  }

  createCandidate(name: string): CandidateDTO {
    const id = this.repository.nextId();
    const candidate = Candidate.create(id, name);
    this.repository.save(candidate);
    return candidate.toDTO();
  }

  applyDecision(candidateId: string, decision: DecisionAction, reason: string): CandidateDTO {
    const candidate = this.repository.findById(candidateId);
    if (!candidate) {
      throw new CandidateNotFoundError(candidateId);
    }

    const updatedCandidate = candidate.applyDecision(decision, reason);
    this.repository.save(updatedCandidate);
    return updatedCandidate.toDTO();
  }
}
