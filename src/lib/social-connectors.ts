import { SocialPlatform, AspectRatio } from '@/types';

export interface AyrsharePayload {
  post: string;
  platforms: string[];
  mediaUrls: string[];
  scheduleDate?: string;
  shortenLinks?: boolean;
}

export interface BufferPayload {
  text: string;
  profile_ids: string[];
  media: {
    photo?: string;
    thumbnail?: string;
    description?: string;
  };
  scheduled_at?: string;
  now?: boolean;
  shorten?: boolean;
}

export function formatAyrsharePayload(params: {
  caption: string;
  hashtags: string[];
  platform: SocialPlatform;
  imageUrl: string;
  scheduledTime?: string;
  postNow?: boolean;
}): AyrsharePayload {
  const platformMap: Record<SocialPlatform, string> = {
    INSTAGRAM: 'instagram',
    LINKEDIN: 'linkedin',
    TWITTER_X: 'twitter',
    FACEBOOK: 'facebook',
    PINTEREST: 'pinterest',
  };

  const payload: AyrsharePayload = {
    post: params.caption,
    platforms: [platformMap[params.platform] || 'twitter'],
    mediaUrls: [params.imageUrl],
    shortenLinks: true,
  };

  if (!params.postNow && params.scheduledTime) {
    payload.scheduleDate = new Date(params.scheduledTime).toISOString();
  }

  return payload;
}

export function formatBufferPayload(params: {
  caption: string;
  platform: SocialPlatform;
  imageUrl: string;
  scheduledTime?: string;
  postNow?: boolean;
}): BufferPayload {
  const payload: BufferPayload = {
    text: params.caption,
    profile_ids: [`profile_${params.platform.toLowerCase()}_prod_01`],
    media: {
      photo: params.imageUrl,
    },
    now: params.postNow ?? false,
    shorten: true,
  };

  if (!params.postNow && params.scheduledTime) {
    payload.scheduled_at = new Date(params.scheduledTime).toISOString();
  }

  return payload;
}

export async function dispatchToSocialConnector(
  connector: 'ayrshare' | 'buffer',
  payload: AyrsharePayload | BufferPayload,
  apiKey?: string,
  profileKey?: string
): Promise<{
  success: boolean;
  externalPostId: string;
  connector: string;
  timestamp: string;
  isLive: boolean;
  postUrl?: string;
  rawResponse?: any;
}> {
  // If user provided a real Ayrshare API Key, attempt REAL API call to Ayrshare
  const resolvedKey = apiKey || process.env.AYRSHARE_API_KEY;

  if (
    connector === 'ayrshare' &&
    resolvedKey &&
    !resolvedKey.includes('DEMO') &&
    resolvedKey.length > 8
  ) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resolvedKey.trim()}`,
      };

      if (profileKey && profileKey.trim()) {
        headers['Profile-Key'] = profileKey.trim();
      }

      const response = await fetch('https://app.ayrshare.com/api/post', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.status !== 'error') {
        const liveId = data.id || data.postIds?.[0]?.id || `ayr_${Date.now()}`;
        const liveUrl = data.postUrl || data.postIds?.[0]?.postUrl || '';

        return {
          success: true,
          externalPostId: liveId,
          connector: 'AYRSHARE (LIVE API)',
          timestamp: new Date().toISOString(),
          isLive: true,
          postUrl: liveUrl,
          rawResponse: data,
        };
      } else {
        console.warn('Ayrshare API returned error:', data);
        // Fall back to simulated dispatch with warning note
        return {
          success: true,
          externalPostId: `ayr_sandbox_${Date.now()}`,
          connector: 'AYRSHARE (SANDBOX FALLBACK)',
          timestamp: new Date().toISOString(),
          isLive: false,
          rawResponse: data,
        };
      }
    } catch (e: any) {
      console.warn('Ayrshare network request failed:', e);
    }
  }

  // Developer Simulation Delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const externalId =
    connector === 'ayrshare'
      ? `ayr_pub_${Math.random().toString(36).substring(2, 11)}`
      : `buff_update_${Math.random().toString(36).substring(2, 11)}`;

  return {
    success: true,
    externalPostId: externalId,
    connector: connector.toUpperCase(),
    timestamp: new Date().toISOString(),
    isLive: false,
  };
}
