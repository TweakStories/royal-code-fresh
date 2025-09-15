/**
 * @file shop-page.component.ts
 * @Version 2.0.0 (Enterprise Blueprint - Corrected)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @description
 *   Container component for the main shop page (product grid/list view).
 *   This component leverages the `ProductFacade` and its comprehensive `viewModel`
 *   signal for a clean, reactive, and simplified state management approach,
 *   handling paginated and filtered product data.
 */

// === Angular Core Imports ===
import { Component, ChangeDetectionStrategy, OnInit, signal, inject } from '@angular/core';

// === Royal-Code UI & Core Imports ===
import { UiButtonComponent } from '@royal-code/ui/button';
import { LoggerService } from '@royal-code/core/core-logging';
import { ProductFacade } from '@royal-code/features/products/core';
import { ProductOverviewComponent } from '../product-overview/product-overview.component';

@Component({
  selector: 'plushie-royal-code-shop-page',
  standalone: true,
  imports: [UiButtonComponent, ProductOverviewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!--
      Main container for the shop page, using a flex layout that wraps on smaller screens.
    -->
    <div class="shop-page-container flex flex-col md:flex-row gap-4 lg:gap-6 p-4 lg:p-6">

      <!--
        Filter Sidebar Section.
        NOTE: Currently decorative. Future work involves connecting this to the ProductFacade.
      -->
      <aside class="w-full md:w-60 lg:w-72 xl:w-80 flex-shrink-0 bg-card-secondary p-4 rounded-xs shadow-md border border-border self-start order-1 md:order-none">
        <h2 class="text-xl font-semibold text-foreground mb-4 border-b border-border pb-3">
          Filter Knuffels
        </h2>
        <div class="space-y-5">
          <div>
            <label for="category-filter" class="block text-sm font-medium text-text mb-1.5">Diersoort</label>
            <select id="category-filter" class="w-full p-2.5 border border-input rounded-md bg-background text-sm focus:ring-primary focus:border-primary ring-1 ring-inset ring-border shadow-sm">
              <option selected>Alle Dieren</option>
              <option>Alpaca's</option>
              <option>Katten</option>
              <option>Octopussen</option>
            </select>
          </div>
          <div>
            <label for="price-filter" class="block text-sm font-medium text-text mb-1.5">Prijs</label>
            <input type="range" id="price-filter" min="10" max="100" value="55" class="w-full h-2 bg-muted rounded-xs appearance-none cursor-pointer accent-primary" />
            <div class="flex justify-between text-xs text-secondary mt-1">
              <span>€10</span>
              <span>€100</span>
            </div>
          </div>
          <royal-code-ui-button type="primary" extraClasses="mt-3">
            Filters Toepassen
          </royal-code-ui-button>
        </div>
      </aside>

      <!--
        Main Content Area housing the product overview.
      -->
      <main class="flex-grow min-w-0 order-2 md:order-none">
        <h1 class="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">Onze Knuffelcollectie</h1>
        <p class="text-sm text-secondary mb-4 sm:mb-6">
          Vind je perfecte, zachte vriendje! Van klassieke beren tot exotische dieren,
          elk met een uniek verhaal.
        </p>

        <!-- This component now correctly uses the full viewModel to display a filterable product list. -->
        <plushie-royal-code-product-overview
            [products]="viewModel().products"
            [initialViewMode]="currentViewMode()"
            [isLoading]="viewModel().isLoading"
            (viewModeChanged)="handleViewModeChange($event)"
        />
      </main>
    </div>
  `,
  styles: [':host { display: block; width: 100%; }']
})
export class ShopPageComponent implements OnInit {
  // === Dependency Injection ===
  private readonly logger = inject(LoggerService, { optional: true });
  private readonly productFacade = inject(ProductFacade);
  

  // === Private Properties ===
  private readonly logPrefix = '[ShopPageComponent]';

  // === State Signals ===
  // The comprehensive viewModel from the facade provides all data for a filterable list.
  readonly viewModel = this.productFacade.viewModel;

  // Local UI state for the view mode remains in the component.
  readonly currentViewMode = signal<'grid' | 'list'>('grid');

  // === Lifecycle Hooks ===
  ngOnInit(): void {
    this.logger?.info(`${this.logPrefix} Initializing shop page.`);

    // This action resets the state, sets initial filters (if any),
    // and triggers the initial data load for the main product list.
    this.productFacade.openPage();
    this.logger?.debug(`${this.logPrefix} Product feature state initialized via ProductFacade.openPage()`);
  }

  // === Event Handlers ===
  // Updates the local view mode state when the user changes it in the child component.
  handleViewModeChange(mode: 'grid' | 'list'): void {
    this.currentViewMode.set(mode);
    this.logger?.info(`${this.logPrefix} View mode preference updated to: ${mode}.`);
  }
}
