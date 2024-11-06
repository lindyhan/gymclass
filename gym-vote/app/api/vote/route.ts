// gym-vote/app/api/castVote/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { castVote } from '../../../../scripts/castVote'; // Import your castVote script

export async function POST(req: NextRequest) {
  try {
    const { proposalId, userAddress, userSigner } = await req.json();

    // Validate the inputs
    if (!proposalId || !userAddress || !userSigner) {
      return NextResponse.json({ message: "Missing parameters" }, { status: 400 });
    }

    // Call the castVote function from your castVote.ts script
    const result = await castVote(proposalId, userAddress, userSigner);

    // Return the result to the client
    return NextResponse.json({
      transactionHash: result.transactionHash,
      receipt: result.receipt,
    });
  } catch (error) {
    console.error('Error in casting vote:', error);
    return NextResponse.json(
      { message: "Failed to cast vote", error: error.message },
      { status: 500 }
    );
  }
}