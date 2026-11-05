import { NextResponse } from 'next/server';
import { mockSubsidiaries } from '@/lib/mock-data';
import { generateBrandCaption } from '@/lib/ai-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { brandId, prompt, platform, tonePreference } = body;

    const brand = mockSubsidiaries.find((s) => s.id === brandId) || mockSubsidiaries[0];

    const result = generateBrandCaption(prompt || '', brand, platform || 'INSTAGRAM', tonePreference);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Caption generation failed' },
      { status: 500 }
    );
  }
}

