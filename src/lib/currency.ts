'use client';

/**
 * Formats a number as Argentinian Pesos (ARS).
 * This function should only be used in client components to avoid hydration mismatch errors.
 *
 * @param n - The number to format.
 * @returns A string representing the formatted currency value.
 */
export function formatArs(n: number): string {
  if (typeof n !== 'number') {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(0);
  }
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(n);
}
