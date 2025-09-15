/**
 * @file storage.service.ts
 * @Version 2.4.0 (Minimal Debug Version)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-11
 * @Description
 *   Minimal version to debug the build issue.
 */
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Define StorageType locally to avoid import issues
type StorageType = 'local' | 'session';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly platformId: Object;

  constructor() {
    this.platformId = inject(PLATFORM_ID);
  }

  private getStorage(type: StorageType): Storage | null {
    if (isPlatformBrowser(this.platformId)) {
      return type === 'local' ? localStorage : sessionStorage;
    }
    return null;
  }

  getItem<T>(key: string, type: StorageType = 'local'): T | null {
    const storage = this.getStorage(type);
    if (!storage) return null;

    try {
      const item = storage.getItem(key);
      if (item) {
        return JSON.parse(item) as T;
      }
    } catch (e) {
      console.error(`[StorageService] Failed to parse item from ${type}Storage.`, { key, error: e });
      return null;
    }
    return null;
  }

  setItem(key: string, value: unknown, type: StorageType = 'local'): void {
    const storage = this.getStorage(type);
    if (!storage) return;

    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`[StorageService] Failed to set item in ${type}Storage.`, { key, error: e });
    }
  }

  removeItem(key: string, type: StorageType = 'local'): void {
    const storage = this.getStorage(type);
    if (storage) {
      storage.removeItem(key);
    }
  }

  clear(type: StorageType = 'local'): void {
    const storage = this.getStorage(type);
    if (storage) {
      storage.clear();
    }
  }
}