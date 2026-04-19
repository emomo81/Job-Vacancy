/**
 * Shared utilities for job data processing and UI styling
 */

export interface SharedJobData {
  id: string
  backendId?: string
  title: string
  company: string
  department: string
  experienceLevel: string
  education: string
  location: string
  type: string
  salary: string
  posted: string
  match: number
  tags: string[]
  requiredSkills: string[]
  minYearsExperience: number
  description: string
  niceToHave: string
}

export function normalizeEmploymentType(value: string): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
}

export function formatPostedDate(value?: string): string {
  if (!value) return 'Recently'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString()
}

export function buildInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'RC'
}

export function getTypeLabel(type: string): string {

  const normalized = normalizeEmploymentType(type)
  if (normalized === 'full-time') return 'Full-Time'
  if (normalized === 'part-time') return 'Part-Time'
  if (normalized === 'remote') return 'Remote'
  if (normalized === 'contract') return 'Contract'
  return type || 'Full-Time'
}

export function getTagTone(tag: string): string {
  const accent = tag.toLowerCase()
  if (accent.includes('react') || accent.includes('typescript')) return 'bg-[#e8f1ff] text-[#2a85ff] border-[#2a85ff]/10'
  if (accent.includes('design')) return 'bg-[#f3ebff] text-[#9f6ef5] border-[#9f6ef5]/10'
  if (accent.includes('sales')) return 'bg-[#fff3e8] text-[#f07830] border-[#f07830]/10'
  return 'bg-[#f0f5fa] text-[#5a6a7a] border-[#e2eaf2]'
}
