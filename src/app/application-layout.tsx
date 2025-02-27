'use client'

import { Avatar } from '@/components/avatar'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/dropdown'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/navbar'
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from '@/components/sidebar'
import { SidebarLayout } from '@/components/sidebar-layout'
import { getEvents } from '@/data'
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/16/solid'
import {
  Cog6ToothIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  Square2StackIcon,
  TicketIcon,
} from '@heroicons/react/20/solid'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/button'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabaseClient } from '@/utils/supabase/client'
import { Session } from '@supabase/supabase-js'

function AccountDropdownMenu({ anchor, onSignOut }: { anchor: 'top start' | 'bottom end', onSignOut: () => void }) {
  return (
    <DropdownMenu className="min-w-64" anchor={anchor}>
      <DropdownItem href="/profile">
        <UserCircleIcon />
        <DropdownLabel>My account</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem href="#">
        <ShieldCheckIcon />
        <DropdownLabel>Privacy policy</DropdownLabel>
      </DropdownItem>
      <DropdownItem href="#">
        <LightBulbIcon />
        <DropdownLabel>Share feedback</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem onClick={onSignOut}>
        <ArrowRightStartOnRectangleIcon />
        <DropdownLabel>Sign out</DropdownLabel>
      </DropdownItem>
    </DropdownMenu>
  )
}

export function ApplicationLayout({
  events,
  children,
}: {
  events: Awaited<ReturnType<typeof getEvents>>
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Get Supabase session
  useEffect(() => {
    async function getSession() {
      setLoading(true)
      const { data: { session }, error } = await supabaseClient.auth.getSession()
      if (error) {
        console.error('Error fetching session:', error.message)
      }
      setSession(session)
      setLoading(false)

      // Set up auth state listener
      const {
        data: { subscription },
      } = supabaseClient.auth.onAuthStateChange((_event: string, session: Session | null) => {
        setSession(session)
      })

      return () => subscription.unsubscribe()
    }

    getSession()
  }, [])

  // Handle sign out
  const handleSignOut = async () => {
    const { error } = await supabaseClient.auth.signOut()
    if (error) {
      console.error('Error signing out:', error.message)
    }
  }

  const userIsAuthenticated = !!session?.user

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            {userIsAuthenticated ? (
              <Dropdown>
                <DropdownButton as={NavbarItem}>
                  <Avatar
                    src={session.user?.user_metadata?.avatar_url || null}
                    square
                    initials={session.user?.email?.[0]?.toUpperCase() || 'U'}
                  />
                </DropdownButton>
                <AccountDropdownMenu anchor="bottom end" onSignOut={handleSignOut} />
              </Dropdown>
            ) : (
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            )}
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <Avatar src="/teams/catalyst.svg" />
                <SidebarLabel>LogoToAnything</SidebarLabel>
                <ChevronDownIcon />
              </DropdownButton>
              <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
                <DropdownItem href="/settings">
                  <Cog8ToothIcon />
                  <DropdownLabel>Settings</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="#">
                  <Avatar slot="icon" src="/teams/catalyst.svg" />
                  <DropdownLabel>LogoToAnything</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="#">
                  <Avatar slot="icon" initials="BE" className="bg-purple-500 text-white" />
                  <DropdownLabel>Big Events</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="#">
                  <PlusIcon />
                  <DropdownLabel>New team&hellip;</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/" current={pathname === '/'}>
                <HomeIcon />
                <SidebarLabel>Home</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/generations" current={pathname.startsWith('/generations')}>
                <Square2StackIcon />
                <SidebarLabel>Generations</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/credits" current={pathname.startsWith('/credits')}>
                <TicketIcon />
                <SidebarLabel>Credits</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/settings" current={pathname.startsWith('/settings')}>
                <Cog6ToothIcon />
                <SidebarLabel>Settings</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarSection className="max-lg:hidden">
              <SidebarHeading>Recent Generations</SidebarHeading>
              {events.map((event) => (
                <SidebarItem key={event.id} href={event.url}>
                  {event.name}
                </SidebarItem>
              ))}
            </SidebarSection>

            <SidebarSpacer />

            <SidebarSection>
              <SidebarItem href="#">
                <QuestionMarkCircleIcon />
                <SidebarLabel>Support</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="#">
                <SparklesIcon />
                <SidebarLabel>Changelog</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>

          <SidebarFooter className="max-lg:hidden">
            {userIsAuthenticated ? (
              <Dropdown>
                <DropdownButton as={SidebarItem}>
                  <span className="flex min-w-0 items-center gap-3">
                    <Avatar 
                      src={session.user?.user_metadata?.avatar_url || null}
                      className="size-10" 
                      square 
                      alt="" 
                      initials={session.user?.email?.[0]?.toUpperCase() || 'U'}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                        {session.user?.user_metadata?.full_name || session.user?.email || 'User'}
                      </span>
                      <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                        {session.user?.email || ''}
                      </span>
                    </span>
                  </span>
                  <ChevronUpIcon />
                </DropdownButton>
                <AccountDropdownMenu anchor="top start" onSignOut={handleSignOut} />
              </Dropdown>
            ) : (
              <SidebarItem href="/login">
                <UserCircleIcon />
                <SidebarLabel>Sign In</SidebarLabel>
              </SidebarItem>
            )}
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  )
}
