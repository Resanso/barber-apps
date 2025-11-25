'use client';
import { Email } from '@/components/Auth/Email';
import { EmailAndPassword } from '@/components/Auth/EmailAndPassword';
import { EmailConfirmationPendingCard } from '@/components/Auth/EmailConfirmationPendingCard';
import { RedirectingPleaseWaitCard } from '@/components/Auth/RedirectingPleaseWaitCard';
import { RenderProviders } from '@/components/Auth/RenderProviders';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { signInWithProviderAction } from '@/data/auth/auth';
import { ArrowLeftIcon } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export function Login({
  next,
  nextActionType,
}: {
  next?: string;
  nextActionType?: string;
}) {
  const [emailSentSuccessMessage, setEmailSentSuccessMessage] = useState<
    string | null
  >(null);
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  const toastRef = useRef<string | number | undefined>(undefined);

  const router = useRouter();

  async function redirectToDashboard() {
    if (next) {
      router.push(`/auth/callback?next=${next}`);
      return;
    }

    // After a successful password sign-in we expect a session cookie to be
    // present. Ask the server what the current user's role is and redirect
    // barbers to a dedicated dashboard.
    try {
      const res = await fetch('/api/auth/role', { method: 'GET', credentials: 'same-origin' });
      if (res.ok) {
        const payload = await res.json();
        if (payload?.role === 'barber') {
          router.push('/dashboard/barber');
          return;
        }
      }
    } catch (e) {
      console.warn('redirectToDashboard: role check failed', e);
    }

    router.push('/dashboard');
  }

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
      setEmailSentSuccessMessage('A magic link has been sent to your email!');
    } catch (err: any) {
      toast.error(err?.message ?? String(err), { id: toastRef.current });
      toastRef.current = undefined;
    } finally {
      setMagicLinkStatus('idle');
    }
  }

  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'submitting'>('idle');

  async function signInPassword(email: string, password: string) {
    try {
      setPasswordStatus('submitting');
      toastRef.current = toast.loading('Logging in...');
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error ?? 'Sign in failed');
      toast.success('Logged in!', { id: toastRef.current });
      toastRef.current = undefined;
      redirectToDashboard();
      setRedirectInProgress(true);
    } catch (err: any) {
      toast.error(err?.message ?? String(err), { id: toastRef.current });
      toastRef.current = undefined;
    } finally {
      setPasswordStatus('idle');
    }
  }

  const { execute: executeProvider, status: providerStatus } = useAction(
    signInWithProviderAction,
    {
      onExecute: () => {
        toastRef.current = toast.loading('Requesting login...');
      },
      onSuccess: (payload) => {
        toast.success('Redirecting...', {
          id: toastRef.current,
        });
        toastRef.current = undefined;
        window.location.href = payload.data?.url || '/';
      },
      onError: () => {
        toast.error('Failed to login', {
          id: toastRef.current,
        });
        toastRef.current = undefined;
      },
    }
  );

  return (
    <div
      data-success={emailSentSuccessMessage}
      className="container data-success:flex items-center data-success:justify-center text-left max-w-lg mx-auto overflow-auto data-success:h-full min-h-[470px]"
    >
      <div className="mb-4">
        <Button variant="ghost" onClick={() => router.push('/')}>
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
      {emailSentSuccessMessage ? (
        <EmailConfirmationPendingCard
          type={'login'}
          heading={'Confirmation Link Sent'}
          message={emailSentSuccessMessage}
          resetSuccessMessage={setEmailSentSuccessMessage}
        />
      ) : redirectInProgress ? (
        <RedirectingPleaseWaitCard
          message="Please wait while we redirect you to your dashboard."
          heading="Redirecting to Dashboard"
        />
      ) : (
        <div className="space-y-8 bg-background p-6 rounded-lg shadow-sm dark:border">
          <Tabs defaultValue="password" className="md:min-w-[400px]">
            <TabsContent value="password">
              <Card className="border-none shadow-xl bg-emerald-50 p-6">
                <CardHeader className="py-6 px-0">
                  <CardTitle>Login to Trich Barberspace</CardTitle>
                  <CardDescription>
                    Login with the account you used to signup.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-0">
                  <EmailAndPassword
                    isLoading={passwordStatus === 'submitting'}
                    onSubmit={(data) => {
                      void signInPassword(data.email, data.password);
                    }}
                    view="sign-in"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="magic-link">
              <Card className="border-none shadow-none">
                <CardHeader className="py-6 px-0">
                  <CardTitle>Login to NextBase</CardTitle>
                  <CardDescription>
                    Login with magic link we will send to your email.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-0">
                  <Email
                    onSubmit={(email) => void sendMagicLink(email)}
                    isLoading={magicLinkStatus === 'sending'}
                    view="sign-in"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="social-login">
              <Card className="border-none shadow-none">
                <CardHeader className="py-6 px-0">
                  <CardTitle>Login to NextBase</CardTitle>
                  <CardDescription>
                    Login with your social account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 p-0">
                  <RenderProviders
                    providers={['google', 'github', 'twitter']}
                    isLoading={providerStatus === 'executing'}
                    onProviderLoginRequested={(
                      provider: 'google' | 'github' | 'twitter'
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
