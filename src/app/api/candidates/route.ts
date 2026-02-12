import { NextRequest, NextResponse } from 'next/server';
import { CandidateService } from '@/application/candidate-service';
import { candidateRepository } from '@/infrastructure/candidate-repository';
import { ValidationError, INTERNAL_SERVER_ERROR_MESSAGE } from '@/domain/errors';
import { ErrorResponse } from '@/contracts/candidate';

const service = new CandidateService(candidateRepository);

export async function GET() {
  try {
    const candidates = service.listCandidates();
    return NextResponse.json(candidates);
  } catch {
    return NextResponse.json(
      { error: INTERNAL_SERVER_ERROR_MESSAGE, code: 'INTERNAL_ERROR' } satisfies ErrorResponse,
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: { name?: string } = await request.json();
    const candidate = service.createCandidate(body.name ?? '');
    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, code: 'VALIDATION_ERROR' } satisfies ErrorResponse,
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: INTERNAL_SERVER_ERROR_MESSAGE, code: 'INTERNAL_ERROR' } satisfies ErrorResponse,
      { status: 500 }
    );
  }
}
