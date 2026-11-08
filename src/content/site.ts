import type { PackageId } from '../lib/types'

export const CONTACT = {
  email: 'contact@thekreaction.com',
  phoneDisplay: '(786) 398-2208',
  phoneTel: '+17863982208',
  whatsapp: '17863982208',
  instagram: 'https://www.instagram.com/thek.reaction',
  youtube: 'https://www.youtube.com/@cgthek.reaction',
}

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${CONTACT.whatsapp}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export interface Package {
  id: Exclude<PackageId, 'custom'>
  name: string
  price: string
  hours: string
  reels: number
  ideal: string
  popular?: boolean
}

export const PACKAGES: Package[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$300',
    hours: '1 hour',
    reels: 2,
    ideal: 'Perfect for quick projects, social highlights and product showcases.',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '$350',
    hours: '2 hours',
    reels: 3,
    ideal: 'Ideal for business promos and event highlights.',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$500',
    hours: '4 hours',
    reels: 4,
    ideal: 'Full coverage for major events and bigger stories.',
  },
]

export function packageName(id: PackageId): string {
  return PACKAGES.find((p) => p.id === id)?.name ?? 'Custom'
}

export interface Service {
  id: string
  name: string
  short: string
  desc: string
  items: string[]
  from: string
  pkg: PackageId
  /** Category slug used to filter the work grid ('' = all) */
  filter: string
  cta: string
  /** Value preselected in the quote form's event type */
  eventType: string
}

export const SERVICES: Service[] = [
  {
    id: 'nightlife',
    name: 'Nightlife & events',
    short: 'Parties, drag shows and club nights.',
    desc: 'Recaps of parties, drag shows and club nights that make people want to be at the next one.',
    items: ['Recap reels for Instagram and TikTok', 'Performers, crowd and venue moments', 'Drone on request'],
    from: 'Standard · $350',
    pkg: 'standard',
    filter: 'nightlife',
    cta: 'Quote my event',
    eventType: 'Nightlife / party',
  },
  {
    id: 'festival',
    name: 'Festivals',
    short: 'Full coverage for big stages.',
    desc: 'Full-day coverage for festivals and large events — stages, crowds and the story of the day.',
    items: ['Multi-hour coverage', 'Four edited reels', 'Aerial drone shots'],
    from: 'Premium · $500',
    pkg: 'premium',
    filter: 'festival',
    cta: 'Quote my festival',
    eventType: 'Festival',
  },
  {
    id: 'live',
    name: 'Live sets',
    short: 'DJs and artists, cut into clips.',
    desc: 'Multi-angle coverage of your set, cut into clips that grow your following.',
    items: ['Booth and crowd angles', 'Clean audio from the board', 'Clips ready for every platform'],
    from: 'Standard · $350',
    pkg: 'standard',
    filter: 'live-set',
    cta: 'Quote my set',
    eventType: 'Live set / DJ',
  },
  {
    id: 'podcast',
    name: 'Podcasts',
    short: 'Video podcasts, recorded and edited.',
    desc: 'Video podcast production: multi-camera recording, clean sound and short clips from every episode.',
    items: ['Multi-camera recording', 'Sound design and mixing', 'Shorts cut from each episode'],
    from: 'Custom quote',
    pkg: 'custom',
    filter: 'podcast',
    cta: 'Quote my podcast',
    eventType: 'Podcast',
  },
  {
    id: 'interior',
    name: 'Interior design',
    short: 'Spaces shown the way designers see them.',
    desc: 'Cinematic walkthroughs that show light, texture and detail — for designers, architects and real estate.',
    items: ['Cinematic walkthroughs', 'Detail and texture shots', 'Drone exteriors'],
    from: 'Custom quote',
    pkg: 'custom',
    filter: 'interior-design',
    cta: 'Quote my space',
    eventType: 'Interior design',
  },
  {
    id: 'brand',
    name: 'Brands & promo',
    short: 'Product and business videos.',
    desc: 'Promos and product videos for businesses that need content that sells.',
    items: ['Concept and script help', 'Product and team shots', 'Ads-ready edits'],
    from: 'Basic · $300',
    pkg: 'basic',
    filter: 'promo',
    cta: 'Quote my promo',
    eventType: 'Brand promo',
  },
]

export const EVENT_TYPES = [
  'Nightlife / party',
  'Festival',
  'Live set / DJ',
  'Podcast',
  'Interior design',
  'Brand promo',
  'Other',
]

/** Quick-quote options in the hero → recommended package */
export const PLANS: { id: string; label: string; pkg: PackageId; eventType: string }[] = [
  { id: 'party', label: 'Party / nightlife', pkg: 'standard', eventType: 'Nightlife / party' },
  { id: 'festival', label: 'Festival / big event', pkg: 'premium', eventType: 'Festival' },
  { id: 'live', label: 'Live set / DJ', pkg: 'standard', eventType: 'Live set / DJ' },
  { id: 'podcast', label: 'Podcast', pkg: 'custom', eventType: 'Podcast' },
  { id: 'interior', label: 'Interior design', pkg: 'custom', eventType: 'Interior design' },
  { id: 'brand', label: 'Brand / product', pkg: 'basic', eventType: 'Brand promo' },
]

export const PARTNERS = [
  'Palace',
  'Eliad Cohen',
  'White Party',
  'No Manors',
  'Vizion Production',
  'DJ David Alvihar',
  'Arka DJs',
]

export const TESTIMONIALS = [
  { text: 'FYI — your best work yet.', who: 'Palace Bar' },
  { text: 'Hi Chris! Love the video — there’s no changes.', who: 'The Manors' },
  { text: "It's amazing. You did an incredible job.", who: 'Eliad Cohen' },
]

export const FAQS = [
  {
    q: 'What types of video services do you offer?',
    a: 'Nightlife and event recaps, festivals, live sets, video podcasts, interior design walkthroughs, and brand promos — plus drone and behind-the-scenes content.',
  },
  {
    q: 'What are your rates for video production?',
    a: 'Packages start at $300 (Basic), $350 (Standard) and $500 (Premium). Podcasts and interior design are quoted per project. Extra hours can be added to any package.',
  },
  {
    q: 'How do we start a project with you?',
    a: 'Send the quote form or message us on WhatsApp with your date and event. We confirm availability and a fixed price.',
  },
  {
    q: 'Do you have portfolio examples I can see?',
    a: 'Yes — browse the work section and filter by the type of project you are planning.',
  },
  {
    q: 'What is the production process like?',
    a: 'Plan, film, refine: we agree on the vision, capture on site, then edit, color-grade and deliver ready-to-post reels.',
  },
  {
    q: 'Can you work with a specific budget?',
    a: 'Yes. Tell us your budget in the form and we will suggest the best coverage for it.',
  },
]

/** Default categories — mirrored in supabase/schema.sql seed */
export const DEFAULT_CATEGORIES = [
  { slug: 'nightlife', name: 'Nightlife' },
  { slug: 'drag-queens', name: 'Drag queens' },
  { slug: 'festival', name: 'Festival' },
  { slug: 'live-set', name: 'Live set' },
  { slug: 'dj', name: 'DJ' },
  { slug: 'podcast', name: 'Podcast' },
  { slug: 'interior-design', name: 'Interior design' },
  { slug: 'promo', name: 'Promo / reels' },
  { slug: 'behind-the-scenes', name: 'Behind the scenes' },
  { slug: 'real-estate', name: 'Real estate & lifestyle' },
]

/** Shown when Supabase is not configured yet, so the site never looks empty */
export const FALLBACK_PROJECTS: { title: string; client: string; cats: string[] }[] = [
  { title: 'Disco Glitter weekend at Palace Bar', client: 'Palace Bar', cats: ['nightlife'] },
  { title: 'Drag Race winner Trinity The Tuck at Palace Bar Miami', client: 'Palace Bar', cats: ['drag-queens', 'nightlife'] },
  { title: 'TS Maddison hosting at Palace Bar Miami Beach', client: 'Palace Bar', cats: ['drag-queens'] },
  { title: 'Moulin Rouge anniversary at Palace', client: 'Palace Bar', cats: ['drag-queens'] },
  { title: 'Vizion Production at Winter Party', client: 'Vizion Production', cats: ['festival'] },
  { title: 'Vizion Production Miami Beach at Winter Festival', client: 'Vizion Production', cats: ['festival'] },
  { title: 'Miami Beach Pride Month 2024', client: 'DJ Eliad Cohen', cats: ['live-set', 'dj'] },
  { title: "New Year's Eve at Palace", client: 'Palace Bar', cats: ['nightlife'] },
]
