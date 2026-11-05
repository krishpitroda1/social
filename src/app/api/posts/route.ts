import { NextResponse } from 'next/server';
import { mockPosts } from '@/lib/mock-data';
import { ScheduledPost } from '@/types';

let posts: ScheduledPost[] = [...mockPosts];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brandId = searchParams.get('brandId');
  const status = searchParams.get('status');
  const platform = searchParams.get('platform');

  let filtered = [...posts];

  if (brandId && brandId !== 'ALL') {
    filtered = filtered.filter((p) => p.subsidiaryId === brandId);
  }
  if (status && status !== 'ALL') {
    filtered = filtered.filter((p) => p.status === status);
  }
  if (platform && platform !== 'ALL') {
    filtered = filtered.filter((p) => p.platform === platform);
  }

  return NextResponse.json({
    success: true,
    total: filtered.length,
    data: filtered,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newPost: ScheduledPost = {
      id: `post-${Date.now()}`,
      subsidiaryId: body.subsidiaryId,
      platform: body.platform,
      prompt: body.prompt,
      enhancedPrompt: body.enhancedPrompt,
      imageUrl: body.imageUrl,
      aspectRatio: body.aspectRatio || '1:1',
      caption: body.caption,
      hashtags: body.hashtags || [],
      status: body.postNow ? 'PUBLISHED' : 'SCHEDULED',
      modelName: body.modelName || 'Flux.1-Pro',
      scheduledTime: body.postNow ? undefined : body.scheduledTime,
      publishedTime: body.postNow ? new Date().toISOString() : undefined,
      metricsLikes: 0,
      metricsComments: 0,
      metricsShares: 0,
      metricsImpressions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    posts.unshift(newPost);

    return NextResponse.json({
      success: true,
      data: newPost,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save post' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing post id' }, { status: 400 });
  }

  posts = posts.filter((p) => p.id !== id);

  return NextResponse.json({ success: true, message: 'Post deleted successfully' });
}

