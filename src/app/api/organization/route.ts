import { NextResponse } from 'next/server';
import { getDbOrganization, updateDbOrganization } from '@/lib/server-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const org = await getDbOrganization();
    return NextResponse.json({
      success: true,
      data: org,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updated = await updateDbOrganization(body);
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update organization' },
      { status: 400 }
    );
  }
}

