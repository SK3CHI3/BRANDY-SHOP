// Date utility functions for BRANDY-SHOP
// Provides consistent date formatting across the application

/**
 * Get the current year
 */
export const getCurrentYear = (): number => {
  return new Date().getFullYear()
}

/**
 * Get the current date in ISO format (YYYY-MM-DD)
 */
export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get the current date and time in ISO format
 */
export const getCurrentDateTime = (): string => {
  return new Date().toISOString()
}

/**
 * Get a date X days ago in ISO format (YYYY-MM-DD)
 */
export const getDaysAgo = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

/**
 * Get a date X months ago in ISO format (YYYY-MM-DD)
 */
export const getMonthsAgo = (months: number): string => {
  const date = new Date()
  date.setMonth(date.getMonth() - months)
  return date.toISOString().split('T')[0]
}

/**
 * Format a date for display (e.g., "January 28, 2025")
 */
export const formatDisplayDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Format a date for sitemap (YYYY-MM-DD)
 */
export const formatSitemapDate = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0]
}

/**
 * Get copyright year string (e.g., "2025" or "2024-2025" if started in previous year)
 */
export const getCopyrightYear = (startYear?: number): string => {
  const currentYear = getCurrentYear()
  
  if (!startYear || startYear >= currentYear) {
    return currentYear.toString()
  }
  
  return `${startYear}-${currentYear}`
}

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 */
export const getRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'just now'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`
  }
  
  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`
}

/**
 * Check if a date is today
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  
  return dateObj.toDateString() === today.toDateString()
}

/**
 * Check if a date is within the last N days
 */
export const isWithinDays = (date: Date | string, days: number): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  
  return dateObj >= cutoff
}

/**
 * Get the start and end of the current month
 */
export const getCurrentMonthRange = (): { start: Date; end: Date } => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  
  return { start, end }
}

/**
 * Get the start and end of the current week
 */
export const getCurrentWeekRange = (): { start: Date; end: Date } => {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(start)
  end.setDate(start.getDate() + 6) // End of week (Saturday)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
}
