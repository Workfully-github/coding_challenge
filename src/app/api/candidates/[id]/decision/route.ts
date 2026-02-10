import { NextRequest, NextResponse } from 'next/server';
import { getCandidateById, saveCandidate } from '@/data/storage';
import { CandidateDTO, ErrorResponse, DecisionRequest, DecisionAction } from '@/contracts/candidate';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const candidateId = params.id;

  try {
    const body = await request.json() as any;
    const decision = body.decision;
    const reason = body.reason;
    
    const candidate = getCandidateById(candidateId);
    
    let newStatus;
    if (decision === 'SHORTLIST') {
      newStatus = 'SHORTLISTED';
    } else if (decision === 'REJECT') {
      newStatus = 'REJECTED';
    }
    candidate!.status = newStatus;
    
    saveCandidate(candidate!);

    const response = {
      id: candidate!.id,
      name: candidate!.name,
      status: candidate!.status,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error' } as ErrorResponse,
      { status: 500 }
    );
  }
}
