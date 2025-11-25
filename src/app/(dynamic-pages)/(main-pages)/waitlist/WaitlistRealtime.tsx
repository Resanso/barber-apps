"use client";

import { createClient as createBrowserClient } from '@/supabase-clients/client';
import { type SupabaseClient } from '@supabase/supabase-js';
import {
  Activity,
  Calendar,
  Clock,
  Phone,
  Scissors,
  User
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface WaitlistRealtimeProps {
  initialItems?: any[];
}

export default function WaitlistRealtime({ initialItems = [] }: WaitlistRealtimeProps) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState<string | null>(null);

  // --- LOGIC START (TIDAK DIUBAH) ---
  useEffect(() => {
    if (initialItems && initialItems.length > 0) setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    // noop
  }, []);

  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    try {
      const client = createBrowserClient();
      setSupabase(client as unknown as SupabaseClient);
      console.debug('waitlist: createBrowserClient succeeded');
    } catch (err) {
      console.warn('waitlist: failed to create browser supabase client', err);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;

    (async () => {
      try {
        console.debug('waitlist: fetching initial data via client supabase');
        const { data: fresh, error } = await supabase
          .from('private_items')
          .select('*')
          .order('created_at', { ascending: false });
        if (!mounted) return;
        if (error) {
          console.debug('waitlist: supabase client fetch error', error);
          setError(String(error.message ?? error));
        } else if (Array.isArray(fresh) && fresh.length > 0) {
          setItems((prev) => {
            const byId = new Map<any, any>();
            prev.forEach((p: any) => {
              if (p && p.id) byId.set(String(p.id), p);
            });
            fresh.forEach((f: any) => {
              if (f && f.id) byId.set(String(f.id), f);
            });
            const merged = Array.from(byId.values()).sort((a: any, b: any) => {
              const ta = a?.created_at ? new Date(a.created_at).getTime() : 0;
              const tb = b?.created_at ? new Date(b.created_at).getTime() : 0;
              return tb - ta;
            });
            return merged;
          });
          setError(null);
        } else {
          console.debug('waitlist: client supabase fetch returned no rows');
        }
      } catch (e: any) {
        console.debug('waitlist: supabase client fetch failed', e?.message ?? e);
        setError(String(e?.message ?? e));
      }
    })();

    const channel = supabase
      .channel('public:private_items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'private_items' },
        (payload) => {
          try {
            const p: any = payload as any;
            const eventType = (p.eventType || p.event || '').toString().toUpperCase();
            const newRow = p.new ?? p.record ?? null;
            const oldRow = p.old ?? null;
            console.debug('waitlist: realtime payload', { eventType, newRow, oldRow });

            setItems((prev) => {
              if (eventType.includes('INSERT')) {
                if (newRow == null) return prev;
                return [newRow, ...prev.filter((it) => it.id !== newRow.id)];
              }
              if (eventType.includes('UPDATE')) {
                if (newRow == null) return prev;
                return prev.map((it) => (it.id === newRow.id ? newRow : it));
              }
              if (eventType.includes('DELETE')) {
                const idToRemove = oldRow?.id ?? newRow?.id;
                if (!idToRemove) return prev;
                return prev.filter((it) => it.id !== idToRemove);
              }
              return prev;
            });
          } catch (e) {
            console.debug('waitlist: realtime payload handler error', e);
          }
        }
      );

    try {
      const sub = channel.subscribe();
      console.debug('waitlist: subscribed to realtime events', { sub });
    } catch (err) {
      console.debug('waitlist: channel subscribe failed', err);
    }

    return () => {
      mounted = false;
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        try {
          // @ts-ignore
          channel.unsubscribe();
        } catch (e) { }
      }
    };
  }, [supabase]);
  // --- LOGIC END ---

  // Helper untuk format tanggal agar lebih cantik
  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Booking Waitlist</h2>
          <p className="text-sm text-gray-500 mt-1">Real-time monitoring pelanggan barbershop.</p>
        </div>

        {/* Live Indicator Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live Updates Active
        </div>
      </div>

      {error ? (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <Activity className="w-4 h-4" />
          {error}
        </div>
      ) : null}

      {/* Main Content - Card Style */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Belum ada booking</h3>
            <p className="text-gray-500 max-w-sm mt-1">Daftar antrian saat ini kosong. Data akan muncul otomatis saat pelanggan melakukan booking.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200 text-xs font-semibold text-[#FF6700] uppercase tracking-wider">
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Barber</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">ETA Start</th>
                  <th className="px-6 py-4">ETA Done</th>
                  <th className="px-6 py-4">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((it: any, idx: number) => {
                  const name = it.full_name ?? it.name ?? '—';
                  const phone = it.phone ?? '—';
                  const service = it.service ?? '—';
                  const barber = it.barber ?? '—';
                  const serviceTime = it.service_time ?? it.time;
                  const created = it.created_at;
                  const rowKey = it.id ?? `row-${idx}-${it.created_at ?? ''}`;

                  return (
                    <tr key={rowKey} className="hover:bg-gray-50/80 transition-colors group">
                      {/* Customer Column */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                              <User size={14} />
                            </div>
                            <span className="font-medium text-gray-900">{name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 ml-10">
                            <Phone size={12} />
                            {phone}
                          </div>
                        </div>
                      </td>

                      {/* Service Column */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-start gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                            <Scissors size={12} />
                            {service}
                          </span>
                        </div>
                      </td>

                      {/* Barber Column */}
                      <td className="px-6 py-4 align-top">
                        <div className="text-sm text-gray-700">{barber}</div>
                      </td>

                      {/* Type Column */}
                      <td className="px-6 py-4 align-top">
                        <div className="text-sm text-gray-700">{it.type ?? '—'}</div>
                      </td>

                      {/* Status Column */}
                      <td className="px-6 py-4 align-top">
                        <div className="text-sm">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${it.status === 'at served' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-yellow-50 text-yellow-800 border border-yellow-100'}`}>
                            {it.status === 'at served' ? 'Served' : 'Queue'}
                          </span>
                        </div>
                      </td>

                      {/* Schedule Column */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Clock size={16} className="text-gray-400" />
                          <span className="font-medium">
                            {serviceTime ? formatDate(serviceTime) : '—'}
                          </span>
                        </div>
                      </td>

                      {/* ETA Column */}
                      <td className="px-6 py-4 align-top">
                        <div className="text-sm text-gray-700">
                          {it.eta_end ? (
                            <div className="font-medium">{formatDate(String(it.eta_end))}</div>
                          ) : (
                            <div className="text-muted-foreground">—</div>
                          )}
                        </div>
                      </td>

                      {/* Created Column */}
                      <td className="px-6 py-4 align-top">
                        <div className="text-xs text-gray-500">
                          {created ? formatDate(created) : '—'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="mt-4 text-right text-xs text-gray-400">
        Menampilkan {items.length} data booking
      </div>
    </div>
  );
}