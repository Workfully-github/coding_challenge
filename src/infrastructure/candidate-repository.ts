import { Candidate } from '@/domain/candidate';
import { CandidateStatus } from '@/contracts/candidate';

interface CandidateRecord {
  id: string;
  name: string;
  status: CandidateStatus;
}

const store = new Map<string, CandidateRecord>();

store.set('c_1', { id: 'c_1', name: 'Alice Johnson', status: 'NEW' });
store.set('c_2', { id: 'c_2', name: 'Bob Williams', status: 'NEW' });

export class CandidateRepository {
  findAll(): Candidate[] {
    return Array.from(store.values()).map(record =>
      Candidate.reconstitute(record.id, record.name, record.status)
    );
  }

  findById(id: string): Candidate | null {
    const record = store.get(id);
    if (!record) return null;
    return Candidate.reconstitute(record.id, record.name, record.status);
  }

  save(candidate: Candidate): void {
    store.set(candidate.id, {
      id: candidate.id,
      name: candidate.name,
      status: candidate.status,
    });
  }

  nextId(): string {
    const ids = Array.from(store.keys());
    const numbers = ids
      .map(id => parseInt(id.split('_')[1]))
      .filter(n => !isNaN(n));
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `c_${maxNumber + 1}`;
  }
}

export const candidateRepository = new CandidateRepository();
