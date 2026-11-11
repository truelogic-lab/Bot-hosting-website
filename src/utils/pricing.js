/**
 * Warren-XMD — Kenyan Shilling (KSH) Pricing
 * Base prices in KES.
 */

export const BASE_PRICES_KES = { starter: 20, pro: 60, elite: 100 };

/**
 * Supported countries for the Deploy Bot pairing form.
 * (No FX rates — pricing is KSH only across the whole app.)
 */
export const COUNTRIES = [
  { code: 'KE', name: 'Kenya',         flag: '🇰🇪', dial: '254' },
  { code: 'NG', name: 'Nigeria',       flag: '🇳🇬', dial: '234' },
  { code: 'ZA', name: 'South Africa',  flag: '🇿🇦', dial: '27'  },
  { code: 'TZ', name: 'Tanzania',      flag: '🇹🇿', dial: '255' },
  { code: 'UG', name: 'Uganda',        flag: '🇺🇬', dial: '256' },
  { code: 'GH', name: 'Ghana',         flag: '🇬🇭', dial: '233' },
  { code: 'EG', name: 'Egypt',         flag: '🇪🇬', dial: '20'  },
  { code: 'RW', name: 'Rwanda',        flag: '🇷🇼', dial: '250' },
  { code: 'ZM', name: 'Zambia',        flag: '🇿🇲', dial: '260' },
  { code: 'ET', name: 'Ethiopia',      flag: '🇪🇹', dial: '251' },
  { code: 'MA', name: 'Morocco',       flag: '🇲🇦', dial: '212' },
];

export function detectDefaultCountry() {
  if (typeof navigator === 'undefined') return 'KE';
  const lang = navigator.language || 'en-KE';
  const region = (lang.split('-')[1] || 'KE').toUpperCase();
  return COUNTRIES.find(c => c.code === region)?.code || 'KE';
}

export function formatPrice(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return '—';
  try {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('KES', 'KSh');
  } catch {
    return `KSh ${Math.round(amount)}`;
  }
}
