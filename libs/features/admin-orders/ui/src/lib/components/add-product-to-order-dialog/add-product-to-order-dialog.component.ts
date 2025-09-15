/**
 * @file add-product-to-order-dialog.component.ts
 * @Version 4.0.0 (Definitive - Signal State Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-24
 * @Description
 *   The definitive, working version. The core issue was that the component's
 *   local selection state was a plain object, which did not reliably trigger the
 *   re-evaluation of the `computed` signal. By converting `selection` itself
 *   into a signal (`signal<Record<string, string>>({})`), the dependency becomes
 *   explicit and robust, solving the disabled button issue permanently.
 */
import { Component, ChangeDetectionStrategy, inject, signal, computed, WritableSignal } from '@angular/core';
import { CommonModule, CurrencyPipe, LowerCasePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter, switchMap, take } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

import { AdminProductsFacade } from '@royal-code/features/admin-products/core';
import { ProductFacade, selectProductById } from '@royal-code/features/products/core';
import { Product, ProductVariantCombination, VariantAttribute } from '@royal-code/features/products/domain';
import { DYNAMIC_OVERLAY_REF, DynamicOverlayRef } from '@royal-code/ui/overlay';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { UiImageComponent } from '@royal-code/ui/media';
import { AppIcon } from '@royal-code/shared/domain';
import { filterImageMedia } from '@royal-code/shared/utils';
import { Image } from '@royal-code/shared/domain';

export interface AddProductResult {
  productId: string;
  variantId: string;
  quantity: number;
}

type ViewState = 'search' | 'loadingDetails' | 'variantSelection';

@Component({
  selector: 'admin-add-product-to-order-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CurrencyPipe, LowerCasePipe, TitleCasePipe, TranslateModule,
    UiInputComponent, UiButtonComponent, UiSpinnerComponent, UiImageComponent
  ],
  template: `
    <div class="p-6 rounded-xs bg-card shadow-xl border border-border w-[600px] max-w-[90vw] h-[70vh] max-h-[80vh] flex flex-col">
      <h2 class="text-xl font-semibold text-foreground mb-4">{{ 'admin.dialogs.addProduct.title' | translate }}</h2>

      @switch (viewState()) {
        @case ('search') {
          <div class="flex-shrink-0">
            <royal-code-ui-input
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchTermChange($event)"
              [placeholder]="'admin.dialogs.addProduct.searchPlaceholder' | translate"
              [icon]="AppIcon.Search"
            />
          </div>
          <div class="flex-grow mt-4 overflow-y-auto">
            @if (adminProductsFacade.viewModel().isLoading) {
              <div class="flex justify-center items-center h-full"><royal-code-ui-spinner /></div>
            } @else {
              <ul class="space-y-2">
                @for (product of adminProductsFacade.viewModel().products; track product.id) {
                  <li (click)="selectProduct(product)" class="flex items-center gap-4 p-2 rounded-md hover:bg-hover cursor-pointer">
                    <div class="w-12 h-12 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                      @if (getPrimaryImage(product); as image) {
                        <royal-code-ui-image [src]="image.variants[0].url" [alt]="product.name" objectFit="cover" />
                      }
                    </div>
                    <div class="flex-grow"><p class="font-medium text-foreground">{{ product.name }}</p><p class="text-sm text-secondary">{{ product.price | currency:'EUR' }}</p></div>
                  </li>
                } @empty { <p class="text-center text-secondary p-4">{{ 'admin.dialogs.addProduct.noProductsFound' | translate }}</p> }
              </ul>
            }
          </div>
        }
        @case ('loadingDetails') {
          <div class="flex-grow flex flex-col justify-center items-center text-center">
            <royal-code-ui-spinner size="lg" /><p class="mt-4 text-secondary">{{ 'admin.dialogs.addProduct.loadingDetails' | translate }}</p>
          </div>
        }
        @case ('variantSelection') {
          @if(selectedProduct(); as product) {
            <div class="flex-grow overflow-y-auto">
              <div class="flex items-start gap-4 mb-4">
                 <div class="w-20 h-20 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                    @if (getPrimaryImage(product); as image) { <royal-code-ui-image [src]="image.variants[0].url" [alt]="product.name" objectFit="cover" /> }
                  </div>
                  <div>
                    <h3 class="font-semibold text-lg text-foreground">{{ product.name }}</h3>
                     <royal-code-ui-button type="primary" (clicked)="clearSelection()" sizeVariant="sm" extraClasses="!p-0 h-auto">← {{ 'admin.dialogs.addProduct.backToSearch' | translate }}</royal-code-ui-button>
                  </div>
              </div>
              <div class="space-y-4">
                @if ((product.variantAttributes ?? []).length > 0) {
                  @for (attribute of product.variantAttributes; track attribute.id) {
                    <div>
                      <label [for]="attribute.id" class="block text-sm font-medium text-foreground mb-1">{{ attribute.name | titlecase }}</label>
                      <select [id]="attribute.id" [ngModel]="selection()[attribute.id]" (ngModelChange)="onSelectionChange(attribute.id, $event)" class="w-full p-2 border border-input rounded-md bg-background text-sm">
                        <option [ngValue]="undefined" disabled>{{ 'admin.dialogs.addProduct.selectAttribute' | translate: { attribute: (attribute.name | lowercase) } }}</option>
                        @for (value of attribute.values; track value.id) {
                          <option [value]="value.id">{{ (value.displayName || value.value) | titlecase }}</option>
                        }
                      </select>
                    </div>
                  }
                }
                <div>
                  <label for="quantity" class="block text-sm font-medium text-foreground mb-1">{{ 'admin.dialogs.addProduct.quantity' | translate }}</label>
                  <royal-code-ui-input id="quantity" type="number" [(ngModel)]="quantity" />
                </div>
                @if (selectedVariant()) {
                  <div class="p-3 bg-surface-alt rounded-md text-sm">
                    <p><strong>{{ 'admin.dialogs.addProduct.sku' | translate }}:</strong> {{ selectedVariant()?.sku }}</p>
                    <p><strong>{{ 'admin.dialogs.addProduct.price' | translate }}:</strong> {{ selectedVariant()?.price | currency:'EUR' }}</p>
                    <p><strong>{{ 'admin.dialogs.addProduct.stockStatus' | translate }}:</strong> {{ selectedVariant()?.stockStatus | titlecase }}</p>
                  </div>
                }
              </div>
            </div>
          }
        }
      }

      <div class="flex-shrink-0 pt-4 border-t border-border flex justify-end gap-3">
        <royal-code-ui-button type="outline" (clicked)="cancel()">{{ 'admin.dialogs.addProduct.cancel' | translate }}</royal-code-ui-button>
        <royal-code-ui-button type="primary" (clicked)="confirm()" [disabled]="!isSelectionValid()">{{ 'admin.dialogs.addProduct.addToOrder' | translate }}</royal-code-ui-button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddProductToOrderDialogComponent {
  protected readonly adminProductsFacade = inject(AdminProductsFacade);
  protected readonly productFacade = inject(ProductFacade);
  private readonly store = inject(Store);
  private readonly overlayRef = inject<DynamicOverlayRef<AddProductResult>>(DYNAMIC_OVERLAY_REF);

  protected readonly AppIcon = AppIcon;
  protected searchTerm: string = '';
  // *** DE FIX: Converteer de lokale state naar een signal ***
  protected selection = signal<Record<string, string>>({});
  protected quantity = 1;

  protected viewState: WritableSignal<ViewState> = signal('search');
  protected selectedProductId = signal<string | null>(null);

  protected selectedProduct = toSignal(
    toObservable(this.selectedProductId).pipe(
      filter((id): id is string => !!id),
      switchMap(id => this.store.select(selectProductById(id)))
    )
  );
  
  protected selectedVariant = computed<ProductVariantCombination | undefined>(() => {
    const product = this.selectedProduct();
    const currentSelection = this.selection(); // Lees de signal waarde
    
    if (!product || !product.variantCombinations) {
      return undefined;
    }
    
    const requiredAttributeIds = (product.variantAttributes ?? []).map((a: VariantAttribute) => a.id);
    
    if (requiredAttributeIds.length === 0) {
      return product.variantCombinations[0];
    }
    
    const hasAllSelections = requiredAttributeIds.every((id: string) => !!currentSelection[id]);
    if (!hasAllSelections) return undefined;

    return product.variantCombinations.find((combo: ProductVariantCombination) => 
      combo.attributes.every(attr => currentSelection[attr.attributeId] === attr.attributeValueId)
    );
  });
  
  protected isSelectionValid = computed(() => {
    const product = this.selectedProduct();
    if (!product || this.viewState() !== 'variantSelection' || this.quantity <= 0) {
      return false;
    }
    
    const hasVariantAttributes = (product.variantAttributes ?? []).length > 0;
    if (!hasVariantAttributes) {
      return (product.variantCombinations ?? []).length > 0;
    }
    
    return !!this.selectedVariant();
  });

  constructor() {
    this.adminProductsFacade.initPage();
  }
  
  onSearchTermChange(term: string): void {
    setTimeout(() => {
      if (term === this.searchTerm) {
        this.adminProductsFacade.changeFilters({ searchTerm: term });
      }
    }, 300);
  }

  getPrimaryImage(product: Product | null): Image | undefined {
    if (!product) return undefined;
    return filterImageMedia(product.media)?.[0];
  }

  selectProduct(product: Product): void {
    this.viewState.set('loadingDetails');
    this.productFacade.selectProduct(product.id);

    this.productFacade.viewModel$.pipe(
      filter(vm => !vm.isLoading && !!vm.selectedProduct && vm.selectedProduct.id === product.id),
      take(1)
    ).subscribe(vm => {
      this.selectedProductId.set(vm.selectedProduct!.id);
      this.viewState.set('variantSelection');
    });
  }

  clearSelection(): void {
    this.viewState.set('search');
    this.selectedProductId.set(null);
    this.productFacade.selectProduct(null);
    this.selection.set({}); // Reset het signal
  }
  
  onSelectionChange(attributeId: string, valueId: string): void {
    // *** DE FIX: Gebruik de .update() methode van het signal ***
    this.selection.update(currentSelection => ({
      ...currentSelection,
      [attributeId]: valueId
    }));
  }

  confirm(): void {
    const product = this.selectedProduct();
    if (!product || !this.isSelectionValid()) return;
    
    let variantId = this.selectedVariant()?.id;
    if (!variantId && (product.variantAttributes ?? []).length === 0) {
      variantId = (product.variantCombinations ?? []).find(vc => vc.isDefault)?.id ?? product.variantCombinations?.[0]?.id;
    }

    if (!variantId) {
      console.error("Could not find a valid variant ID to add.");
      return;
    }

    this.overlayRef.close({
      productId: product.id,
      variantId: variantId,
      quantity: this.quantity,
    });
  }

  cancel(): void {
    this.overlayRef.close();
  }
}