/**
 * @file content-block.model.ts
 * @Version 1.1.0 (Checklist Added)
 * @Description Defines the discriminated union for all content block types, now including 'checklist'.
 */
import { Image } from '@royal-code/shared/domain';

export type ContentBlock =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; content: string }
  | { type: 'image'; image: Image; caption?: string }
  | { type: 'youtube'; videoId: string; title: string }
  | { type: 'partsList'; partIds: readonly string[]; introText?: string }
  | { type: 'toolsList'; toolIds: readonly string[]; introText?: string }
  | { type: 'callout'; style: 'info' | 'warning' | 'pro-tip'; content: string }
  | { type: 'checklist'; items: readonly { text: string; }[] }
  | { type: 'safetyGate'; hazardType: 'lipo' | 'solder' | 'props'; acknowledgementText: string }
  | { type: 'code'; language: 'cli' | 'typescript' | 'html' | 'css' | 'json'; content: string };