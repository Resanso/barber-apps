"use client";
import { RedirectingPleaseWaitCard } from "@/components/Auth/RedirectingPleaseWaitCard";
import { createClient } from "@/supabase-clients/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        async function handleCallback() {
            try {
                const supabase = createClient();
                // This will parse the URL for the OAuth / magic-link response
                // and store the session in the browser (cookies/localStorage).
                // `getSessionFromUrl` exists at runtime but may be missing in the
                // TypeScript client types — cast to `any` to avoid the compile error.
                console.log('[auth callback] starting getSessionFromUrl, href=', window.location.href);
                const { data, error } = await (supabase.auth as any).getSessionFromUrl();
                console.log('[auth callback] getSessionFromUrl result:', { data, error });

                // If we didn't get a session from the URL, check if there's an existing session
                if ((!data || !data.session) && !error) {
                    try {
                        const current = await supabase.auth.getSession();
                        console.log('[auth callback] existing session from supabase.auth.getSession():', current);
                    } catch (e) {
                        console.error('[auth callback] getSession fallback failed', e);
                    }
                }

                if (error) {
                    console.error('[auth callback] Error getting session from URL', error);
                    // fallback to login
                    router.replace('/login');
                    return;
                }

                // If there's a `next` param, redirect there, otherwise go to dashboard
                const params = new URLSearchParams(window.location.search);
                let next = params.get('next') || '/dashboard';

                // If we're redirecting to the generic dashboard, check the user's
                // role so we can send barbers to a specialized dashboard.
                if (next === '/dashboard') {
                    try {
                        const roleRes = await fetch('/api/auth/role', {
                            method: 'GET',
                            credentials: 'same-origin',
                        });
                        const rolePayload = await roleRes.json();
                        if (rolePayload?.role === 'barber') {
                            next = '/dashboard/barber';
                        }
                    } catch (e) {
                        console.warn('[auth callback] role check failed', e);
                    }
                }

                // Replace history so the token isn't left in the URL
                console.log('[auth callback] redirecting to', next);
                router.replace(next);
            } catch (err) {
                console.error('Auth callback handling failed', err);
                router.replace('/login');
            }
        }

        handleCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <RedirectingPleaseWaitCard
                heading="Completing Authentication"
                message="Please wait while we finish signing you in..."
            />
        </div>
    );
}
