import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { T } from '@/components/ui/Typography';
import { getUserPrivateItems } from '@/data/anon/privateItems';
import { createSupabaseClient } from '@/supabase-clients/server';
import Link from 'next/link';
import { Suspense } from 'react';
import BarberPrivateItemsRealtime from './BarberPrivateItemsRealtime';
import BookingForm from './booking-form';


async function UserPrivateItemsListContainer() {
  const privateItems = await getUserPrivateItems();
  // Server-side: determine if current user is a barber so client component
  // can show barber-only actions (View/Delete).
  let isBarber = false;
  try {
    const supabase = await createSupabaseClient();
    const { data: userData } = await (supabase.auth as any).getUser();
    const user = userData?.user ?? null;
    if (user?.id) {
      const { data: profile, error: profileErr } = await (supabase as any)
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (!profileErr && profile && profile.role === 'barber') {
        isBarber = true;
      }
    }
  } catch (e) {
    const msg = (e as any)?.message ?? '';
    if (typeof msg === 'string' && msg.includes('During prerendering, fetch() rejects when the prerender is complete')) {
      // ignore during prerender
    } else if ((e as any)?.__isAuthError || (typeof msg === 'string' && msg.includes('AuthSessionMissingError'))) {
      // no session during prerender - expected
    } else {
      console.warn('dashboard: failed to resolve profile role for list', e);
    }
  }

  // Render the client realtime wrapper and pass the server snapshot as initial items.
  return (
    <BarberPrivateItemsRealtime
      initialItems={privateItems}
      showActions={false}
      isBarber={isBarber}
    />
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

async function Heading() {
  // Server-side: determine user's role and adjust heading accordingly.
  const supabase = await createSupabaseClient();
  let headingText = 'Dashboard';

  try {
    const { data: userData } = await (supabase.auth as any).getUser();
    const user = userData?.user ?? null;
    if (user?.id) {
      const { data: profile, error: profileErr } = await (supabase as any)
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (!profileErr && profile && profile.role === 'barber') {
        headingText = 'Barbers';
      }
    }
  } catch (e) {
    const msg = (e as any)?.message ?? '';
    if (typeof msg === 'string' && msg.includes('During prerendering, fetch() rejects when the prerender is complete')) {
      // ignore noisy prerender finalization
    } else if ((e as any)?.__isAuthError || (typeof msg === 'string' && msg.includes('AuthSessionMissingError'))) {
      // ignore missing auth session during prerender
    } else {
      // If any error occurs, fall back to default heading.
      console.warn('dashboard: failed to resolve profile role', e);
    }
  }

  return (
    <>
      <T.H1>{headingText}</T.H1>
      <Link href="/dashboard/new">
      </Link>
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <Heading />
      {/* Booking button placed under heading */}
      <BookingForm />
      <Suspense fallback={<ListSkeleton />}>
        <UserPrivateItemsListContainer />
      </Suspense>
    </div>
  );
}
