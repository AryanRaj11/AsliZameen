import Link from 'next/link'
import { MapPin } from 'lucide-react'

const footerLinks = {
  browse: [
    { label: 'All Listings', href: '/listings' },
    { label: 'Agricultural Land', href: '/listings?type=agricultural' },
    { label: 'Residential Plots', href: '/listings?type=residential' },
    { label: 'Commercial Land', href: '/listings?type=commercial' },
  ],
  sellers: [
    { label: 'List Your Property', href: '/dashboard/add-listing' },
    { label: 'Seller Dashboard', href: '/dashboard' },
    { label: 'My Listings', href: '/dashboard/my-listings' },
  ],
  company: [
    { label: 'About Us', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <MapPin className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">AsliZameen</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Your trusted marketplace for buying and selling land.Sp Find your perfect plot or list your property with ease.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Browse Land</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.browse.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sellers */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">For Sellers</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.sellers.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Company</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} AsliZameen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
