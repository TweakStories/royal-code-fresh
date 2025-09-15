/**
 * @file product-edit-page.component.ts
 * @Version 7.0.0 (Definitive Race Condition Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-04
 * @Description
 *   De definitieve, architectonisch correcte container voor het bewerken van een product.
 *   Lost de hardnekkige race condition op door expliciet te wachten op volledig geladen
 *   productdetails voordat het formulier wordt gerenderd. Dit garandeert data-integriteit.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { AdminProductsFacade } from '@royal-code/features/admin-products/core';
import { CreateProductPayload, UpdateProductPayload, Product } from '@royal-code/features/products/domain';
import { Media } from '@royal-code/shared/domain';
import { MediaActions } from '@royal-code/features/media/core';

import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';

@Component({
  selector: 'admin-product-edit-page',
  standalone: true,
  imports: [CommonModule, ProductFormComponent, UiSpinnerComponent],
  template: `
    <!-- === DE FIX: Toon een spinner totdat de VOLLEDIGE productdata is geladen === -->
    @if (isProductDetailLoaded()) {
      <admin-product-form
        [viewModel]="viewModel()"
        [product]="viewModel().selectedProduct"
        (saveProduct)="onUpdate($event)"
      />
    } @else {
      <!-- Fallback voor laden of fouten -->
      <div class="flex justify-center items-center h-64">
        @if (viewModel().isLoading) {
          <royal-code-ui-spinner size="lg" />
        } @else if (viewModel().error) {
          <p class="p-4 text-destructive bg-destructive/10 border border-destructive rounded-md">
              Fout bij het laden van het product: {{ viewModel().error }}
          </p>
        } @else {
           <p class="p-4 text-secondary">Product wordt geladen...</p>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEditPageComponent implements OnInit, OnDestroy {
  private readonly facade = inject(AdminProductsFacade);
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  readonly viewModel = this.facade.viewModel;

  /**
   * @computed isProductDetailLoaded
   * @description
   *   Een cruciale guard die controleert of de `selectedProduct` in de state
   *   daadwerkelijk de VOLLEDIGE data bevat. We beschouwen het als "compleet"
   *   als het de `variantCombinations` array heeft, wat alleen gebeurt na een
   *   succesvolle detail-API call. Dit voorkomt dat incomplete data uit de
   *   productenlijst-cache wordt gebruikt.
   */
  readonly isProductDetailLoaded = computed(() => {
    const vm = this.viewModel();
    // Het product is pas "echt" geladen als het niet laadt, een geselecteerd product heeft,
    // en die selectie de variant-combinaties bevat (een teken van een volledige DTO).
    return !vm.isLoading && !!vm.selectedProduct && Array.isArray(vm.selectedProduct.variantCombinations);
  });

  ngOnInit(): void {
    this.facade.ensureFormLookupsLoaded();
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter((id): id is string => !!id),
      takeUntil(this.destroy$)
    ).subscribe(id => {
      // Deze actie triggert de `loadProductDetail` effect, die de volledige data ophaalt.
      this.facade.openProductDetailPage(id);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.facade.selectProduct(null); // Ruim de selectie op bij het verlaten
  }

  onUpdate(payload: CreateProductPayload | UpdateProductPayload): void {
    const productId = this.viewModel().selectedProduct?.id;
    if (!productId) return;
    this.facade.updateProduct(productId, payload as UpdateProductPayload);
  }
}