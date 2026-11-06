import { NextResponse } from 'next/server';
import { updateDbSocialAccount } from '@/lib/server-db';
import { SocialAccount } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body: SocialAccount = await request.json();
    if (!body.subsidiaryId || !body.platform) {
      return NextResponse.json(
        { success: false, error: 'Missing subsidiaryId or platform' },
        { status: 400 }
      );
    }

    const saved = await updateDbSocialAccount(body);
    return NextResponse.json({
      success: true,
      data: saved,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update social account' },
      { status: 500 }
    );
  }
}
