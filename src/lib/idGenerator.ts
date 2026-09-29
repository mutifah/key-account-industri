import { PelangganIndustri } from '../types';

/**
 * Auto-generates sequential Customer ID (e.g. AETRA-IND-001, AETRA-IND-002, ...)
 * based on highest existing numerical sequence.
 */
export function getNextCustomerId(pelangganList: (PelangganIndustri | string)[]): string {
  let maxNum = 0;
  let detectedPrefix = 'AETRA-IND-';

  pelangganList.forEach((item) => {
    const id = typeof item === 'string' ? item : item?.id_pelanggan;
    if (!id) return;

    // Check if ID matches prefix + digits, e.g. AETRA-IND-005 or IND-005
    const prefixMatch = id.match(/^(.*?)(\d+)$/);
    if (prefixMatch) {
      const prefix = prefixMatch[1];
      const num = parseInt(prefixMatch[2], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
        if (prefix) detectedPrefix = prefix;
      }
    } else {
      // Fallback: extract any digits
      const digits = id.match(/\d+/g);
      if (digits) {
        const lastDigits = digits[digits.length - 1];
        const num = parseInt(lastDigits, 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
  });

  const nextNum = maxNum > 0 ? maxNum + 1 : (pelangganList.length + 1);
  return `${detectedPrefix}${String(nextNum).padStart(3, '0')}`;
}
