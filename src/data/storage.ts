import { Candidate } from '@/models/candidate';

const store = new Map<string, Candidate>();

store.set('c_1', Candidate.create('c_1', 'Alice Johnson', 'NEW'));
store.set('c_2', Candidate.create('c_2', 'Bob Williams', 'NEW'));

export function getAllCandidates(): Candidate[] {
  return Array.from(store.values());
}

export function getCandidateById(id: string): Candidate | null {
  return store.get(id) || null;
}

export function saveCandidate(candidate: any): void {
  store.set(candidate.id, candidate);
}

export function generateNextId(): string {
  const ids = Array.from(store.keys());
  const nums = ids.map(id => parseInt(id.split('_')[1])).filter(n => !isNaN(n));
  const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
  return `c_${maxNum + 1}`;
}
