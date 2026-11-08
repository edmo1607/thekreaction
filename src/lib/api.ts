import { supabase, MEDIA_BUCKET } from './supabase'
import type { Category, Lead, LeadStatus, Package, Project, ProjectStatus } from './types'
import { DEFAULT_CATEGORIES, FALLBACK_PACKAGES, FALLBACK_PROJECTS } from '../content/site'

const PROJECT_SELECT =
  'id,title,client,description,song,event_date,cover_path,video_path,video_url,featured,status,sort,created_at,project_categories(categories(id,name,slug,sort))'

interface ProjectRow extends Omit<Project, 'categories'> {
  project_categories: { categories: Category | null }[] | null
}

function toProject(row: ProjectRow): Project {
  const { project_categories, ...rest } = row
  return {
    ...rest,
    categories: (project_categories ?? [])
      .map((pc) => pc.categories)
      .filter((c): c is Category => c !== null)
      .sort((a, b) => a.sort - b.sort),
  }
}

function fallbackCategories(): Category[] {
  return DEFAULT_CATEGORIES.map((c, i) => ({ id: c.slug, name: c.name, slug: c.slug, sort: i }))
}

function fallbackProjects(): Project[] {
  const cats = fallbackCategories()
  return FALLBACK_PROJECTS.map((p, i) => ({
    id: `fallback-${i}`,
    title: p.title,
    client: p.client,
    description: null,
    song: null,
    event_date: null,
    cover_path: null,
    video_path: null,
    video_url: null,
    featured: i === 0,
    status: 'published',
    sort: i,
    created_at: '',
    categories: cats.filter((c) => p.cats.includes(c.slug)),
  }))
}

// ---------- Public ----------

export async function fetchPublishedProjects(): Promise<Project[]> {
  if (!supabase) return fallbackProjects()
  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('sort', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as unknown as ProjectRow[]).map(toProject)
}

export async function fetchCategories(): Promise<Category[]> {
  if (!supabase) return fallbackCategories()
  const { data, error } = await supabase
    .from('categories')
    .select('id,name,slug,sort')
    .order('sort', { ascending: true })
  if (error) throw error
  return data as Category[]
}

export interface LeadInput {
  name: string
  email: string
  phone: string
  event_type: string
  event_date: string
  package: string
  message: string
}

/** Returns false when Supabase is not configured (caller falls back to WhatsApp). */
export async function submitLead(input: LeadInput): Promise<boolean> {
  if (!supabase) return false
  const { error } = await supabase.from('leads').insert({
    name: input.name.trim(),
    email: input.email.trim() || null,
    phone: input.phone.trim() || null,
    event_type: input.event_type || null,
    event_date: input.event_date || null,
    package: input.package || null,
    message: input.message.trim() || null,
  })
  if (error) throw error
  return true
}

// ---------- Admin ----------

function requireClient() {
  if (!supabase) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  return supabase
}

export async function fetchAllProjects(): Promise<Project[]> {
  const db = requireClient()
  const { data, error } = await db
    .from('projects')
    .select(PROJECT_SELECT)
    .order('featured', { ascending: false })
    .order('sort', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as unknown as ProjectRow[]).map(toProject)
}

export interface ProjectInput {
  title: string
  client: string
  description: string
  song: string
  event_date: string
  cover_path: string | null
  video_path: string | null
  video_url: string
  featured: boolean
  status: ProjectStatus
  categoryIds: string[]
}

export async function saveProject(id: string | null, input: ProjectInput): Promise<string> {
  const db = requireClient()
  const row = {
    title: input.title.trim(),
    client: input.client.trim() || null,
    description: input.description.trim() || null,
    song: input.song.trim() || null,
    event_date: input.event_date || null,
    cover_path: input.cover_path,
    video_path: input.video_path,
    video_url: input.video_url.trim() || null,
    featured: input.featured,
    status: input.status,
  }
  let projectId = id
  if (projectId) {
    const { error } = await db.from('projects').update(row).eq('id', projectId)
    if (error) throw error
  } else {
    const { data, error } = await db.from('projects').insert(row).select('id').single()
    if (error) throw error
    projectId = (data as { id: string }).id
  }

  const { error: delError } = await db.from('project_categories').delete().eq('project_id', projectId)
  if (delError) throw delError
  if (input.categoryIds.length) {
    const { error: insError } = await db
      .from('project_categories')
      .insert(input.categoryIds.map((category_id) => ({ project_id: projectId, category_id })))
    if (insError) throw insError
  }
  return projectId
}

export async function deleteProject(project: Project): Promise<void> {
  const db = requireClient()
  const { error } = await db.from('projects').delete().eq('id', project.id)
  if (error) throw error
  const paths = [project.cover_path, project.video_path].filter(
    (p): p is string => !!p && !/^https?:\/\//.test(p),
  )
  if (paths.length) await db.storage.from(MEDIA_BUCKET).remove(paths)
}

export async function uploadMedia(file: File, folder: 'covers' | 'videos'): Promise<string> {
  const db = requireClient()
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const path = `${folder}/${crypto.randomUUID()}.${ext}`
  const { error } = await db.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: '31536000', contentType: file.type, upsert: false })
  if (error) throw error
  return path
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function createCategory(name: string, sort: number): Promise<Category> {
  const db = requireClient()
  const { data, error } = await db
    .from('categories')
    .insert({ name: name.trim(), slug: slugify(name), sort })
    .select('id,name,slug,sort')
    .single()
  if (error) throw error
  return data as Category
}

export async function renameCategory(id: string, name: string): Promise<void> {
  const db = requireClient()
  const { error } = await db.from('categories').update({ name: name.trim() }).eq('id', id)
  if (error) throw error
}

export async function deleteCategory(id: string): Promise<void> {
  const db = requireClient()
  const { error } = await db.from('categories').delete().eq('id', id)
  if (error) throw error
}

export async function fetchLeads(): Promise<Lead[]> {
  const db = requireClient()
  const { data, error } = await db.from('leads').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data as Lead[]
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  const db = requireClient()
  const { error } = await db.from('leads').update({ status }).eq('id', id)
  if (error) throw error
}

// ---------- Packages (pricing) ----------

const PACKAGE_SELECT = 'id,slug,name,price,hours,reels,reel_length,ideal,features,popular,visible,sort'

function fallbackPackages(): Package[] {
  return FALLBACK_PACKAGES.filter((p) => p.visible)
}

/** Visible packages for the website. Falls back to built-in prices so pricing never disappears. */
export async function fetchPackages(): Promise<Package[]> {
  if (!supabase) return fallbackPackages()
  const { data, error } = await supabase
    .from('packages')
    .select(PACKAGE_SELECT)
    .eq('visible', true)
    .order('sort', { ascending: true })
  if (error) {
    console.warn('Packages not available yet, using built-in prices:', error.message)
    return fallbackPackages()
  }
  return data as Package[]
}

export async function fetchAllPackages(): Promise<Package[]> {
  const db = requireClient()
  const { data, error } = await db.from('packages').select(PACKAGE_SELECT).order('sort', { ascending: true })
  if (error) throw error
  return data as Package[]
}

export type PackageInput = Omit<Package, 'id' | 'slug' | 'sort'>

function cleanPackage(input: PackageInput) {
  return {
    name: input.name.trim(),
    price: input.price.trim(),
    hours: input.hours?.trim() || null,
    reels: input.reels ?? null,
    reel_length: input.reel_length?.trim() || null,
    ideal: input.ideal?.trim() || null,
    features: input.features.map((f) => f.trim()).filter(Boolean),
    popular: input.popular,
    visible: input.visible,
  }
}

export async function createPackage(input: PackageInput, existing: Package[]): Promise<Package> {
  const db = requireClient()
  const base = slugify(input.name) || 'package'
  const taken = new Set(existing.map((p) => p.slug))
  let slug = base
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`
  const sort = Math.max(0, ...existing.map((p) => p.sort)) + 1
  const { data, error } = await db
    .from('packages')
    .insert({ ...cleanPackage(input), slug, sort })
    .select(PACKAGE_SELECT)
    .single()
  if (error) throw error
  return data as Package
}

export async function updatePackage(id: string, input: PackageInput): Promise<void> {
  const db = requireClient()
  const { error } = await db.from('packages').update(cleanPackage(input)).eq('id', id)
  if (error) throw error
}

export async function deletePackage(id: string): Promise<void> {
  const db = requireClient()
  const { error } = await db.from('packages').delete().eq('id', id)
  if (error) throw error
}

/** Swap the display order of two packages. */
export async function swapPackageOrder(a: Package, b: Package): Promise<void> {
  const db = requireClient()
  const first = await db.from('packages').update({ sort: b.sort }).eq('id', a.id)
  if (first.error) throw first.error
  const second = await db.from('packages').update({ sort: a.sort }).eq('id', b.id)
  if (second.error) throw second.error
}
