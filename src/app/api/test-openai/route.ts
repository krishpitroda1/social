import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey || !apiKey.trim().startsWith('sk-')) {
      return NextResponse.json({
        success: false,
        error: 'Key must start with sk- or sk-proj-',
      });
    }

    const trimmedKey = apiKey.trim();

    // Verify key against OpenAI API models endpoint
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${trimmedKey}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'OpenAI API Key is valid and active!',
      });
    } else {
      const errorMsg = data.error?.message || response.statusText || 'OpenAI authentication failed';
      return NextResponse.json({
        success: false,
        error: errorMsg,
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Network connection to OpenAI failed',
    });
  }
}
