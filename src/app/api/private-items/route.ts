import { createSupabaseClient } from '@/supabase-clients/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone =
      body.phone !== undefined
        ? body.phone === null
          ? null
          : String(body.phone).trim()
        : undefined;
    const full_name =
      body.full_name !== undefined
        ? body.full_name === null
          ? null
          : String(body.full_name).trim()
        : undefined;
    const service =
      body.service !== undefined
        ? body.service === null
          ? null
          : String(body.service).trim()
        : undefined;
    const service_time =
      body.service_time !== undefined
        ? body.service_time === null
          ? null
          : String(body.service_time)
        : undefined;

    const supabase = await createSupabaseClient();

    // Get the authenticated user from the server client
    const {
      data: { user },
      error: userError,
    } = await (supabase.auth as any).getUser();

    if (userError) {
      console.error('private-items: getUser error', userError);
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure a profile row exists for this user (some users may not have a profile if trigger didn't run)
    try {
      const profilePayload = {
        id: user.id,
        full_name:
          (user.user_metadata && (user.user_metadata as any).full_name) ||
          (user.raw_user_meta_data &&
            (user.raw_user_meta_data as any).full_name) ||
          null,
        email:
          user.email ||
          (user.user_metadata && (user.user_metadata as any).email) ||
          (user.raw_user_meta_data && (user.raw_user_meta_data as any).email) ||
          '',
        avatar_url:
          (user.user_metadata && (user.user_metadata as any).avatar_url) ||
          (user.raw_user_meta_data &&
            (user.raw_user_meta_data as any).avatar_url) ||
          null,
      };

      // Use a service-role client to perform the upsert so RLS doesn't block it.
      // This requires SUPABASE_SERVICE_ROLE_KEY to be set in the environment.
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      let upsertResult: any = null;
      if (serviceRoleKey) {
        const serviceClient = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          serviceRoleKey,
          {
            auth: { persistSession: false },
          }
        );

        upsertResult = await (serviceClient as any)
          .from('profiles')
          .upsert(profilePayload, { onConflict: 'id' })
          .select()
          .single();

        // If the service role key is invalid, Supabase will return an auth error.
        // Detect that case and fall back to the server client upsert so we can
        // proceed when possible and provide a clearer log message to the user.
        if (upsertResult?.error) {
          console.warn(
            'private-items: service role upsert returned error, falling back to server client',
            upsertResult.error
          );

          // Try fallback to server client (may still fail under RLS)
          upsertResult = await (supabase as any)
            .from('profiles')
            .upsert(profilePayload, { onConflict: 'id' })
            .select()
            .single();

          console.log(
            'private-items: fallback server client upsert result',
            !!upsertResult?.data,
            upsertResult?.error || 'no-error'
          );
        } else {
          console.log(
            'private-items: used service role to upsert profile',
            !!upsertResult?.data,
            upsertResult?.error || 'no-error'
          );
        }
      } else {
        // Fallback: try to upsert using the current server client (may fail due to RLS)
        upsertResult = await (supabase as any)
          .from('profiles')
          .upsert(profilePayload, { onConflict: 'id' })
          .select()
          .single();
        console.log(
          'private-items: used server client to upsert profile',
          !!upsertResult?.data,
          upsertResult?.error || 'no-error'
        );
      }

      if (upsertResult?.error) {
        console.error(
          'private-items: profile upsert failed',
          upsertResult.error
        );
        return NextResponse.json(
          {
            error: 'Failed to ensure profile exists',
            details: upsertResult.error,
          },
          { status: 500 }
        );
      }

      // Confirm profile exists now
      const { data: existingProfile, error: fetchProfileErr } = await (
        supabase as any
      )
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      if (fetchProfileErr || !existingProfile) {
        console.error(
          'private-items: profile still missing after upsert',
          fetchProfileErr || 'no-row'
        );
        return NextResponse.json(
          {
            error: 'Profile row missing after upsert',
            details: fetchProfileErr || null,
          },
          { status: 500 }
        );
      }
    } catch (profileErr) {
      // Log but proceed — insertion into private_items will still fail if FK requires a profile
      console.warn('private-items: ensure profile error', profileErr);
    }

    const insertPayload: any = {
      owner_id: user.id,
    };

    // Attach new optional fields when provided
    if (phone !== undefined) insertPayload.phone = phone;
    if (full_name !== undefined) insertPayload.full_name = full_name;
    if (service !== undefined) insertPayload.service = service;
    if (service_time !== undefined) insertPayload.service_time = service_time;

    // Insert without asking PostgREST to return the inserted row. Returning
    // rows requires the schema cache to include the column names; in some
    // Supabase cloud states the schema cache may be stale and cause errors
    // like "Could not find the 'name' column...". To avoid that, perform
    // the insert and return a minimal success response.
    const { error } = await supabase
      .from('private_items')
      .insert(insertPayload);

    if (error) {
      console.error('private-items: insert error', error);
      return NextResponse.json(
        { error: 'Database error creating private item', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Created' }, { status: 201 });
  } catch (err) {
    console.error('private-items: unexpected error', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
