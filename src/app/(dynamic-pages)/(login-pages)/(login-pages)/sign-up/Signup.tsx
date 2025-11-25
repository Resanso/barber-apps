'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { Email } from '@/components/Auth/Email';
import { EmailAndPassword } from '@/components/Auth/EmailAndPassword';
import { EmailConfirmationPendingCard } from '@/components/Auth/EmailConfirmationPendingCard';
import { RenderProviders } from '@/components/Auth/RenderProviders';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';

import { signInWithProviderAction } from '@/data/auth/auth';
import type { AuthProvider } from '@/types';

interface SignUpProps {
  next?: string;
}

export function SignUp({ next }: SignUpProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const toastRef = useRef<string | number | undefined>(undefined);

  const [magicLinkStatus, setMagicLinkStatus] = useState<'idle' | 'sending'>('idle');

  async function sendMagicLink(email: string) {
    try {
      setMagicLinkStatus('sending');
      toastRef.current = toast.loading('Sending magic link...');
      const res = await fetch('/api/auth/magic', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, next }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error ?? 'Failed to send magic link');
      toast.success('A magic link has been sent to your email!', {
        id: toastRef.current,
      });
      toastRef.current = undefined;
      setSuccessMessage('A magic link has been sent to your email!');
    } catch (err: any) {
      toast.error(err?.message ?? String(err), { id: toastRef.current });
      toastRef.current = undefined;
    } finally {
      setMagicLinkStatus('idle');
    }
  }

  const [signUpStatus, setSignUpStatus] = useState<'idle' | 'submitting'>('idle');

  async function signUpFetch(email: string, password?: string) {
    try {
      setSignUpStatus('submitting');
      toastRef.current = toast.loading('Creating account...');
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error ?? 'Failed to create account');
      toast.success('Account created!', { id: toastRef.current });
      toastRef.current = undefined;
      setSuccessMessage('A confirmation link has been sent to your email!');
    } catch (err: any) {
      toast.error(err?.message ?? String(err), { id: toastRef.current });
      toastRef.current = undefined;
    } finally {
      setSignUpStatus('idle');
    }
  }

  const { execute: executeProvider, status: providerStatus } = useAction(
    signInWithProviderAction,
    {
      onExecute: () => {
        toastRef.current = toast.loading('Requesting login...');
      },
      onSuccess: ({ data }) => {
        toast.success('Redirecting...', { id: toastRef.current });
        toastRef.current = undefined;
        if (data?.url) {
          window.location.href = data.url;
        }
      },
      onError: ({ error }) => {
        const errorMessage = error.serverError ?? 'Failed to login';
        toast.error(errorMessage, { id: toastRef.current });
        toastRef.current = undefined;
      },
    }
  );

  return (
    <div
      data-success={successMessage}
      className="container data-success:flex items-center data-success:justify-center text-left max-w-lg mx-auto overflow-auto data-success:h-full min-h-[470px]"
    >
      {successMessage ? (
        <EmailConfirmationPendingCard
          type="sign-up"
          heading="Confirmation Link Sent"
          message={successMessage}
          resetSuccessMessage={setSuccessMessage}
        />
      ) : (
        <div className="space-y-8 bg-background p-6 rounded-lg shadow-sm dark:border">
          <div className="mb-2">
            <Link href="/" className="inline-block">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
          <Tabs defaultValue="password" className="md:min-w-[400px]">


            <TabsContent value="password">
              <Card className="border-none shadow-none bg-emerald-50 p-6">
                <CardHeader className="py-6 px-0">
                  <CardTitle>Register to Trich Barberspace</CardTitle>
                  <CardDescription>
                    Create an account with your email and password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-0">
                  <EmailAndPassword
                    isLoading={signUpStatus === 'submitting'}
                    onSubmit={(data) => {
                      void signUpFetch(data.email, data.password);
                    }}
                    view="sign-up"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="magic-link">
              <Card className="border-none shadow-none">
                <CardHeader className="py-6 px-0">
                  <CardTitle>Register to NextBase</CardTitle>
                  <CardDescription>
                    Create an account with magic link we will send to your email
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-0">
                  <Email
                    onSubmit={(email) => void sendMagicLink(email)}
                    isLoading={magicLinkStatus === 'sending'}
                    view="sign-up"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="social-login">
              <Card className="border-none shadow-none">
                <CardHeader className="py-6 px-0">
                  <CardTitle>Register to NextBase</CardTitle>
                  <CardDescription>
                    Register with your social account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-0">
                  <RenderProviders
                    providers={['google', 'github', 'twitter']}
                    isLoading={providerStatus === 'executing'}
                    onProviderLoginRequested={(
                      provider: Extract<
                        AuthProvider,
                        'google' | 'github' | 'twitter'
                      >
                    ) => executeProvider({ provider, next })}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
