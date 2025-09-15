/**
 * @file cart-dropdown.component.ts
 * @Version 2.0.0 (With Close Event Emitter)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-12
 * @Description
 *   The main content for the header cart dropdown. This version now emits a
 *   single `closeRequested` event for any user interaction that should result
 *   in the dropdown closing (e.g., navigating to cart, checkout, or a product).
 */
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  InputSignal,
  OutputEmitterRef,
  inject,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router'; // GEÏMPORTEERD
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { CartDropdownItemComponent } from '../cart-dropdown-item/cart-dropdown-item.component';
import { TranslateModule } from '@ngx-translate/core';
import { CartViewModel } from '@royal-code/features/cart/core';

@Component({
  selector: 'plushie-royal-code-cart-dropdown',
  standalone: true,
  imports: [
    CurrencyPipe,
    CartDropdownItemComponent,
    UiParagraphComponent,
    UiButtonComponent,
    UiTitleComponent,
    UiIconComponent,
    TranslateModule,
  ],
  template: `
    <div class="w-80 rounded-md border border-border bg-card p-4 text-foreground shadow-lg">
      <royal-code-ui-title [level]="TitleTypeEnum.H4" [text]="'shoppingCart.overview.title' | translate" extraClasses="!mb-4" />
      @if (viewModel(); as vm) {
        @if (vm.isEmpty && !vm.isLoading) {
          <div class="py-8 text-center">
            <royal-code-ui-icon [icon]="AppIcon.ShoppingCart" sizeVariant="lg" extraClass="text-muted mb-2" />
            <royal-code-ui-paragraph color="muted">
              {{ 'shoppingCart.overview.emptyCartTitle' | translate }}
            </royal-code-ui-paragraph>
          </div>
        } @else {
          <div class="max-h-64 space-y-4 overflow-y-auto pr-2">
            @for (item of vm.items; track item.id) {
              <plushie-royal-code-cart-dropdown-item [item]="item" (linkClicked)="closeRequested.emit()" />
            }
          </div>
          <div class="mt-4 border-t border-border pt-4">
            <div class="flex justify-between text-base font-semibold">
              <royal-code-ui-paragraph>{{ 'checkout.orderSummary.subtotal' | translate }}</royal-code-ui-paragraph>
              <royal-code-ui-paragraph>{{ vm.subTotal | currency : 'EUR' }}</royal-code-ui-paragraph>
            </div>
            <div class="mt-5 flex justify-between">
              <royal-code-ui-button type="outline" (clicked)="onNavigateTo('/cart')">
                {{ 'shoppingCart.overview.viewCart' | translate }}
              </royal-code-ui-button>
              <royal-code-ui-button type="primary" (clicked)="onNavigateTo('/checkout')">
                {{ 'shoppingCart.overview.checkout' | translate }}
              </royal-code-ui-button>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartDropdownComponent {
  private readonly router = inject(Router);

  /** @description The full view model for the cart. */
  readonly viewModel: InputSignal<CartViewModel | undefined> = input<CartViewModel | undefined>();

  /** @description Emits whenever an action occurs that should close the dropdown. */
  readonly closeRequested: OutputEmitterRef<void> = output<void>();

  /** @description Exposes enums to the template. */
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  /**
   * @method onNavigateTo
   * @description Navigates to a given route and emits an event to close the dropdown.
   * @param {string} route - The route to navigate to.
   */
  onNavigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeRequested.emit();
  }
}
