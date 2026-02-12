import { NextRequest, NextResponse } from 'next/server';
import { CandidateService } from '@/application/candidate-service';
import { candidateRepository } from '@/infrastructure/candidate-repository';
import { ValidationError, InvalidStatusTransitionError, CandidateNotFoundError, INTERNAL_SERVER_ERROR_MESSAGE } from '@/domain/errors';
import { DecisionAction, ErrorResponse } from '@/contracts/candidate';

const service = new CandidateService(candidateRepository);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: candidateId } = await params;
    const body: { decision?: DecisionAction; reason?: string } = await request.json();

    const updated = service.applyDecision(
      candidateId,
      body.decision ?? ('' as DecisionAction),
      body.reason ?? ''
    );

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    if (error instanceof CandidateNotFoundError) {
      return NextResponse.json(
        { error: error.message, code: 'NOT_FOUND' } satisfies ErrorResponse,
        { status: 404 }
      );
    }
    if (error instanceof InvalidStatusTransitionError) {
      return NextResponse.json(
        { error: error.message, code: 'INVALID_TRANSITION' } satisfies ErrorResponse,
        { status: 409 }
      );
    }
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
