import { NextResponse } from 'next/server';
import { mockSubsidiaries } from '@/lib/mock-data';
import { generateVisualEngine } from '@/lib/ai-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { brandId, brandData, prompt, enhanceWithBrandTone, aspectRatio, model, platform, feedback, apiKeys } = body;

    const brand = brandData || mockSubsidiaries.find((s) => s.id === brandId) || mockSubsidiaries[0];

    // Priority for API keys: request body -> server environment variables
    const rawKey = apiKeys?.openaiApiKey || process.env.OPENAI_API_KEY || '';
    const resolvedKeys = {
      openaiApiKey: rawKey.trim(),
      replicateApiKey: apiKeys?.replicateApiKey || process.env.REPLICATE_API_TOKEN,
    };

    console.log('[/api/generate-image] POST request received');
    console.log('[/api/generate-image] Model requested:', model || 'DALL-E-3');
    console.log('[/api/generate-image] OpenAI Key provided?', Boolean(resolvedKeys.openaiApiKey));
    if (resolvedKeys.openaiApiKey) {
      console.log('[/api/generate-image] OpenAI Key prefix:', resolvedKeys.openaiApiKey.substring(0, 15) + '... (length: ' + resolvedKeys.openaiApiKey.length + ')');
    }

    const result = await generateVisualEngine(
      {
        brandId,
        prompt,
        enhanceWithBrandTone: enhanceWithBrandTone ?? true,
        aspectRatio: aspectRatio || '1:1',
        model: model || 'DALL-E-3',
        platform: platform || 'INSTAGRAM',
        feedback,
      },
      brand,
      resolvedKeys
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[/api/generate-image] Error caught:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}
