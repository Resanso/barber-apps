import { createSupabaseClient } from '@/supabase-clients/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

type PatchPayload = {
  metadata?: any;
  phone?: string | null;
  full_name?: string | null;
  service?: string | null;
  status?: 'at served' | 'at queue' | null;
  service_time?: string | null;
};

export async function PATCH(req: NextRequest, context: any) {
  try {
    // `context.params` can be a plain object or a Promise (depending on Next version/runtime).
    let params = context?.params;
    if (params && typeof params.then === 'function') {
      params = await params;
    }
    const id = String(params?.id);
    const body = await req.json();
    const payload: PatchPayload = {};
    if (body.metadata !== undefined) payload.metadata = body.metadata;
    if (body.phone !== undefined) payload.phone = body.phone ?? null;
    if (body.full_name !== undefined)
      payload.full_name = body.full_name ?? null;
    if (body.service !== undefined) payload.service = body.service ?? null;
    if (body.service_time !== undefined)
      payload.service_time = body.service_time ?? null;
    // allow status change only if provided
    if (body.status !== undefined) {
      const st = body.status;
      if (st === 'at served' || st === 'at queue') payload.status = st;
      else payload.status = null;
    }

    const supabase = await createSupabaseClient();

    // Get current user
    const {
      data: { user },
      error: userErr,
    } = await (supabase.auth as any).getUser();

    if (userErr) console.error('private-items.update: getUser error', userErr);
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Lookup role
    const { data: profile, error: profileErr } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profileErr ? null : profile?.role ?? null;

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // If user is barber and service key available, use service client to bypass RLS
    if (role === 'barber' && serviceKey) {
      const svc = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        serviceKey,
        {
          auth: { persistSession: false },
        }
      );

      // Only allow status updates for barber role when using service client.
      const updatePayload: any = { ...payload };

      // If barber sets status to 'at served', set ETA timestamps server-side
      if (updatePayload.status === 'at served') {
        const now = new Date();
        const etaStart = now.toISOString();
        const etaEnd = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
        updatePayload.eta_start = etaStart;
        updatePayload.eta_end = etaEnd;
      }

      const { data, error } = await (svc as any)
        .from('private_items')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('private-items.update: service update error', error);
        return NextResponse.json(
          { error: 'Update failed', details: error },
          { status: 500 }
        );
      }

      return NextResponse.json({ data }, { status: 200 });
    }

    // Otherwise enforce owner-only update via session client
    // Non-barber users are allowed to update only certain fields (not status)
    const ownerPayload = { ...payload } as any;
    // strip status from owner updates to enforce barber-only status changes
    if (ownerPayload.status !== undefined) delete ownerPayload.status;

    const { data, error } = await (supabase as any)
      .from('private_items')
      .update(ownerPayload)
      .eq('id', id)
      .eq('owner_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('private-items.update: update error', error);
      // If nothing was updated, return forbidden or not found
      if (error.code === 'PGRST116' || error.code === 'PGRST102') {
        return NextResponse.json(
          { error: 'Not found or not allowed' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Update failed', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error('private-items.update: unexpected error', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: any) {
  try {
    let params = context?.params;
    if (params && typeof params.then === 'function') {
      params = await params;
    }
    const id = String(params?.id);
    const supabase = await createSupabaseClient();

    const {
      data: { user },
      error: userErr,
    } = await (supabase.auth as any).getUser();

    if (userErr) console.error('private-items.delete: getUser error', userErr);
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Debug: log incoming id and user
    console.debug('private-items.delete: incoming id', id);
    console.debug('private-items.delete: current user id', user?.id);

    // Lookup role
    const { data: profile, error: profileErr } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profileErr ? null : profile?.role ?? null;
    console.debug('private-items.delete: resolved role', role);
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Debug: log obfuscated service key prefix (do NOT log full key)
    try {
      if (serviceKey) {
        const prefix = String(serviceKey).slice(0, 12);
        console.debug(
          'private-items.delete: SUPABASE_SERVICE_ROLE_KEY prefix',
          prefix + '...'
        );
      } else {
        console.debug(
          'private-items.delete: SUPABASE_SERVICE_ROLE_KEY not set'
        );
      }
    } catch (e) {
      console.debug(
        'private-items.delete: error reading service key prefix',
        e
      );
    }

    // Fetch the existing item for debugging (owner_id etc.)
    let existingItem = null;
    let existingErr = null;
    try {
      const lookup = await (supabase as any)
        .from('private_items')
        .select('id,owner_id')
        .eq('id', id)
        .single();
      existingItem = lookup.data ?? null;
      existingErr = lookup.error ?? null;
      if (existingErr) {
        console.debug(
          'private-items.delete: existing item lookup error',
          existingErr
        );
      } else {
        console.debug('private-items.delete: existing item', existingItem);
      }
    } catch (e) {
      existingErr = e;
      console.debug('private-items.delete: existing item lookup threw', e);
    }

    // If the item can't be found or lookup failed, return debug info for now
    if (existingErr || !existingItem) {
      console.warn('private-items.delete: item not found or lookup failed', {
        id,
        existingErr,
      });
      return NextResponse.json(
        {
          error: 'Not found',
          debug: {
            id,
            userId: user?.id ?? null,
            role: role ?? null,
            existingErr: existingErr
              ? String((existingErr as any).message ?? existingErr)
              : null,
            existingItem: existingItem ?? null,
          },
        },
        { status: 404 }
      );
    }

    // Only users with the 'barber' role are allowed to perform deletes.
    if (role !== 'barber') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Perform deletion using the session-bound Supabase client (no service role key).
    // NOTE: For this to succeed, your DB RLS policies must allow authenticated
    // users with the barber role to delete rows (see recommended SQL below).
    try {
      const { data, error } = await (supabase as any)
        .from('private_items')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('private-items.delete: session delete error', error);
        return NextResponse.json(
          { error: 'Delete failed', details: error },
          { status: 500 }
        );
      }

      if (!data || (Array.isArray(data) && data.length === 0)) {
        console.warn(
          'private-items.delete: session delete returned no rows for id',
          id
        );
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      return NextResponse.json(
        { message: 'Deleted', deleted: data },
        { status: 200 }
      );
    } catch (err) {
      console.error('private-items.delete: unexpected delete error', err);
      return NextResponse.json(
        { error: 'Delete failed', details: err },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('private-items.delete: unexpected error', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
