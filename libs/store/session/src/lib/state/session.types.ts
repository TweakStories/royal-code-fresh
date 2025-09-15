/**
 * @file session.types.ts
 * @Description Session state types and interfaces.
 */

export interface SessionState {
  isActive: boolean;
  sessionId: string | null;
  expiryTime: Date | null;
}