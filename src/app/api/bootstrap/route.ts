import { NextResponse } from 'next/server';
import { readDatabase, resetDbToDefaults } from '@/lib/server-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await readDatabase();
    return NextResponse.json({
      success: true,
      data: db,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to load database' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === 'RESET_TO_DEFAULTS') {
      const resetData = await resetDbToDefaults();
      return NextResponse.json({
        success: true,
        message: 'Database reset to factory defaults',
        data: resetData,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Action failed' },
      { status: 500 }
    );
  }
}
