import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Package, PackageId } from '../../lib/types'
import { SERVICES } from '../../content/site'

interface QuoteState {
  /** Visible packages, in display order (from Dashboard → Pricing) */
  packages: Package[]
  findPackage: (slug: PackageId) => Package | undefined
  packageName: (slug: PackageId) => string
  pkg: PackageId
  setPkg: (pkg: PackageId) => void
  eventType: string
  setEventType: (t: string) => void
  serviceId: string
  setServiceId: (id: string) => void
  filter: string
  setFilter: (slug: string) => void
  /** Preselect package / event type, then scroll to the quote form */
  startQuote: (opts?: { pkg?: PackageId; eventType?: string }) => void
  scrollTo: (id: string) => void
}

const QuoteCtx = createContext<QuoteState | null>(null)

export function QuoteProvider({ packages, children }: { packages: Package[]; children: ReactNode }) {
  const [pkg, setPkg] = useState<PackageId>('standard')
  const [eventType, setEventType] = useState('Nightlife / party')
  const [serviceId, setServiceId] = useState(SERVICES[0].id)
  const [filter, setFilter] = useState('')

  const findPackage = useCallback((slug: PackageId) => packages.find((p) => p.slug === slug), [packages])
  const packageName = useCallback((slug: PackageId) => findPackage(slug)?.name ?? 'Custom', [findPackage])

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const startQuote = useCallback(
    (opts?: { pkg?: PackageId; eventType?: string }) => {
      if (opts?.pkg) setPkg(opts.pkg)
      if (opts?.eventType) setEventType(opts.eventType)
      scrollTo('quote')
    },
    [scrollTo],
  )

  const value = useMemo(
    () => ({
      packages,
      findPackage,
      packageName,
      pkg,
      setPkg,
      eventType,
      setEventType,
      serviceId,
      setServiceId,
      filter,
      setFilter,
      startQuote,
      scrollTo,
    }),
    [packages, findPackage, packageName, pkg, eventType, serviceId, filter, startQuote, scrollTo],
  )
  return <QuoteCtx.Provider value={value}>{children}</QuoteCtx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useQuote(): QuoteState {
  const ctx = useContext(QuoteCtx)
  if (!ctx) throw new Error('useQuote must be used inside QuoteProvider')
  return ctx
}

/** "2 hours of filming · 3 edited reels" — used by the hero quick quote */
// eslint-disable-next-line react-refresh/only-export-components
export function packageSummary(p: Package): string {
  return [p.hours && `${p.hours} of filming`, p.reels != null && `${p.reels} edited reels`].filter(Boolean).join(' · ')
}
