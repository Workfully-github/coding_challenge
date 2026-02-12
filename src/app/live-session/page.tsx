'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CandidateDTO, DecisionAction } from '@/contracts/candidate';
import * as candidatesApi from '@/ui/api/candidates';
import { ErrorBanner } from './components/error-banner';
import { CandidateBoard } from './components/candidate-board';
import { CreateCandidateForm } from './components/create-candidate-form';
import { DecisionForm } from './components/decision-form';

function LiveSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('candidateId');

  const [candidates, setCandidates] = useState<CandidateDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCandidates = useCallback(async () => {
    try {
      const data = await candidatesApi.getAllCandidates();
      setCandidates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const handleSelectCandidate = (id: string) => {
    router.push(`?candidateId=${id}`);
  };

  const handleCreateCandidate = async (name: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await candidatesApi.createCandidate(name);
      await loadCandidates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create candidate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDecision = async (candidateId: string, decision: DecisionAction, reason: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await candidatesApi.submitDecision(candidateId, decision, reason);
      router.push('/live-session');
      await loadCandidates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCandidate = candidates.find(c => c.id === selectedId);

  return (
    <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Candidate Management</h1>

      <ErrorBanner message={error} />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        <div>
          <h2>Candidate Board</h2>
          <CandidateBoard
            candidates={candidates}
            selectedId={selectedId}
            onSelectCandidate={handleSelectCandidate}
            isLoading={isLoading}
          />
        </div>

        <div>
          <h2>Create Candidate</h2>
          <CreateCandidateForm onSubmit={handleCreateCandidate} isSubmitting={isSubmitting} />

          {selectedCandidate && (
            <DecisionForm
              candidate={selectedCandidate}
              onSubmit={handleSubmitDecision}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function LiveSession() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LiveSessionContent />
    </Suspense>
  );
}
