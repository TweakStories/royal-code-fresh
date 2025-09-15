/**
 * @file token-storage.service.ts
 * @Version 4.1.0 (Opaque Refresh Token Support)
 */
import { Injectable, inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { LoggerService } from '@royal-code/core/core-logging';

const ACCESS_TOKEN_KEY = 'royal_code_access_token';
const REFRESH_TOKEN_KEY = 'royal_code_refresh_token';
const EXPIRY_BUFFER_SECONDS = 60;

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly logger = inject(LoggerService);
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.loadTokens();
  }

  private loadTokens(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      this.refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      this.logger.debug('[TokenStorageService] Tokens geladen.', {
        hasAccessToken: !!this.accessToken,
        hasRefreshToken: !!this.refreshToken
      });
    }
  }

  saveTokens(accessToken: string, refreshToken?: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.accessToken = accessToken;
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

      if (refreshToken) {
        this.refreshToken = refreshToken;
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
      
      this.logger.debug('[TokenStorageService] Tokens opgeslagen.');
    }
  }

  clearTokens(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      this.logger.info('[TokenStorageService] Tokens gewist.');
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  getDecodedAccessToken<T = any>(): T | null {
    const token = this.getAccessToken();
    if (!token) return null;
    
    try {
      return jwtDecode<T>(token);
    } catch (e) {
      this.logger.error('[TokenStorageService] Access token decodering mislukt.', e);
      return null;
    }
  }

  /**
   * Controleert of access token verlopen is MET buffer voor clock skew
   */
  isAccessTokenExpired(bufferSeconds = EXPIRY_BUFFER_SECONDS): boolean {
    const decodedToken = this.getDecodedAccessToken<{ exp?: number }>();
    if (!decodedToken?.exp) {
      this.logger.debug('[TokenStorageService] Geen exp claim in access token.');
      return true;
    }

    const expirationTime = decodedToken.exp * 1000;
    const currentTime = Date.now();
    const bufferMillis = bufferSeconds * 1000;
    const effectiveExpiry = expirationTime - bufferMillis;
    const isExpired = currentTime > effectiveExpiry;
    
    if (isExpired) {
      const timeUntilExpiry = Math.round((expirationTime - currentTime) / 1000);
      this.logger.debug(`[TokenStorageService] Access token verlopen of bijna verlopen (nog ${timeUntilExpiry}s).`);
    }
    
    return isExpired;
  }

  /**
   * Voor opaque refresh tokens kunnen we de expiry NIET checken.
   * We gaan ervan uit dat de refresh token geldig is totdat de server het tegendeel zegt.
   */
  isRefreshTokenExpired(): boolean {
    // Als er geen refresh token is, beschouw als verlopen
    if (!this.refreshToken) {
      return true;
    }
    
    // We kunnen een opaque token niet valideren, dus return false
    // De server zal ons vertellen als het verlopen is via een 401
    return false;
  }

  /**
   * Geeft de tijd tot expiry van access token in seconden
   */
  getTimeUntilExpiry(): number | null {
    const decodedToken = this.getDecodedAccessToken<{ exp?: number }>();
    if (!decodedToken?.exp) return null;
    
    const secondsUntilExpiry = decodedToken.exp - Math.floor(Date.now() / 1000);
    return secondsUntilExpiry > 0 ? secondsUntilExpiry : 0;
  }
}