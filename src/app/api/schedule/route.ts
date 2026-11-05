import { NextResponse } from 'next/server';
import { formatAyrsharePayload, formatBufferPayload, dispatchToSocialConnector } from '@/lib/social-connectors';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      platform,
      imageUrl,
      caption,
      hashtags,
      scheduledTime,
      postNow,
      connector = 'ayrshare',
      apiKey,
      profileKey,
    } = body;

    let payload: any;
    if (connector === 'buffer') {
      payload = formatBufferPayload({
        caption,
        platform,
        imageUrl,
        scheduledTime,
        postNow,
      });
    } else {
      payload = formatAyrsharePayload({
        caption,
        hashtags: hashtags || [],
        platform,
        imageUrl,
        scheduledTime,
        postNow,
      });
    }

    const resolvedApiKey = apiKey || process.env.AYRSHARE_API_KEY;
    const dispatchResult = await dispatchToSocialConnector(connector, payload, resolvedApiKey, profileKey);

    return NextResponse.json({
      success: true,
      data: {
        ...dispatchResult,
        status: postNow ? 'PUBLISHED' : 'SCHEDULED',
        scheduledTime: postNow ? undefined : scheduledTime,
        payload,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Scheduling failed' },
      { status: 500 }
    );
  }
}
