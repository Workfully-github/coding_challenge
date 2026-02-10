'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CandidateDTO, CandidateStatus, DecisionAction } from '@/contracts/candidate';

function LiveSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('candidateId');

  const [candidates, setCandidates] = useState<CandidateDTO[]>([]);
  const [newName, setNewName] = useState('');
  const [decision, updateDecision] = useState<DecisionAction>('SHORTLIST');
  const [rsn, setRsn] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await fetch('/api/candidates');
      const data = await response.json();
      setCandidates(data);
    } catch (err) {
      setError('Error');
    }
  };

  const handleSelectCandidate = (id: string) => {
    router.push(`?candidateId=${id}`);
  };

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error');
        return;
      }

      setNewName('');
      fetchCandidates();
    } catch (err) {
      setError('Error');
    }
  };

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedId) return;

    try {
      const response = await fetch(`/api/candidates/${selectedId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, reason: rsn }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error');
        return;
      }

      setRsn('');
      router.push('/live-session');
      fetchCandidates();
    } catch (err) {
      setError('Error');
    }
  };

  const selectedCandidate = candidates.find(c => c.id === selectedId);

  const getStatusColor = (status: CandidateStatus) => {
    if (status === 'NEW') {
      return { bg: '#e3f2fd', color: '#1976d2' };
    }
    if (status === 'SHORTLISTED') {
      return { bg: '#e8f5e9', color: '#388e3c' };
    }
    if (status === 'REJECTED') {
      return { bg: '#ffebee', color: '#d32f2f' };
    }
    return { bg: '#e3f2fd', color: '#1976d2' };
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Candidate Management</h1>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#ffebee',
          color: '#d32f2f',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #ffcdd2'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        <div>
          <h2>Candidate Board</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
            {candidates.map(candidate => {
              const colors = getStatusColor(candidate.status);
              const isSelected = candidate.id === selectedId;
              return (
                <div
                  key={candidate.id}
                  onClick={() => handleSelectCandidate(candidate.id)}
                  style={{
                    padding: '15px',
                    border: isSelected ? '2px solid #1976d2' : '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#f5f5f5' : 'white',
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{candidate.name}</div>
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: colors.bg,
                    color: colors.color,
                    fontSize: '12px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>
                    {candidate.status}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2>Create Candidate</h2>
          <form onSubmit={handleCreateCandidate} style={{ marginBottom: '30px' }}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Candidate name"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                marginBottom: '10px'
              }}
            />
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '16px',
                fontWeight: '500',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Create
            </button>
          </form>

          {selectedCandidate && (
            <>
              <h2>Update Status</h2>
              <div style={{
                padding: '15px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                marginBottom: '15px'
              }}>
                <div><strong>Name:</strong> {selectedCandidate.name}</div>
                <div><strong>Status:</strong> {selectedCandidate.status}</div>
              </div>

              <form onSubmit={handleSubmitDecision}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Decision
                  </label>
                  <select
                    value={decision}
                    onChange={(e) => updateDecision(e.target.value as DecisionAction)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '16px',
                      borderRadius: '4px',
                      border: '1px solid #ccc'
                    }}
                  >
                    <option value="SHORTLIST">Shortlist</option>
                    <option value="REJECT">Reject</option>
                  </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Reason (min 10 characters)
                  </label>
                  <textarea
                    value={rsn}
                    onChange={(e) => setRsn(e.target.value)}
                    rows={4}
                    placeholder="Enter your reason..."
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '16px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontFamily: 'system-ui'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '16px',
                    fontWeight: '500',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Submit Decision
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: '40px', fontSize: '14px', color: '#666' }}>
        <h3>Business Rules:</h3>
        <ul>
          <li>{'NEW'} candidates can be {'SHORTLISTED'} or {'REJECTED'}</li>
          <li>{'SHORTLISTED'} candidates cannot be {'REJECTED'}</li>
          <li>{'REJECTED'} candidates cannot be {'SHORTLISTED'}</li>
          <li>Reason must be at least {'10'} characters</li>
        </ul>
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
