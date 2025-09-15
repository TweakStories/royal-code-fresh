/**
 * @file card.types.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   Definieert gedeelde, herbruikbare types voor alle kaart-componenten.
 *   Dit centraliseert de types en voorkomt circulaire afhankelijkheden.
 */
export type CardAppearance = 'default' | 'gradient';
export type CardBorderColor = 'default' | 'primary' | 'gradient';
export type CardRounding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';