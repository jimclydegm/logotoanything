'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get the callback URL from the query parameters
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    
    // Redirect to the callback URL or home page
    router.push(callbackUrl);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-800/70">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-white">Signing you in...</h2>
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-zinc-300 border-t-blue-600 dark:border-zinc-700 dark:border-t-blue-500"></div>
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">Please wait while we complete the authentication process</p>
        </div>
      </div>
    </div>
  );
} 