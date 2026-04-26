/**
 * Normalizes text for keyword matching by:
 * 1. Lowercasing
 * 2. Converting Turkish-specific characters to English equivalents
 * 3. Trimming extra spaces and punctuation
 */
export function normalizeTurkishText(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .trim()
    // Normalizing Turkish characters
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    // Punctuation removal (optional but good for clean matching)
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    // Normalize repeated whitespace
    .replace(/\s+/g, ' ')
    .trim();
}
