import { GET, POST } from '@/app/api/candidates/route';
import { NextRequest } from 'next/server';

function createPostRequest(body: object): NextRequest {
  return new NextRequest('http://localhost:3000/api/candidates', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('GET /api/candidates', () => {
  it('returns list of candidates with status 200', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(2);
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('name');
    expect(data[0]).toHaveProperty('status');
  });
});

describe('POST /api/candidates', () => {
  it('creates a candidate with status 201', async () => {
    const request = createPostRequest({ name: 'Test Candidate' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.name).toBe('Test Candidate');
    expect(data.status).toBe('NEW');
    expect(data.id).toBeDefined();
  });

  it('returns 400 for empty name', async () => {
    const request = createPostRequest({ name: '' });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe('VALIDATION_ERROR');
    expect(data.error).toBe('Candidate name is required');
  });

  it('returns 400 for missing name', async () => {
    const request = createPostRequest({});
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.code).toBe('VALIDATION_ERROR');
  });
});
