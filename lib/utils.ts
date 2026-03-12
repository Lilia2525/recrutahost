import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'
import { es } from 'date-fns/locale'
import { CandidateStage, CandidateSource, PositionType } from './types'
import { KANBAN_STAGES, POSITION_TYPE_LABELS, SOURCE_LABELS } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) return 'Hoy'
  if (isYesterday(date)) return 'Ayer'
  return format(date, "d 'de' MMM", { locale: es })
}

export function formatRelativeDate(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: es })
}

export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), "d MMM yyyy, HH:mm", { locale: es })
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function getStageInfo(stage: CandidateStage) {
  return KANBAN_STAGES.find((s) => s.id === stage) ?? KANBAN_STAGES[0]
}

export function getStageLabel(stage: CandidateStage): string {
  return getStageInfo(stage).title
}

export function getPositionLabel(position: PositionType): string {
  return POSITION_TYPE_LABELS[position]
}

export function getSourceLabel(source: CandidateSource): string {
  return SOURCE_LABELS[source]
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function sanitizeHtml(html: string): string {
  // Basic XSS sanitization — removes script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '')
    .replace(/javascript:/gi, '')
}

export function extractEmailText(emailBody: string): string {
  // Strip HTML tags from email body for plain text
  return emailBody.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function buildFormUrl(offerId: string, baseUrl: string): string {
  return `${baseUrl}/aplicar/${offerId}`
}

export function interpolateTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    if (!result[groupKey]) result[groupKey] = []
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

export function parseFormDataToObject(formData: FormData): Record<string, string> {
  const obj: Record<string, string> = {}
  formData.forEach((value, key) => {
    obj[key] = String(value)
  })
  return obj
}
