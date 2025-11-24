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
    const barber =
      body.barber !== undefined
        ? body.barber === null
          ? null
          : String(body.barber).trim()
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
    let userRole: string | null = null;
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

      // Confirm profile exists now and read role (if present)
      const { data: existingProfile, error: fetchProfileErr } = await (
        supabase as any
      )
        .from('profiles')
        .select('id, role')
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
      userRole = (existingProfile as any).role ?? null;
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
    if (barber !== undefined) insertPayload.barber = barber;
    // determine item type based on submitter role: barber => 'walk in', others => 'book'
    try {
      const typeVal =
        typeof userRole === 'string' && userRole === 'barber'
          ? 'walk in'
          : 'book';
      insertPayload.type = typeVal;
    } catch (e) {
      // fallback safely
      insertPayload.type = 'book';
    }
    if (service_time !== undefined) insertPayload.service_time = service_time;
    // default status for new items
    insertPayload.status = 'at queue';

    // If the submitter is NOT a barber (customer/non-barber), auto-fill eta_start
    // to the requested service_time when provided.
    try {
      if (
        userRole !== 'barber' &&
        service_time !== undefined &&
        service_time !== null
      ) {
        insertPayload.eta_start = service_time;

        // Also auto-calc eta_end = eta_start + 30 minutes for non-barber submissions
        try {
          const start = new Date(String(service_time));
          if (!isNaN(start.getTime())) {
            const end = new Date(start.getTime() + 30 * 60 * 1000);
            insertPayload.eta_end = end.toISOString();
          }
        } catch (e2) {
          // ignore if parsing fails
        }
      }
    } catch (e) {
      // ignore and proceed without eta_start/eta_end
    }

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

export async function GET(req: Request) {
  try {
    // Prefer using the service-role key so we can bypass RLS and return all
    // rows regardless of the requesting user's session. If the service role
    // key isn't available, fall back to the server client which may return
    // an empty array under RLS.
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let data: any = null;
    let error: any = null;
    if (serviceRoleKey) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        console.error('private-items: missing NEXT_PUBLIC_SUPABASE_URL env');
      } else {
        try {
          const serviceClient = createServiceClient(
            supabaseUrl,
            serviceRoleKey,
            { auth: { persistSession: false } }
          );

          const res = await (serviceClient as any)
            .from('private_items')
            .select('*')
            .order('created_at', { ascending: false });

          data = res.data;
          error = res.error;
        } catch (e: any) {
          console.error('private-items: service client GET error', {
            message: e?.message || String(e),
            stack: e?.stack || null,
          });
          // fall through to try server client below
        }
      }
    }

    if (!data && !error) {
      try {
        const supabase = await createSupabaseClient();
        const res = await (supabase as any)
          .from('private_items')
          .select('*')
          .order('created_at', { ascending: false });

        data = res.data;
        error = res.error;
      } catch (e: any) {
        console.error('private-items: server client GET error', {
          message: e?.message || String(e),
          stack: e?.stack || null,
        });
        return NextResponse.json(
          {
            error: 'Database fetch error',
            details: {
              message: e?.message || String(e),
              hint: 'Server failed to reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL, network connectivity, and that Supabase is reachable from this host.',
            },
          },
          { status: 500 }
        );
      }
    }

    if (error) {
      console.error('private-items: GET fetch error', error);
      return NextResponse.json(
        { error: 'Database fetch error', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error('private-items: unexpected GET error', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
