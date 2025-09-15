// --- VERVANG VOLLEDIG BLOK: login(credentials: LoginCredentials): Observable<AuthResponse> { ... } in libs/auth/data-access/src/lib/services/auth.service.ts ---
/**
 * @file auth.service.ts
 * @Version 3.0.0 (API Calls & Token Handling)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-05
 * @Description
 *   Service voor authenticatie-gerelateerde API-aanroepen.
 *   Verwerkt login, logout en tokenvernieuwing.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '@royal-code/auth/domain'; // Let op AuthResponse
import { APP_CONFIG } from '@royal-code/core/config';
import { TokenStorageService } from './token-storage.service';
import { LoggerService } from '@royal-code/core/core-logging';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly logger = inject(LoggerService);

  private readonly authUrl = `${this.config.backendUrl}/Authentication`;
  private readonly LOG_PREFIX = '[AuthService]';

  /**
   * Verstuurt inloggegevens naar de backend en verwerkt de tokens.
   * @param credentials Gebruikersnaam en wachtwoord.
   * @returns Een Observable met de AuthResponse.
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.logger.info(`${this.LOG_PREFIX} Poging tot inloggen voor: ${credentials.email}`);
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, credentials).pipe(
      tap(response => {
        this.tokenStorage.saveTokens(response.accessToken, response.refreshToken);
        this.logger.info(`${this.LOG_PREFIX} Inloggen succesvol, tokens opgeslagen.`);
      })
    );
  }

  /**
   * Stuurt een verzoek naar de backend om uit te loggen en wist lokale tokens.
   * @returns Een Observable die voltooid na uitloggen.
   */
  logout(): Observable<void> {
    this.logger.info(`${this.LOG_PREFIX} Uitloggen uitvoeren (tokens wissen).`);
    // Optioneel: stuur een API-aanroep om de refresh token op de server ongeldig te maken.
    // Voor nu: alleen client-side cleanup.
    this.tokenStorage.clearTokens();
    return this.http.post<void>(`${this.authUrl}/logout`, {}).pipe(
        tap(() => this.logger.info(`${this.LOG_PREFIX} Server-side logout response ontvangen.`))
    );
  }

  /**
   * Vernieuwt de access token met behulp van de refresh token.
   * @returns Een Observable met de nieuwe AuthResponse.
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    if (!refreshToken) {
      this.logger.warn(`${this.LOG_PREFIX} Geen refresh token gevonden voor vernieuwing.`);
      throw new Error('No refresh token available');
    }
    this.logger.info(`${this.LOG_PREFIX} Verversen van token aangevraagd.`);
    return this.http.post<AuthResponse>(`${this.authUrl}/refresh-token`, { refreshToken }).pipe(
      tap(response => {
        this.tokenStorage.saveTokens(response.accessToken, response.refreshToken);
        this.logger.info(`${this.LOG_PREFIX} Token succesvol vernieuwd en opgeslagen.`);
      })
    );
  }

    register(credentials: RegisterCredentials): Observable<AuthResponse> {
    this.logger.info(`${this.LOG_PREFIX} Poging tot registreren voor: ${credentials.email}`);
    return this.http.post<AuthResponse>(`${this.authUrl}/register`, credentials).pipe(
      tap(response => {
        this.tokenStorage.saveTokens(response.accessToken, response.refreshToken);
        this.logger.info(`${this.LOG_PREFIX} Registratie succesvol, tokens opgeslagen.`);
      })
    );
  }
}