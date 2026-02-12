import { POST } from '@/app/api/candidates/[id]/decision/route';
import { NextRequest } from 'next/server';

function createDecisionRequest(candidateId: string, body: object): { request: NextRequest; context: { params: { id: string } } } {
  return {
    request: new NextRequest(`http://localhost:3000/api/candidates/${candidateId}/decision`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }),
    context: { params: { id: candidateId } },
  };
}

describe('POST /api/candidates/[id]/decision', () => {
  it('shortlists a NEW candidate with valid reason', async () => {
    const { request, context } = createDecisionRequest('c_1', {
      decision: 'SHORTLIST',
      reason: 'Strong technical background and experience',
    });

    const response = await POST(request, context as never);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('SHORTLISTED');
  });

  it('returns 404 for non-existent candidate', async () => {
    const { request, context } = createDecisionRequest('c_999', {
      decision: 'SHORTLIST',
      reason: 'Strong technical background and experience',
    });

    const response = await POST(request, context as never);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.code).toBe('NOT_FOUND');
  });

  it('returns 400 for reason shorter than 10 characters', async () => {
    const { request, context } = createDecisionRequest('c_2', {
      decision: 'SHORTLIST',
      reason: 'Short',
    });

    const response = await POST(request, context as never);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe('VALIDATION_ERROR');
  });

  it('returns 409 for invalid status transition', async () => {
    const { request: shortlistRequest, context: shortlistContext } = createDecisionRequest('c_2', {
      decision: 'REJECT',
      reason: 'Does not meet the minimum requirements',
    });
    await POST(shortlistRequest, shortlistContext as never);

    const { request: rejectRequest, context: rejectContext } = createDecisionRequest('c_2', {
      decision: 'SHORTLIST',
      reason: 'Actually reconsidering this candidate',
    });

    const response = await POST(rejectRequest, rejectContext as never);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.code).toBe('INVALID_TRANSITION');
  });
});
