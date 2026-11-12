import { NextResponse } from 'next/server';
import {
  getDbSubsidiaries,
  addDbSubsidiary,
  updateDbSubsidiary,
  deleteDbSubsidiary,
} from '@/lib/server-db';
import { Subsidiary } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const subsidiaries = await getDbSubsidiaries();
    return NextResponse.json({
      success: true,
      data: subsidiaries,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch subsidiaries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newSubsidiary: Subsidiary = {
      id: body.id || `sub-${Date.now()}`,
      organizationId: body.organizationId || 'org-vanguard-01',
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tagline: body.tagline || '',
      brandTone: body.brandTone || 'Professional & Modern',
      toneKeywords: body.toneKeywords || ['innovative', 'sleek'],
      primaryColor: body.primaryColor || '#6366F1',
      secondaryColor: body.secondaryColor || '#EC4899',
      accentColor: body.accentColor || '#10B981',
      logoUrl: body.logoUrl !== undefined ? body.logoUrl : '',
      websiteUrl: body.websiteUrl || '',
      targetAudience: body.targetAudience || 'Modern Consumers',
      activeAccountsCount: body.activeAccountsCount || 0,
    };

    const saved = await addDbSubsidiary(newSubsidiary);

    return NextResponse.json({
      success: true,
      data: saved,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create subsidiary' },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body: Subsidiary = await request.json();
    if (!body.id || !body.name) {
      return NextResponse.json(
        { success: false, error: 'Missing required subsidiary fields (id, name)' },
        { status: 400 }
      );
    }

    const updated = await updateDbSubsidiary(body);
    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update subsidiary' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing subsidiary id' },
        { status: 400 }
      );
    }

    const deleted = await deleteDbSubsidiary(id);
    return NextResponse.json({
      success: deleted,
      message: deleted ? 'Subsidiary deleted successfully' : 'Subsidiary not found',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete subsidiary' },
      { status: 500 }
    );
  }
}
