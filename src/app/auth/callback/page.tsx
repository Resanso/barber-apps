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
                const { data, error } = await (supabase.auth as any).getSessionFromUrl();

                if (error) {
                    console.error('Error getting session from URL', error);
                    // fallback to login
                    router.replace('/login');
                    return;
                }

                // If there's a `next` param, redirect there, otherwise go to dashboard
                const params = new URLSearchParams(window.location.search);
                const next = params.get('next') || '/dashboard';

                // Replace history so the token isn't left in the URL
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
