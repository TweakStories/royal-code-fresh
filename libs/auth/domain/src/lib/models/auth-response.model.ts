import { Profile } from '@royal-code/shared/domain'; 

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string; // Optioneel, indien gebruikt
  user?: Profile; // Backend kan initieel profiel meesturen
  expiresIn?: number; // Optioneel: levensduur access token in seconden
}

// Optioneel: voor gedecodeerde token info
export interface TokenPayload {
    sub: string;
    name?: string;
    roles?: string[];
    exp?: number;
    iat?: number;
    email?: string;
}
