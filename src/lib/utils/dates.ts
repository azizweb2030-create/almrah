import { addDays, differenceInDays, differenceInMonths, format } from 'date-fns'
import { ar } from 'date-fns/locale'

export const MATING_DELAY = 15
export const PREGNANCY_DAYS = 150

export function formatArabicDate(d: string | Date) {
  return format(new Date(d), 'dd MMMM yyyy', { locale: ar })
}
export function formatShortDate(d: string | Date) {
  return format(new Date(d), 'dd/MM/yyyy')
}
export function getMatingDate(birthDate: string | Date) {
  return addDays(new Date(birthDate), MATING_DELAY)
}
export function getExpectedBirthDate(matingDate: string | Date) {
  return addDays(new Date(matingDate), PREGNANCY_DAYS)
}
export function getAnimalStage(birthDate: string | Date) {
  const m = differenceInMonths(new Date(), new Date(birthDate))
  if (m < 3) return 'بهم'
  if (m < 7) return 'مفطوم'
  return 'جاهز'
}
export function daysUntil(d: string | Date) {
  return differenceInDays(new Date(d), new Date())
}
export function daysAgo(d: string | Date) {
  return differenceInDays(new Date(), new Date(d))
}
export function isExpiringSoon(d: string | Date, days = 7) {
  const left = daysUntil(d)
  return left >= 0 && left <= days
}
