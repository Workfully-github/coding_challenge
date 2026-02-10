import { NextRequest, NextResponse } from 'next/server';
import { getAllCandidates, saveCandidate, generateNextId } from '@/data/storage';
import { Candidate } from '@/models/candidate';
import { CandidateDTO, CreateCandidateRequest, ErrorResponse } from '@/contracts/candidate';

export async function GET() {
  try {
    const candidates = getAllCandidates();
    
    const response: CandidateDTO[] = candidates.map(c => ({
      id: c.id,
      name: c.name,
      status: c.status,
    }));

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error' } as ErrorResponse,
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as any;
    const name = body.name;

    const id = generateNextId();
    const candidate = Candidate.create(id, name);
    saveCandidate(candidate);

    const response = {
      id: candidate.id,
      name: candidate.name,
      status: candidate.status,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error' } as ErrorResponse,
      { status: 500 }
    );
  }
}
