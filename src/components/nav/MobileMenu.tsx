"use client";
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function MobileMenu() {
    const [open, setOpen] = useState(false);

    return (
        <div className="md:hidden">
            <button
                aria-label={open ? 'Close menu' : 'Open menu'}
                onClick={() => setOpen((v) => !v)}
                className="p-2 rounded-md hover:bg-stone-100"
            >
                {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {open && (
                <div className="absolute top-20 left-0 right-0 bg-[#FDFBF7] border-t border-stone-200 z-50 shadow-md">
                    <div className="flex flex-col p-4 space-y-2">
                        <Link href="#services" onClick={() => setOpen(false)} className="block py-2 px-2 rounded hover:bg-stone-100">Services</Link>
                        <Link href="#about" onClick={() => setOpen(false)} className="block py-2 px-2 rounded hover:bg-stone-100">About</Link>
                        <Link href="#location" onClick={() => setOpen(false)} className="block py-2 px-2 rounded hover:bg-stone-100">Location</Link>
                        <Link href="/waitlist" onClick={() => setOpen(false)} className="block py-2 px-2 rounded hover:bg-stone-100">Waitlist</Link>
                        <div className="pt-2">
                            <Button size="sm" className="w-full" asChild>
                                <Link href="/login">Member Login</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
