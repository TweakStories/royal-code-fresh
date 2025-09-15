/**
 * @file checkout-review-step.component.ts
 * @Version 4.0.0 (Enterprise Ready)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-10
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-08-10
 * @PromptSummary "Generate the entire checkout-review-step.component.ts file to be enterprise-ready."
 * @Description
 *   The definitive, enterprise-grade implementation of the 'Review & Confirm' step in the
 *   checkout process. This component serves as the final confirmation point for the user,
 *   displaying a clear summary of shipping, payment, and financial details. It is designed
 *   for maximum clarity and user confidence to drive conversion. It fetches all its state
 *   reactively from the appropriate facades and includes robust, contextual error handling.
 */
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

// --- Feature Facades & Domain ---
import { CartFacade } from '@royal-code/features/cart/core';
import { AppIcon } from '@royal-code/shared/domain';

// --- Royal-Code UI Library ---
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { CheckoutFacade } from '@royal-code/features/checkout/core';

@Component({
  selector: 'plushie-royal-code-checkout-review-step',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    UiTitleComponent,
    UiParagraphComponent,
    UiButtonComponent,
    UiIconComponent,
    UiSpinnerComponent,
  ],
  template: `
    <section class="rounded-xs border border-border p-4 sm:p-6 space-y-6 lg:space-y-8">
      <div>
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'checkout.review.title' | translate" />
      </div>

      <!-- Shipping Details Section -->
      <div class="border-t border-border pt-6">
        <div class="flex justify-between items-center">
          <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'checkout.shipping.title' | translate" extraClasses="!text-lg" />
          <royal-code-ui-button type="transparent" sizeVariant="sm" (clicked)="goToStep('shipping')">
            <royal-code-ui-icon [icon]="AppIcon.Edit" sizeVariant="xs" extraClass="mr-2" />
            <span>{{ 'common.buttons.edit' | translate }}</span>
          </royal-code-ui-button>
        </div>
        @if (shippingAddress(); as address) {
          <div class="mt-4 p-4 rounded-md bg-surface-alt">
            <royal-code-ui-paragraph extraClasses="font-semibold">{{ address.contactName }}</royal-code-ui-paragraph>
            <royal-code-ui-paragraph color="muted" size="sm">
              {{ address.street }} {{ address.houseNumber }}<br />
              {{ address.postalCode }} {{ address.city }}
            </royal-code-ui-paragraph>
          </div>
        } @else {
          <royal-code-ui-paragraph color="muted" size="sm" extraClasses="mt-2">{{ 'checkout.review.noShippingAddress' | translate }}</royal-code-ui-paragraph>
        }
      </div>

      <!-- Payment Details Section -->
      <div class="border-t border-border pt-6">
        <div class="flex justify-between items-center">
          <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'checkout.payment.title' | translate" extraClasses="!text-lg" />
          <royal-code-ui-button type="transparent" sizeVariant="sm" (clicked)="goToStep('payment')">
            <royal-code-ui-icon [icon]="AppIcon.Edit" sizeVariant="xs" extraClass="mr-2" />
            <span>{{ 'common.buttons.edit' | translate }}</span>
          </royal-code-ui-button>
        </div>
        @if (paymentMethod(); as payment) {
          <div class="mt-4 p-4 rounded-md bg-surface-alt flex items-center gap-3">
            <royal-code-ui-icon [icon]="payment.icon" sizeVariant="md" extraClass="text-primary" />
            <royal-code-ui-paragraph extraClasses="font-semibold">{{ payment.nameKey | translate }}</royal-code-ui-paragraph>
          </div>
        } @else {
          <royal-code-ui-paragraph color="muted" size="sm" extraClasses="mt-2">{{ 'checkout.review.noPaymentMethod' | translate }}</royal-code-ui-paragraph>
        }
      </div>

      <!-- Financial Summary & Submit Section -->
      <div class="border-t border-border pt-6 space-y-4">
        @if (cartViewModel(); as cart) {
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <royal-code-ui-paragraph color="muted">{{ 'checkout.orderSummary.subtotal' | translate }}</royal-code-ui-paragraph>
              <royal-code-ui-paragraph>{{ cart.subTotal | currency:'EUR' }}</royal-code-ui-paragraph>
            </div>
            <div class="flex justify-between text-sm">
              <royal-code-ui-paragraph color="muted">{{ 'checkout.orderSummary.shippingCosts' | translate }}</royal-code-ui-paragraph>
              <royal-code-ui-paragraph>{{ cart.shippingCost | currency:'EUR' }}</royal-code-ui-paragraph>
            </div>
            <div class="flex justify-between text-base font-bold text-primary pt-2 border-t border-dashed border-border/50">
              <royal-code-ui-paragraph>{{ 'checkout.orderSummary.total' | translate }}</royal-code-ui-paragraph>
              <royal-code-ui-paragraph>{{ cart.totalWithShipping | currency:'EUR' }}</royal-code-ui-paragraph>
            </div>
          </div>
        }

        <!-- Contextual Error Message on Submission Failure -->
        @if (submissionError(); as error) {
          <div class="p-3 bg-error/10 text-error border border-error/20 rounded-md text-sm text-center">
            <p>{{ error }}</p>
          </div>
        }

        <!-- Submit Button -->
        <div>
          <royal-code-ui-button
            type="primary"
            sizeVariant="lg"
            (clicked)="submitOrder()"
            [disabled]="!canSubmit() || isSubmitting()"
            
            [useHueGradient]="true"
            [enableNeonEffect]="true">
            @if (isSubmitting()) {
              <royal-code-ui-spinner size="md" />
            } @else {
              <span>{{ 'checkout.review.confirmAndPayButton' | translate }}</span>
            }
          </royal-code-ui-button>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutReviewStepComponent {
  protected readonly facade = inject(CheckoutFacade);
  protected readonly cartFacade = inject(CartFacade);
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  /**
   * @description Internal mapping to derive display data (name key, icon) from a payment method ID.
   *              This keeps display logic co-located within the component.
   */
private readonly paymentMethodMap = {
    banktransfer: { nameKey: 'checkout.payment.methods.banktransfer.name', icon: AppIcon.Banknote, isRecommended: true },
    paypal: { nameKey: 'checkout.payment.methods.paypal.name', icon: AppIcon.Wallet },
    // ideal: { nameKey: 'checkout.payment.methods.ideal.name', icon: AppIcon.Banknote },
    // creditcard: { nameKey: 'checkout.payment.methods.creditcard.name', icon: AppIcon.CreditCard },
  };


  readonly cartViewModel = this.cartFacade.viewModel;
  readonly shippingAddress = computed(() => this.facade.viewModel().shippingAddress);
  readonly paymentMethodId = computed(() => this.facade.viewModel().paymentMethodId);
  readonly isSubmitting = computed(() => this.facade.viewModel().isSubmittingOrder);
  readonly submissionError = computed(() => this.facade.viewModel().error);

  /**
   * @description Signal that computes the display data for the selected payment method.
   * @returns An object with the name key and icon for the selected method, or null if none is selected.
   */
  readonly paymentMethod = computed(() => {
    const id = this.paymentMethodId();
    if (!id || !(id in this.paymentMethodMap)) return null;
    return this.paymentMethodMap[id as keyof typeof this.paymentMethodMap];
  });

  /**
   * @description Signal that determines if the user can proceed with submitting the order.
   * @returns `true` if both a shipping address and a payment method have been selected, otherwise `false`.
   */
  readonly canSubmit = computed(() => !!this.shippingAddress() && !!this.paymentMethodId());

  // =================================================================================================
  // 5. PUBLIC METHODS (EVENT HANDLERS)
  // =================================================================================================

  /**
   * @method goToStep
   * @description Navigates the user to a previous step in the checkout process by dispatching an action.
   * @param {'shipping' | 'payment'} step - The target step to navigate to.
   * @returns {void}
   */
  goToStep(step: 'shipping' | 'payment'): void {
    this.facade.goToStep(step);
  }

  /**
   * @method submitOrder
   * @description Initiates the order submission process by dispatching an action.
   *              A guard prevents submission if not all required information is present.
   * @returns {void}
   */
  submitOrder(): void {
    if (!this.canSubmit()) return;
    this.facade.submitOrder();
  }
}
