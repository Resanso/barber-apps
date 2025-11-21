import { createSupabaseClient } from '@/supabase-clients/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createSupabaseClient();

    const {
      data: { user },
      error: userError,
    } = await (supabase.auth as any).getUser();

    if (userError) {
      console.error('api/auth/role: getUser error', userError);
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileErr } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileErr) {
      console.error('api/auth/role: profile lookup error', profileErr);
      return NextResponse.json({ role: null }, { status: 200 });
    }

    return NextResponse.json({ role: profile?.role ?? null }, { status: 200 });
  } catch (err) {
    console.error('api/auth/role: unexpected error', err);
    return NextResponse.json({ role: null }, { status: 200 });
  }
}
