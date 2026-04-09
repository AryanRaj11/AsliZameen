'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Heart, MapPin, Plus, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/favorites', label: 'Favorites', icon: Heart },
]

const sellerNavItems = [
  { href: '/dashboard/my-listings', label: 'My Listings', icon: MapPin },
  { href: '/dashboard/add-listing', label: 'Add Listing', icon: Plus },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const canSell = user?.role === 'seller' || user?.role === 'admin'

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <div className="sticky top-24 rounded-lg border border-border bg-card p-4">
            {/* User Info */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                {user.name?.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs capitalize text-muted-foreground">{user.role}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}

              {canSell && (
                <>
                  <div className="my-3 h-px bg-border" />
                  <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
                    Seller Tools
                  </p>
                  {sellerNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        pathname === item.href
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
