/**
 * @file order-items-table.component.ts
 * @Version 3.3.0 (Definitive - i18n Headers & RxJS Interop)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description
 *   Dumb component that now correctly displays variant information,
 *   with i18n headers and the RxJS interop import fixed and improved type safety in the
 *   valueChanges subscription.
 */
import { Component, ChangeDetectionStrategy, input, output, effect, DestroyRef, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormArray, ReactiveFormsModule, FormGroup, AbstractControl } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UiImageComponent } from '@royal-code/ui/image';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiButtonComponent } from '@royal-code/ui/button';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { OrderItem } from '@royal-code/features/orders/domain';

export interface OrderItemUpdate {
  itemId: string;
  quantity: number;
  pricePerItem: number;
}

@Component({
  selector: 'admin-order-items-table',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule, UiImageComponent, UiIconComponent, UiInputComponent, UiButtonComponent, TranslateModule, UiBadgeComponent],
  template: `
    <div [formGroup]="parentFormGroup()">
      <div class="overflow-x-auto" formArrayName="items">
        <table class="w-full text-sm text-left text-secondary">
          <thead class="text-xs text-muted uppercase bg-surface-alt">
             <tr>
              <th scope="col" class="p-4">{{ 'admin.orders.detail.products' | translate }}</th>
              <th scope="col" class="p-4 w-32">{{ 'admin.orders.detail.pricePerItem' | translate }}</th>
              <th scope="col" class="p-4 w-24">{{ 'admin.orders.detail.quantity' | translate }}</th>
              <th scope="col" class="p-4 text-right">{{ 'admin.orders.detail.total' | translate }}</th>
              <th scope="col" class="p-4"></th>
            </tr>
          </thead>
          <tbody>
            @for (control of itemsFormArray.controls; track control.value.id; let i = $index) {
              <tr class="border-b border-border last:border-b-0 hover:bg-hover" [formGroupName]="i">
                <td class="p-4 font-medium text-foreground align-top">
                  <div class="flex items-start gap-3">
                    <div class="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                      @if (control.value.productImageUrl) {
                        <royal-code-ui-image [src]="control.value.productImageUrl" [alt]="control.value.productName" objectFit="cover" />
                      } @else {
                        <div class="w-full h-full flex items-center justify-center text-secondary">
                          <royal-code-ui-icon [icon]="AppIcon.ImageOff" sizeVariant="sm" />
                        </div>
                      }
                    </div>
                    <div>
                      <span class="font-semibold text-foreground">{{ control.value.productName }}</span>
                       @if(control.value.sku) {
                        <p class="text-xs font-mono text-muted">SKU: {{ control.value.sku }}</p>
                      }
                      @if(control.value.variantInfo && control.value.variantInfo.length > 0) {
                        <div class="flex flex-wrap items-center gap-2">
                          @for(variant of control.value.variantInfo; track variant.attributeType) {
                            <royal-code-ui-badge color="muted" [bordered]="true">
                              @if (variant.attributeType.toLowerCase() === 'color' && variant.colorHex) {
                                <span class="w-3 h-3 rounded-full border border-border inline-block flex-shrink-0" [style.background-color]="variant.colorHex"></span>
                              }
                              <span>{{ variant.displayName }}</span>
                            </royal-code-ui-badge>
                          }
                        </div>
                      }
                    </div>
                  </div>
                </td>
                <td class="p-4 align-middle">
                  <royal-code-ui-input formControlName="pricePerItem" type="number" extraClasses="!py-1" />
                </td>
                <td class="p-4 align-middle">
                  <royal-code-ui-input formControlName="quantity" type="number" extraClasses="!py-1" />
                </td>
                <td class="p-4 text-right font-medium align-middle">{{ control.value.pricePerItem * control.value.quantity | currency:'EUR' }}</td>
                <td class="p-4 text-right align-middle">
                  <royal-code-ui-button type="fire" sizeVariant="icon" (clicked)="removeItem.emit(control.value.id)">
                    <royal-code-ui-icon [icon]="AppIcon.Trash2" />
                  </royal-code-ui-button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderItemsTableComponent {
  parentFormGroup = input.required<FormGroup>();

  addItem = output<void>();
  removeItem = output<string>();
  itemUpdated = output<OrderItemUpdate>();

  protected readonly AppIcon = AppIcon;
  private readonly destroyRef = inject(DestroyRef);

  get itemsFormArray(): FormArray {
    return this.parentFormGroup().get('items') as FormArray;
  }
  
  constructor() {
    effect(() => {
      const form = this.parentFormGroup();
      if (form) {
        this.itemsFormArray.controls.forEach((control: AbstractControl) => {
          control.valueChanges.pipe(
            debounceTime(500),
            takeUntilDestroyed(this.destroyRef)
          ).subscribe(value => {
            const itemValue = value as OrderItem;
            if (control.dirty && itemValue?.id) {
              this.itemUpdated.emit({
                itemId: itemValue.id,
                quantity: itemValue.quantity,
                pricePerItem: itemValue.pricePerItem
              });
            }
          });
        });
      }
    }, { allowSignalWrites: true });
  }
}