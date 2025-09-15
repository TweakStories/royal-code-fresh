/**
 * @file droneshop-header.component.ts
 * @Version 23.0.0 (Refactored to Wrapper Component)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   Een applicatie-specifieke "wrapper" component voor de Droneshop header.
 *   Deze component fungeert als een schil rond de nieuwe, generieke UiHeaderComponent.
 *   Het is verantwoordelijk voor het leveren van de Droneshop-specifieke zoekfunctionaliteit
 *   en het doorgeven van de navigatiedata. Dit patroon behoudt een schone scheiding
 *   tussen gedeelde UI en app-specifieke logica.
 */
import { ChangeDetectionStrategy, Component, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map } from 'rxjs/operators';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

// --- Core & Config ---
import { APP_CONFIG } from '@royal-code/core/config';
import { DroneshopProductApiService } from '@royal-code/features/products/data-access-droneshop';
import { SearchSuggestion } from '@royal-code/features/products/domain';
import { CartFacade } from 'libs/features/cart/core/src/lib/state/cart.facade';

// --- GEDEELDE UI COMPONENT ---
import { UiHeaderComponent } from '@royal-code/ui/navigation';

@Component({
  selector: 'droneshop-header',
  standalone: true,
  imports: [CommonModule, UiHeaderComponent],
  template: `
    <royal-code-ui-header
      [cartItemCount]="cartFacade.viewModel().totalItemCount"
      [suggestions]="suggestions()"
      (searchQueryChanged)="onSearchQueryChanged($event)"
      (searchSubmitted)="onSearchSubmitted($event)"
      (suggestionSelected)="onSuggestionSelected($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DroneshopHeaderComponent {
  // --- Dependencies ---
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly productApiService = inject(DroneshopProductApiService);
  private readonly config = inject(APP_CONFIG);
  protected readonly cartFacade = inject(CartFacade);

  // --- State voor Zoekfunctionaliteit ---
  private readonly searchTerm$ = new Subject<string>();
  readonly suggestions = toSignal(
    this.searchTerm$.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(term => term.length > 1
        ? this.productApiService.getSuggestions(term).pipe(
            map(response => {
              const backendOrigin = new URL(this.config.backendUrl).origin;
              return response.suggestions.map(suggestion => ({
                ...suggestion,
                imageUrl: suggestion.imageUrl ? `${backendOrigin}/${suggestion.imageUrl}` : null
              }));
            }),
            catchError(() => of([] as SearchSuggestion[]))
          )
        : of([] as SearchSuggestion[]),
      ),
      takeUntilDestroyed(this.destroyRef)
    )
  );

  // --- Event Handlers ---
  onSearchQueryChanged(query: string): void {
    this.searchTerm$.next(query);
  }

  onSearchSubmitted(query: string): void {
    if (query?.trim()) {
      this.searchTerm$.next(''); // Clear suggestions
      this.router.navigate(['/search'], { queryParams: { q: query.trim() } });
    }
  }

  onSuggestionSelected(suggestion: SearchSuggestion): void {
    this.searchTerm$.next(''); // Clear suggestions
    if (suggestion.type === 'product') {
      this.router.navigate(suggestion.route as any[]);
    } else {
      this.router.navigate(['/search'], { queryParams: { q: suggestion.text } });
    }
  }
}