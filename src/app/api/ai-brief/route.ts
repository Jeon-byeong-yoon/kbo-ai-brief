import { NextRequest, NextResponse } from 'next/server';
import { generateAIBriefing } from '@/lib/openai';
import { KBOGame } from '@/types/kbo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { game, type } = body as { game: KBOGame; type: 'PREVIEW' | 'REVIEW' };

    if (!game || !type) {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
    }

    // Call OpenAI GPT-4o generator
    const briefing = await generateAIBriefing(game, type);

    return NextResponse.json({
      success: true,
      data: briefing,
    });
  } catch (error) {
    console.error('Error in /api/ai-brief route:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
