/**
 * @file product.constants.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-06-19
 * @Description
 *   Centrale constanten voor het productdomein. Dit bestand is de "Single Source of Truth"
 *   voor data zoals productkleuren, om inconsistenties tussen data-generatie (mocks)
 *   en UI-configuratie (Tailwind safelist) te voorkomen.
 */

/**
 * @constant PRODUCT_COLOR_KEYS
 * @description De definitieve lijst van Tailwind kleur-suffixes die gebruikt worden voor
 *              productvarianten. Deze lijst wordt geïmporteerd door zowel de
 *              in-memory-data.service.ts (voor mock data) als de tailwind.config.js (voor de safelist).
 */
export const PRODUCT_COLOR_KEYS: readonly string[] = [
  'pink-300',     // Roze
  'sky-300',      // Lichtblauw
  'blue-500',     // Standaard Blauw
  'emerald-300',  // Zacht Groen
  'green-500',    // Standaard Groen
  'yellow-300',   // Geel
  'purple-400',   // Paars
  'orange-300',   // Oranje
  'red-400',      // Rood
  'teal-400',     // Teal/Petrol
  'gray-400',     // Grijs
  'stone-400',    // Beige/Zandkleur
  'brown-400',    // Bruin
  'white',        // Wit
  'slate-700',    // Donkergrijs/Bijna Zwart
  'indigo-400',   // Indigo
  'violet-400',   // Violet
  'fuchsia-400',  // Fuchsia
  'rose-400',     // Rose
  'lime-400',     // Lime
  'cyan-400',     // Cyan
  'amber-400',    // Amber
];
