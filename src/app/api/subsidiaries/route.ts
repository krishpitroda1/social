import { NextResponse } from 'next/server';
import { mockSubsidiaries } from '@/lib/mock-data';

// In-memory store for prototype runtime persistence
let subsidiaries = [...mockSubsidiaries];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: subsidiaries,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newSubsidiary = {
      id: `sub-${Date.now()}`,
      organizationId: body.organizationId || 'org-vanguard-01',
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tagline: body.tagline || '',
      brandTone: body.brandTone || 'Professional & Modern',
      toneKeywords: body.toneKeywords || ['innovative', 'sleek'],
      primaryColor: body.primaryColor || '#6366F1',
      secondaryColor: body.secondaryColor || '#EC4899',
      accentColor: body.accentColor || '#10B981',
      logoUrl: body.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      websiteUrl: body.websiteUrl || '',
      targetAudience: body.targetAudience || 'Modern Consumers',
      activeAccountsCount: 2,
    };

    subsidiaries.push(newSubsidiary);

    return NextResponse.json({
      success: true,
      data: newSubsidiary,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create subsidiary' },
      { status: 400 }
    );
  }
}

