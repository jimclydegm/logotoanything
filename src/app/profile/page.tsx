'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import Link from 'next/link';
import { supabaseClient } from '@/utils/supabase/client';
import { Session } from '@supabase/supabase-js';

export default function ProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSession() {
      setLoading(true);
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error.message);
      }
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      setSession(session);
      setLoading(false);

      // Set up auth state listener
      const {
        data: { subscription },
      } = supabaseClient.auth.onAuthStateChange((_event: string, session: Session | null) => {
        if (!session) {
          router.push('/login');
        } else {
          setSession(session);
        }
      });

      return () => subscription.unsubscribe();
    }

    getSession();
  }, [router]);

  const handleSignOut = async () => {
    await supabaseClient.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-800/70">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-white">Loading profile...</h2>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-zinc-300 border-t-blue-600 dark:border-zinc-700 dark:border-t-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // This will be handled by the useEffect
  }

  const user = session.user;
  const userMeta = user.user_metadata || {};

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-800/90">
        <div className="px-4 py-6 sm:px-6">
          <div className="flex items-center gap-6">
            <Avatar
              src={userMeta.avatar_url || null}
              className="size-24"
              square
              initials={user.email?.[0]?.toUpperCase() || 'U'}
            />
            <div>
              <h3 className="text-2xl font-bold leading-tight text-zinc-900 dark:text-white">
                {userMeta.full_name || userMeta.name || user.email || 'User'}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
                {user.email || ''}
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-200 dark:border-zinc-700">
          <dl>
            <div className="bg-zinc-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 dark:bg-zinc-800/50">
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Full name</dt>
              <dd className="mt-1 text-sm text-zinc-900 sm:col-span-2 sm:mt-0 dark:text-white">
                {userMeta.full_name || userMeta.name || 'Not provided'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 dark:bg-zinc-800">
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Email address</dt>
              <dd className="mt-1 text-sm text-zinc-900 sm:col-span-2 sm:mt-0 dark:text-white">
                {user.email || 'Not provided'}
              </dd>
            </div>
            <div className="bg-zinc-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 dark:bg-zinc-800/50">
              <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">User ID</dt>
              <dd className="mt-1 text-sm text-zinc-900 sm:col-span-2 sm:mt-0 dark:text-white">
                {user.id || 'Not available'}
              </dd>
            </div>
            {userMeta.provider && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 dark:bg-zinc-800">
                <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Sign-in provider</dt>
                <dd className="mt-1 text-sm text-zinc-900 sm:col-span-2 sm:mt-0 dark:text-white capitalize">
                  {userMeta.provider}
                </dd>
              </div>
            )}
          </dl>
        </div>
        <div className="flex justify-between border-t border-zinc-200 px-4 py-5 dark:border-zinc-700">
          <Button onClick={() => router.push('/')} className="bg-white border border-zinc-300 text-zinc-900 hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-700/70">
            Back to Home
          </Button>
          <Button 
            onClick={handleSignOut}
            className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
} 