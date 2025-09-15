/**
 * @file feed.selectors.ts
 * @Version 2.0.0 (Enterprise Blueprint Standard)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description
 *   Public-facing export gateway for all selectors defined within `feed.feature.ts`.
 *   This approach maintains a stable public API for consumers like facades and components.
 */

// Re-export all selectors from the single source of truth: the feed feature file.
export * from './feed.feature';