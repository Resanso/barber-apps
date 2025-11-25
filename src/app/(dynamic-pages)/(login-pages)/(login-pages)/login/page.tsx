import Image from 'next/image';
import { Suspense } from 'react';
import { z } from 'zod';
import { Login } from './Login';

const SearchParamsSchema = z.object({
  next: z.string().optional(),
  nextActionType: z.string().optional(),
});

async function LoginWrapper(props: {
  searchParams: Promise<unknown>;
}) {
  const searchParams = await props.searchParams;
  const { next, nextActionType } = SearchParamsSchema.parse(searchParams);
  return <Login next={next} nextActionType={nextActionType} />;
}

export default async function LoginPage(props: {
  searchParams: Promise<unknown>;
}) {
  return (
    <div className="min-h-screen ">
      {/* logo fixed to top-left of page */}
      <div className="fixed top-8 left-8 z-50">
        <Image src="/logos/barber-logo.png" alt="Barber Logo" width={100} height={100} className="rounded-md bg-black" />
      </div>

      <main className="min-h-screen flex items-center justify-center">
        <Suspense>
          <LoginWrapper searchParams={props.searchParams} />
        </Suspense>
      </main>
    </div>
  );
}
