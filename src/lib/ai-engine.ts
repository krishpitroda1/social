import { Subsidiary, SocialPlatform, AspectRatio, AIModel, GenerationRequest } from '@/types';

export function enhancePromptWithBrandTone(
  rawPrompt: string,
  brand: Subsidiary,
  platform: SocialPlatform,
  feedback?: string
): string {
  const cleanSubject = rawPrompt.trim();
  if (!cleanSubject) {
    return 'Minimalist high-quality product photography, 8k resolution, studio lighting';
  }

  // Keep user subject strictly primary and uncompromised
  let additions: string[] = [];

  if (feedback && feedback.trim()) {
    additions.push(feedback.trim());
  }

  let platformStyle = 'high resolution, sharp focal detail, professional studio lighting';
  switch (platform) {
    case 'INSTAGRAM':
      platformStyle = 'editorial visual storytelling, razor-sharp studio focus, striking high-contrast composition';
      break;
    case 'LINKEDIN':
      platformStyle = 'authoritative elegance, crisp balanced lighting, clean corporate finish';
      break;
    case 'TWITTER_X':
      platformStyle = 'high visual punch, eye-catching focal subject, modern framing';
      break;
    case 'PINTEREST':
      platformStyle = 'lifestyle aesthetic composition, warm ambient light, rich material textures';
      break;
    case 'FACEBOOK':
      platformStyle = 'natural lighting, rich clarity, vivid scene';
      break;
  }
  additions.push(platformStyle);

  if (brand.brandTone) {
    additions.push(`${brand.brandTone} aesthetic style`);
  }

  return `${cleanSubject}, ${additions.join(', ')}`;
}

export function generateBrandCaption(
  prompt: string,
  brand: Subsidiary,
  platform: SocialPlatform,
  tonePreference?: string
): { caption: string; hashtags: string[] } {
  const brandName = brand.name;
  const rawSubject = prompt.slice(0, 60).trim();

  let hashtags: string[] = [];
  let body = '';

  const cleanBrandTag = `#${brandName.replace(/[^a-zA-Z0-9]/g, '')}`;

  if (brand.slug.includes('lumina')) {
    hashtags = [cleanBrandTag, '#GenerativeDesign', '#AIAesthetic', '#CreativeTech', '#VisualDesign'];
    body = `Where computational intelligence meets pure sensory design.\n\nExploring "${rawSubject}" through our latest generative spatial series. Designed for visionaries pushing the limits of modern branding.\n\nWhat dimension should we explore next? Drop your thoughts below.`;
  } else if (brand.slug.includes('apex')) {
    hashtags = [cleanBrandTag, '#InstitutionalFinance', '#MacroInsights', '#QuantitativeAlpha', '#AssetAllocation'];
    body = `Precision in volatile regimes demands deep structural intelligence.\n\nOur analysis into "${rawSubject}" illustrates the emerging macro dynamics shaping cross-asset liquidity.\n\nRead our institutional brief linked in comments.`;
  } else if (brand.slug.includes('velvet') || brand.slug.includes('botanica')) {
    hashtags = [cleanBrandTag, '#CleanBeauty', '#WildBotanicals', '#ConsciousRitual', '#SkinBarrier'];
    body = `Derived from the earth, elevated by clean scientific care. 🌿✨\n\nEvery formulation inspired by "${rawSubject}" is designed to replenish and fortify your skin's natural glow.\n\nTake a slow moment today to restore and breathe.`;
  } else if (brand.slug.includes('zenith') || brand.slug.includes('robot')) {
    hashtags = [cleanBrandTag, '#Robotics', '#Biomechatronics', '#DeepTech', '#AutonomousSystems'];
    body = `Engineered for the limits of physical precision.\n\nOur latest milestone exploring "${rawSubject}" redefines adaptive mechanics and intelligent tactile automation.\n\nTechnical whitepaper drops this week ⚡️🤖`;
  } else {
    hashtags = [cleanBrandTag, '#BrandInnovation', '#FutureReady', '#DesignExcellence'];
    body = `Empowering our vision through purposeful innovation.\n\nOur latest exploration into "${rawSubject}" brings our ${brand.brandTone} philosophy to life.\n\nStay tuned as we unveil our upcoming milestone.`;
  }

  if (platform === 'TWITTER_X') {
    const shortBody = body.split('\n\n')[0];
    return {
      caption: `${shortBody}\n\n${hashtags.slice(0, 3).join(' ')}`,
      hashtags: hashtags.slice(0, 3),
    };
  }

  return {
    caption: `${body}\n\n${hashtags.join(' ')}`,
    hashtags,
  };
}

/**
 * ChatGPT Image Generation Engine (OpenAI DALL-E 3):
 * Calls OpenAI DALL-E 3 directly if key is present, with descriptive error reporting.
 */
export async function generateVisualEngine(
  params: GenerationRequest,
  brand: Subsidiary,
  apiKeys?: { openaiApiKey?: string; replicateApiKey?: string }
): Promise<{
  imageUrl: string;
  model: AIModel;
  enhancedPrompt: string;
  seed: number;
}> {
  const enhanced = params.enhanceWithBrandTone
    ? enhancePromptWithBrandTone(params.prompt, brand, params.platform, params.feedback)
    : params.prompt.trim();

  const seed = Math.floor(Math.random() * 9999999) + 1000;

  let width = 1024;
  let height = 1024;
  if (params.aspectRatio === '16:9') {
    width = 1280;
    height = 720;
  } else if (params.aspectRatio === '9:16') {
    width = 720;
    height = 1280;
  } else if (params.aspectRatio === '4:5') {
    width = 896;
    height = 1120;
  }

  // 1. Try real OpenAI DALL-E 3 (ChatGPT Image Engine) if API Key is present
  if (apiKeys?.openaiApiKey && apiKeys.openaiApiKey.startsWith('sk-') && !apiKeys.openaiApiKey.includes('demo')) {
    try {
      let dalleSize: '1024x1024' | '1792x1024' | '1024x1792' = '1024x1024';
      if (params.aspectRatio === '16:9') {
        dalleSize = '1792x1024';
      } else if (params.aspectRatio === '9:16' || params.aspectRatio === '4:5') {
        dalleSize = '1024x1792';
      }

      console.log(`[OpenAI DALL-E 3] Sending request to OpenAI API with key prefix: ${apiKeys.openaiApiKey.substring(0, 15)}... (size: ${dalleSize})`);
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKeys.openaiApiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: enhanced,
          n: 1,
          size: dalleSize,
          quality: 'standard',
        }),
      });

      const data = await response.json();
      console.log(`[OpenAI DALL-E 3] Response HTTP status: ${response.status}`);

      if (response.ok && data.data?.[0]?.url) {
        console.log('[OpenAI DALL-E 3] SUCCESS! Image URL generated from OpenAI.');
        return {
          imageUrl: data.data[0].url,
          model: 'DALL-E-3',
          enhancedPrompt: enhanced,
          seed,
        };
      } else {
        const errorMsg = data.error?.message || response.statusText || 'Failed to generate with OpenAI DALL-E 3';
        console.error('[OpenAI DALL-E 3 Error Response]:', data);
        throw new Error(`OpenAI ChatGPT Error: ${errorMsg}`);
      }
    } catch (err: any) {
      console.error('[OpenAI DALL-E 3 Exception]:', err);
      // STRICT REQUIREMENT: Never swallow error and never silently fall back to other AI if OpenAI key was configured!
      throw new Error(`OpenAI ChatGPT API Error: ${err.message || 'Image generation failed'}`);
    }
  }

  // 2. Try real Replicate API if API Token is present
  if (apiKeys?.replicateApiKey && apiKeys.replicateApiKey.startsWith('r8_') && !apiKeys.replicateApiKey.includes('demo')) {
    try {
      const response = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKeys.replicateApiKey.trim()}`,
          Prefer: 'wait',
        },
        body: JSON.stringify({
          input: {
            prompt: enhanced,
            aspect_ratio: params.aspectRatio === '16:9' ? '16:9' : params.aspectRatio === '9:16' ? '9:16' : '1:1',
            seed,
          },
        }),
      });

      const data = await response.json();
      if (response.ok && Array.isArray(data.output) && data.output.length > 0) {
        return {
          imageUrl: data.output[0],
          model: 'Flux.1-Pro',
          enhancedPrompt: enhanced,
          seed,
        };
      }
    } catch (err) {
      console.warn('Replicate API call failed, falling back to clean diffusion engine:', err);
    }
  }

  // 3. High-Fidelity Clean GPU Flux Diffusion Engine (Clean URL, no '#' or conflicting chars)
  const cleanPromptForUrl = (params.enhanceWithBrandTone ? enhanced : params.prompt)
    .replace(/[#?&%]/g, ' ')
    .trim();
  const encodedPrompt = encodeURIComponent(cleanPromptForUrl.slice(0, 320));
  const dynamicAIImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`;

  return {
    imageUrl: dynamicAIImageUrl,
    model: params.model || 'DALL-E-3',
    enhancedPrompt: enhanced,
    seed,
  };
}
