/**
 * @file search-suggestion.model.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   Defines the data models for search suggestions returned by the autocomplete API.
 */

export interface SearchSuggestion {
  type: 'product' | 'category' | 'brand' | 'guide' | string;
  text: string;
  imageUrl?: string | null;
  route: (string | { [key: string]: any })[]; // Array voor routerLink, kan queryParams bevatten
}

export interface SearchSuggestionResponse {
  suggestions: SearchSuggestion[];
}