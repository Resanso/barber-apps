"use client";

import { createClient as createBrowserClient } from '@/supabase-clients/client';
import { type SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { PrivateItemsList } from "../../PrivateItemsList";

interface BarberPrivateItemsRealtimeProps {
    initialItems?: any[];
    showActions?: boolean;
    isBarber?: boolean;
}

// Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY tersedia
export default function BarberPrivateItemsRealtime({
    initialItems = [],
    showActions = false,
    isBarber = false,
}: BarberPrivateItemsRealtimeProps) {
    const [items, setItems] = useState(initialItems);
    const [isBarberState, setIsBarberState] = useState<boolean>(!!isBarber);

    // keep items in sync if parent provides new initialItems
    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    const supabase = useMemo<SupabaseClient | null>(() => {
        try {
            const client = createBrowserClient();
            return client as unknown as SupabaseClient;
        } catch (err) {
            console.warn("failed to create browser supabase client", err);
            return null;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!supabase) return;

        console.debug("supabase client created", {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL,
            keyPresent: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
            client: supabase,
        });

        // quick client-side fetch to validate anon key + get freshest data
        (async () => {
            try {
                const { data: fresh, error } = await supabase
                    .from("private_items")
                    .select("*")
                    .order("created_at", { ascending: false });
                if (error) console.debug("supabase client fetch error", error);
                if (fresh) {
                    setItems((prev) => {
                        // merge fresh with existing, prefer fresh
                        const byId = new Map(prev.map((p) => [p.id, p]));
                        fresh.forEach((f: any) => byId.set(f.id, f));
                        return Array.from(byId.values()).sort((a: any, b: any) => {
                            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                        });
                    });
                }
            } catch (err) {
                console.debug("supabase client fetch failed", err);
            }
        })();

        const channel = supabase
            .channel("public:private_items")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "private_items" },
                (payload) => {
                    console.debug("realtime payload", payload);
                    const p: any = payload as any;
                    const eventType = (p.eventType || p.event || "").toString().toUpperCase();
                    const newRow = p.new ?? p.record ?? null;
                    const oldRow = p.old ?? null;

                    setItems((prev) => {
                        if (eventType.includes("INSERT")) {
                            if (newRow == null) return prev;
                            return [newRow, ...prev.filter((it) => it.id !== newRow.id)];
                        }
                        if (eventType.includes("UPDATE")) {
                            if (newRow == null) return prev;
                            return prev.map((it) => (it.id === newRow.id ? newRow : it));
                        }
                        if (eventType.includes("DELETE")) {
                            const idToRemove = oldRow?.id ?? newRow?.id;
                            if (!idToRemove) return prev;
                            return prev.filter((it) => it.id !== idToRemove);
                        }
                        return prev;
                    });
                }
            );

        // subscribe and log result
        try {
            const sub = channel.subscribe();
            console.debug("supabase channel subscribed", { channel, sub });
        } catch (err) {
            console.debug("supabase channel subscribe failed", err);
        }

        return () => {
            // try to cleanly remove/unsubscribe
            try {
                supabase.removeChannel(channel);
            } catch (err) {
                // fallback: attempt to call unsubscribe on the channel
                // @ts-ignore
                try {
                    channel.unsubscribe();
                } catch (e) {
                    // ignore
                }
            }
        };
    }, [supabase]);

    // Try to fetch role from server-side endpoint to confirm barber role
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await fetch('/api/auth/role', { method: 'GET', credentials: 'same-origin' });
                if (!res.ok) return;
                const body = await res.json().catch(() => ({}));
                if (!mounted) return;
                if (body && body.role === 'barber') setIsBarberState(true);
                else if (body && (body.role === null || body.role === undefined)) setIsBarberState(false);
            } catch (e) {
                // keep fallback prop value
                console.debug('BarberPrivateItemsRealtime: failed to fetch /api/auth/role', e);
            }
        })();
        return () => { mounted = false; };
    }, []);

    return <PrivateItemsList privateItems={items} showActions={showActions} isBarber={!!isBarberState} />;
}
