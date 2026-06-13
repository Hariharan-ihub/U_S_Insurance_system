import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

// ============================================
// Date Formatters
// ============================================

/**
 * Format an ISO date string to a human-readable date.
 * e.g., "January 15, 2025"
 */
export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return 'N/A';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return 'N/A';
    return format(date, 'MMMM d, yyyy');
  } catch {
    return 'N/A';
  }
}

/**
 * Format an ISO date string to a short date.
 * e.g., "Jan 15, 2025"
 */
export function formatDateShort(dateStr: string | undefined | null): string {
  if (!dateStr) return 'N/A';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return 'N/A';
    return format(date, 'MMM d, yyyy');
  } catch {
    return 'N/A';
  }
}

/**
 * Format an ISO date string to relative time.
 * e.g., "3 hours ago"
 */
export function formatRelativeTime(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return '';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return '';
  }
}

/**
 * Format a time from an ISO date string.
 * e.g., "2:30 PM"
 */
export function formatTime(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return '';
    return format(date, 'h:mm a');
  } catch {
    return '';
  }
}

// ============================================
// Currency Formatters
// ============================================

/**
 * Format a number as USD currency.
 * e.g., 1234.56 → "$1,234.56"
 */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ============================================
// PHI Masking Formatters
// ============================================

/**
 * Mask an SSN to show only last 4 digits.
 * e.g., "1234" → "***-**-1234"
 */
export function maskSSN(ssn: string | undefined | null): string {
  if (!ssn) return '***-**-****';
  const last4 = ssn.slice(-4);
  return `***-**-${last4}`;
}

/**
 * Mask a phone number to show only last 4 digits.
 * e.g., "(206) 221-1828" → "***-***-1828"
 */
export function maskPhone(phone: string | undefined | null): string {
  if (!phone) return '***-***-****';
  const digits = phone.replace(/\D/g, '');
  const last4 = digits.slice(-4);
  return `***-***-${last4}`;
}

/**
 * Mask a DOB to show only year.
 * e.g., "1983-12-07" → "****-**-07"
 */
export function maskDOB(dob: string | undefined | null): string {
  if (!dob) return '****-**-**';
  const parts = dob.split('-');
  if (parts.length === 3) {
    return `****-**-${parts[2]}`;
  }
  return '****-**-**';
}

// ============================================
// Status Formatters
// ============================================

/**
 * Capitalize and format a status string.
 * e.g., "in_review" → "In Review"
 */
export function formatStatus(status: string | undefined | null): string {
  if (!status) return 'Unknown';
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Calculate deductible percentage used.
 */
export function deductiblePercent(used: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.round((used / total) * 100), 100);
}
