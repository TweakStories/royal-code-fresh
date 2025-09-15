/**
 * @file sync-status.enum.ts
 * @Version 2.1.0 (Converted to Enum & Added PendingDeletion)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-28
 * @description Defines the `SyncStatus` enum for managing UI state during
 *              optimistic updates. Converted to a proper enum to be used as a value.
 */
export enum SyncStatus {
  Pending = 'pending',
  Syncing = 'syncing',
  Synced = 'synced',
  Error = 'error',
  PendingDeletion = 'pending-deletion',
}