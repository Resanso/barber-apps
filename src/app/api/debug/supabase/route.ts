import { NextResponse } from 'next/server';

function maskKey(k: string | null | undefined) {
  if (!k) return null;
  if (k.length <= 8) return '*****';
  return k.slice(0, 4) + '...' + k.slice(-4);
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || null;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || null;

  const result: any = {
    supabaseUrl,
    publishablePresent: !!publishable,
    publishableMasked: maskKey(publishable),
    serviceRolePresent: !!serviceRole,
    serviceRoleMasked: maskKey(serviceRole),
    fetchOk: null,
    fetchError: null,
  };

  if (!supabaseUrl) {
    return NextResponse.json(
      { ok: false, reason: 'NEXT_PUBLIC_SUPABASE_URL not set' },
      { status: 500 }
    );
  }

  try {
    // perform a simple HEAD request to test basic connectivity
    const res = await fetch(supabaseUrl, { method: 'HEAD' });
    result.fetchOk = res.ok;
    result.fetchStatus = res.status;
  } catch (err: any) {
    result.fetchOk = false;
    result.fetchError = {
      message: err?.message || String(err),
      stack: err?.stack || null,
    };
  }

  return NextResponse.json({ ok: true, result }, { status: 200 });
}
// Note: only a single GET export is allowed per route file. The handler above
// performs an env check and a simple HEAD request to the Supabase URL.
