import { Database } from '@/lib/database.types';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createSupabaseClient = async () => {
  // `cookies()` can throw during prerendering/edge cases. Guard it and
  // provide a safe fallback so build/prerender doesn't fail.
  type SimpleCookieStore = {
    getAll?: () => Array<any>;
    set?: (name: string, value: string, options?: any) => void;
  };

  let cookieStore: SimpleCookieStore | null = null;
  try {
    // cookies() may be async in this runtime and can throw when called
    // outside a valid request context (during prerender). Await and
    // guard it so build/prerender doesn't fail.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    cookieStore = await cookies();
  } catch (e) {
    cookieStore = null;
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          try {
            return cookieStore && typeof cookieStore.getAll === 'function'
              ? cookieStore.getAll()
              : [];
          } catch {
            return [];
          }
        },
        setAll(cookiesToSet) {
          try {
            if (!cookieStore || typeof cookieStore.set !== 'function') return;
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set!(name, value, options)
            );
          } catch {
            // ignore failures to set cookies during certain SSR contexts
          }
        },
      },
    }
  );
};
