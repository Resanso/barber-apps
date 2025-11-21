import { PrivateItemsList } from '@/app/(dynamic-pages)/(main-pages)/PrivateItemsList';
import { T } from '@/components/ui/Typography';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { createSupabaseClient } from '@/supabase-clients/server';
import Link from 'next/link';

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

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
            <T.H1>Barbers</T.H1>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-medium">Barber Dashboard</h3>
                </CardHeader>
                <CardContent>
                    <p>Welcome to the barbers dashboard. Customize this view for barbers.</p>
                    <p className="mt-4">Quick links:</p>
                    <ul className="list-disc ml-6 mt-2">
                        <li>
                            <Link href="/dashboard">View customer dashboard</Link>
                        </li>
                        <li>
                            <Link href="/dashboard/new">Create a new private item</Link>
                        </li>
                    </ul>
                </CardContent>
            </Card>

            <div>
                <PrivateItemsList privateItems={privateItems} showActions={false} />
            </div>
        </div>
    );
}
