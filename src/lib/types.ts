export type ProjectStatus = 'draft' | 'published'

export interface Category {
  id: string
  name: string
  slug: string
  sort: number
}

export interface Project {
  id: string
  title: string
  client: string | null
  description: string | null
  song: string | null
  event_date: string | null
  cover_path: string | null
  video_path: string | null
  video_url: string | null
  featured: boolean
  status: ProjectStatus
  sort: number
  created_at: string
  categories: Category[]
}

export type LeadStatus = 'new' | 'contacted' | 'booked' | 'lost'

export interface Lead {
  id: string
  name: string
  email: string | null
  phone: string | null
  event_type: string | null
  event_date: string | null
  package: string | null
  message: string | null
  status: LeadStatus
  created_at: string
}

/** A package slug (e.g. "standard"), or "custom" for a tailored quote */
export type PackageId = string

export interface Package {
  id: string
  slug: string
  name: string
  price: string
  hours: string | null
  reels: number | null
  reel_length: string | null
  ideal: string | null
  features: string[]
  popular: boolean
  visible: boolean
  sort: number
}
