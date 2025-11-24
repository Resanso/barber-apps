import { T } from '@/components/ui/Typography';
import { createSupabaseClient } from '@/supabase-clients/server';
import BarberPrivateItemsRealtime from '../BarberPrivateItemsRealtime';
import BookingForm from '../booking-form';

export default async function BarberDashboardPage() {
    // Server-side fetch all private_items for barbers
    let privateItems: Array<any> = [];
    try {
        const supabase = await createSupabaseClient();
        const { data, error } = await (supabase as any)
            .from('private_items')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('barber dashboard: failed to fetch private_items', error);
        } else {
            privateItems = data ?? [];
        }
    } catch (e) {
        console.error('barber dashboard: unexpected error fetching private_items', e);
    }

    // determine if current user has role 'barber' so we can show submission UI
    let isBarber = false;
    try {
        const supabase = await createSupabaseClient();
        const {
            data: { user },
        } = await (supabase.auth as any).getUser();
        if (user) {
            const { data: profile, error: profileErr } = await (supabase as any)
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            if (!profileErr && profile) {
                isBarber = (profile as any).role === 'barber';
            }
        }
    } catch (e) {
        console.error('barber dashboard: error checking user role', e);
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
            <T.H1>Barbers</T.H1>



            <div>
                {/* If current user is a barber, show the booking/walk-in form */}
                {isBarber && (
                    <div className="mb-4">
                        <BookingForm />
                    </div>
                )}

                {/* Render client component that will subscribe to realtime updates */}
                <BarberPrivateItemsRealtime initialItems={privateItems} showActions={false} />
            </div>
        </div>
    );
}
