import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishable = !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'Missing NEXT_PUBLIC_SUPABASE_URL',
        env: {
          NEXT_PUBLIC_SUPABASE_URL: false,
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishable,
        },
      },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(url, { method: 'GET' });
    return NextResponse.json({
      ok: true,
      status: res.status,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: true,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishable,
      },
    });
  } catch (err: any) {
    console.error('Debug fetch error:', err);
    return NextResponse.json(
      {
        ok: false,
        error: String(err),
        env: {
          NEXT_PUBLIC_SUPABASE_URL: true,
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishable,
        },
      },
      { status: 500 }
    );
  }
}
