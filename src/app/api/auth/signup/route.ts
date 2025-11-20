import { createSupabaseClient } from '@/supabase-clients/server';
import { toSiteURL } from '@/utils/helpers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ) {
      console.error('Missing Supabase env vars');
      return NextResponse.json(
        { error: 'Supabase is not configured on the server' },
        { status: 500 }
      );
    }

    const supabase = await createSupabaseClient();

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: toSiteURL('/auth/callback'),
        },
      });

      if (error) {
        console.error('Supabase signUp error:', error);
        const e = error as any;
        return NextResponse.json(
          {
            error: e.message ?? 'Supabase signUp error',
            supabaseError: {
              status: e.status ?? null,
              message: e.message ?? null,
              details: e.details ?? null,
            },
          },
          { status: 400 }
        );
      }

      return NextResponse.json({ data });
    } catch (err: any) {
      console.error('Unexpected error during supabase.signUp:', err);
      return NextResponse.json(
        { error: err?.message ?? String(err) },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error('Error in /api/auth/signup handler:', err);
    return NextResponse.json(
      { error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
