// MetalMind AI — Formatting Utilities

/**
 * Format price with currency symbol
 */
export function formatPrice(price: number, currency: 'INR' | 'USD' = 'INR', decimals: number = 2): string {
  if (currency === 'INR') {
    return `₹${formatIndianNumber(price, decimals)}`;
  }
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

/**
 * Format number in Indian numbering system (lakhs, crores)
 */
export function formatIndianNumber(num: number, decimals: number = 2): string {
  const fixed = num.toFixed(decimals);
  const [integer, decimal] = fixed.split('.');
  
  // Indian grouping: last 3 digits, then groups of 2
  const lastThree = integer.slice(-3);
  const remaining = integer.slice(0, -3);
  
  let formatted = lastThree;
  if (remaining.length > 0) {
    formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }
  
  return decimal ? `${formatted}.${decimal}` : formatted;
}

/**
 * Format percentage with sign and color hint
 */
export function formatPercent(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with abbreviations
 */
export function formatCompactNumber(num: number): string {
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toFixed(2)}`;
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format time for display
 */
export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "5 min ago")
 */
export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

/**
 * Format recommendation for display
 */
export function formatRecommendation(rec: string): string {
  return rec.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * Get trend emoji
 */
export function getTrendEmoji(trend: 'bullish' | 'bearish' | 'neutral'): string {
  switch (trend) {
    case 'bullish': return '▲';
    case 'bearish': return '▼';
    default: return '●';
  }
}
