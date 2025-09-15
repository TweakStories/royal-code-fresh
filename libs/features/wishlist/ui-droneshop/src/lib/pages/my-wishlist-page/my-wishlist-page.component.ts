/**
 * @file my-wishlist-page.component.ts
 * @Version 3.0.0 (Final UI Implementation with Mapper)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description The definitive "My Wishlist" overview page, consuming fully mapped domain models.
 */
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common'; // JsonPipe voor debugging
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { WishlistActions, selectAll, selectIsLoading, selectError } from '@royal-code/features/wishlist/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { TranslateModule } from '@ngx-translate/core';
import { WishlistItem } from '@royal-code/features/wishlist/domain';
import { LoggerService } from '@royal-code/core/core-logging';
import { AppIcon } from '@royal-code/shared/domain';
import { WishlistItemCardComponent } from '../../components/wishlist-item-card/wishlist-item-card.component'; // Importeer de card

@Component({
  selector: 'droneshop-my-wishlist-page',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule,
    UiTitleComponent, UiButtonComponent, UiSpinnerComponent,
    UiParagraphComponent, WishlistItemCardComponent, JsonPipe // JsonPipe kan blijven voor debugging
  ],
  template: `
    <div class="space-y-6">
      <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="'wishlist.pageTitle' | translate" />
      <royal-code-ui-paragraph color="muted">{{ 'wishlist.pageDescription' | translate }}</royal-code-ui-paragraph>

      <div class="flex gap-4">
        <royal-code-ui-button (clicked)="addItem()">{{ 'wishlist.addTestItemButton' | translate }}</royal-code-ui-button>
        <royal-code-ui-button type="outline" (clicked)="loadWishlist()">{{ 'wishlist.reloadButton' | translate }}</royal-code-ui-button>
      </div>

      @if (isLoading()) {
        <div class="flex justify-center items-center py-12"><royal-code-ui-spinner size="xl" /></div>
      } @else if (error()) {
        <div class="bg-destructive/10 text-destructive border border-destructive rounded-md p-4 text-center">
          <royal-code-ui-paragraph>{{ 'common.errorOccurred' | translate }}: {{ error() }}</royal-code-ui-paragraph>
        </div>
      } @else if (items().length > 0) {
        <h2 class="text-lg font-semibold mt-4">{{ 'wishlist.currentItems' | translate }} ({{ items().length }} items)</h2>
        <div class="bg-card p-4 rounded-md border border-border space-y-3">
          @for(item of items(); track item.id) {
            <droneshop-wishlist-item-card [item]="item" (removeItem)="removeItem($event)" />
          }
          <!-- Debugging van de volledige item-structuur kan hier blijven, of verwijderd worden -->
          <pre class="mt-4 bg-surface-alt p-3 rounded-md overflow-x-auto text-xs">{{ items() | json }}</pre>
        </div>
      } @else {
        <div class="text-center border-2 border-dashed border-border rounded-lg p-12">
          <royal-code-ui-paragraph size="lg" extraClasses="mb-4">{{ 'wishlist.emptyMessage' | translate }}</royal-code-ui-paragraph>
          <royal-code-ui-button type="primary" sizeVariant="lg" [routerLink]="['/products']">
            {{ 'wishlist.startShoppingButton' | translate }}
          </royal-code-ui-button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyWishlistPageComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly logger = inject(LoggerService);
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  readonly items = toSignal(this.store.select(selectAll), { initialValue: [] });
  readonly isLoading = toSignal(this.store.select(selectIsLoading), { initialValue: false });
  readonly error = toSignal(this.store.select(selectError), { initialValue: null });

  ngOnInit(): void {
    this.store.dispatch(WishlistActions.pageOpened());
    this.logger.info('[MyWishlistPageComponent] Page initialized, dispatching WishlistActions.pageOpened().');
  }

  loadWishlist(): void {
    this.store.dispatch(WishlistActions.loadWishlist());
    this.logger.debug('[MyWishlistPageComponent] Dispatching WishlistActions.loadWishlist().');
  }

  addItem(): void {
    // Gebruik een hardcoded product ID voor testdoeleinden.
    // Dit zou in een echte app via een product detail pagina komen.
    // Dit is een voorbeeld GUID, vervang deze met een GUID die bekend is in je backend mock of database.
    const testProductId = `08dc8328-dd94-4a7b-832f-65f54313f${Math.floor(Math.random() * 900) + 100}`; // Pseudo-unieke GUID
    this.store.dispatch(WishlistActions.addItem({ payload: { productId: testProductId } }));
    this.logger.debug(`[MyWishlistPageComponent] Dispatching WishlistActions.addItem() for productId: ${testProductId}.`);
  }

  removeItem(wishlistItemId: string): void {
    this.store.dispatch(WishlistActions.removeItem({ wishlistItemId }));
    this.logger.debug(`[MyWishlistPageComponent] Dispatching WishlistActions.removeItem() for wishlistItemId: ${wishlistItemId}.`);
  }
}