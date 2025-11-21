"use client";

import { PrivateItemsList } from '@/app/(dynamic-pages)/(main-pages)/PrivateItemsList';
import { createClient } from '@/supabase-clients/client';
import { useEffect, useState } from 'react';

interface Props {
    initialItems: Array<any>;
    showActions?: boolean;
}

export default function BarberPrivateItemsRealtime({
    initialItems,
    showActions = false,
}: Props) {
    const [items, setItems] = useState<Array<any>>(initialItems ?? []);
    const [isBarber, setIsBarber] = useState<boolean>(false);

    useEffect(() => {
        const supabase = createClient();

        // fetch current user's role client-side and set isBarber
        (async () => {
            try {
                const { data: userData } = await (supabase.auth as any).getUser();
                const user = userData?.user ?? null;
                if (!user?.id) return;

                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (!error && profile && profile.role === 'barber') {
                    setIsBarber(true);
                }
            } catch (e) {
                // ignore
            }
        })();

        const channel = supabase
            .channel('public:private_items')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'private_items' },
                (payload: any) => {
                    const event = payload.eventType || payload.type || payload.event;
                    const record = payload.new ?? payload.record ?? payload;

                    if (!event) return;

                    if (event === 'INSERT' || event === 'insert') {
                        setItems((prev) => [record, ...prev]);
                        return;
                    }

                    if (event === 'UPDATE' || event === 'update') {
                        setItems((prev) => prev.map((it) => (it.id === record.id ? record : it)));
                        return;
                    }

                    if (event === 'DELETE' || event === 'delete') {
                        const id = (payload.old ?? payload.old_record ?? payload.oldRecord ?? {}).id ?? record?.id;
                        setItems((prev) => prev.filter((it) => String(it.id) !== String(id)));
                        return;
                    }
                }
            )
            .subscribe();

        return () => {
            try {
                supabase.removeChannel(channel);
            } catch (e) {
                // older API fallbacks
                try {
                    // @ts-ignore
                    channel.unsubscribe?.();
                } catch (err) {
                    // ignore
                }
            }
        };
    }, []);

    return <PrivateItemsList privateItems={items} showActions={showActions} isBarber={isBarber} />;
}
