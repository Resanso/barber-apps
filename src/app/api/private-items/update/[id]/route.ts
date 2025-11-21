import { createSupabaseClient } from '@/supabase-clients/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

type PatchPayload = {
  title?: string;
  name?: string;
  description?: string | null;
  metadata?: any;
};

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();
    const payload: PatchPayload = {};
    if (body.title !== undefined) payload.title = String(body.title);
    if (body.name !== undefined) payload.name = String(body.name);
    if (body.description !== undefined)
      payload.description = body.description ?? null;
    if (body.metadata !== undefined) payload.metadata = body.metadata;

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

      const { data, error } = await (svc as any)
        .from('private_items')
        .update({ ...payload })
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
    const { data, error } = await (supabase as any)
      .from('private_items')
      .update({ ...payload })
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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const supabase = await createSupabaseClient();

    const {
      data: { user },
      error: userErr,
    } = await (supabase.auth as any).getUser();

    if (userErr) console.error('private-items.delete: getUser error', userErr);
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

    // Only users with the 'barber' role are allowed to delete private items.
    if (role !== 'barber') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If a service role key is available, use the service client to bypass RLS
    // and perform the delete on behalf of the barber.
    if (serviceKey) {
      const svc = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        serviceKey,
        {
          auth: { persistSession: false },
        }
      );

      const { error } = await (svc as any)
        .from('private_items')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('private-items.delete: service delete error', error);
        return NextResponse.json(
          { error: 'Delete failed', details: error },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: 'Deleted' }, { status: 200 });
    }

    // No service key available: attempt to delete using the session-bound server
    // client. This will succeed only if RLS policies allow barbers to delete
    // their target rows. We still enforce the role check above so non-barbers
    // cannot delete even their own items.
    const { error } = await (supabase as any)
      .from('private_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('private-items.delete: delete error', error);
      return NextResponse.json(
        { error: 'Delete failed', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Deleted' }, { status: 200 });
  } catch (err) {
    console.error('private-items.delete: unexpected error', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
