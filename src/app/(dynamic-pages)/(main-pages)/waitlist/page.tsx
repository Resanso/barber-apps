"use client";

import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarDays, Clock } from 'lucide-react'; // Pastikan install lucide-react
import Link from 'next/link';
import { useEffect, useState } from 'react';
import WaitlistRealtime from './WaitlistRealtime';

function LocalClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial date only on client to avoid hydration mismatch
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Cegah render di server (hydration fix)
  if (!now) return null;

  const dateStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(now);

  const timeStr = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(now);

  return (
    <aside className="w-full lg:w-72 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[#204B49] font-medium">
          <Clock className="w-4 h-4" />
          <span className="text-sm tracking-wide uppercase">Local Time</span>
        </div>
        {/* Indikator berkedip untuk efek 'Live' */}
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-4xl font-bold text-slate-800 tracking-tight font-mono">
          {timeStr}
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium pt-2">
          <CalendarDays className="w-4 h-4 text-amber-600" />
          {dateStr}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 leading-relaxed">
          Operational Hours:<br />
          <span className="text-slate-600 font-semibold">10:00 - 21:00 WIB</span>
        </p>
      </div>
    </aside>
  );
}

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">

        {/* Header Page (Optional) */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Waitlist Dashboard</h1>
              <p className="text-slate-500">Monitor real-time queue and barber availability.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Sidebar Section (Clock) */}
          {/* sticky top-24 membuat jam tetap diam saat discroll */}
          <div className="w-full lg:w-auto lg:shrink-0 lg:sticky lg:top-24 z-10">
            <LocalClock />
          </div>

          {/* Main Content Section (Waitlist Table) */}
          <div className="flex-1 w-full min-w-0">
            {/* min-w-0 penting agar table tidak overflow flex container */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <WaitlistRealtime />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}