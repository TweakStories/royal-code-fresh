/**
 * @file product-create-page.component.ts
 * @Version 4.0.0 (Definitive Container)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-27
 * @Description The definitive smart container for creating a product. It is now a lean component
 *              that delegates all UI and form logic to the fully implemented ProductFormComponent.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminProductsFacade } from '@royal-code/features/admin-products/core';
import { CreateProductPayload, UpdateProductPayload } from '@royal-code/features/products/domain';
import { ProductFormComponent } from '../../components/product-form/product-form.component';

@Component({
  selector: 'admin-product-create-page',
  standalone: true,
  imports: [CommonModule, ProductFormComponent],
  template: `
    <admin-product-form
      [viewModel]="facade.viewModel()"
      (saveProduct)="onCreate($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCreatePageComponent implements OnInit {
  protected readonly facade = inject(AdminProductsFacade);

ngOnInit(): void {
    this.facade.ensureFormLookupsLoaded();
    console.log('[ProductCreatePageComponent] ViewModel on init:', this.facade.viewModel());
}



  onCreate(payload: CreateProductPayload | UpdateProductPayload): void {
    // De output is een union type, maar in de create context is het altijd CreateProductPayload
    this.facade.createProduct(payload as CreateProductPayload);
  }
}