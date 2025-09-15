/**
 * @file checkout-page.component.ts
 * @Version 3.0.0 (i18n Integration)
 * @Description
 *   De hoofd containercomponent voor de checkout. Orkestreert de stappen,
 *   toont de progressie en de navigatieknoppen. Nu met i18n.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CartFacade } from '@royal-code/features/cart/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { OrderSummaryComponent } from '../../components/order-summary/order-summary.component';
import { CheckoutShippingStepComponent } from '../../components/checkout-shipping-step/checkout-shipping-step.component';
import { CheckoutPaymentStepComponent } from '../../components/checkout-payment-step/checkout-payment-step.component';
import { CheckoutReviewStepComponent } from '../../components/checkout-review-step/checkout-review-step.component';
import { CheckoutProgressComponent } from '../../components/checkout-progress/checkout-progress.component';
import { UiButtonComponent } from '@royal-code/ui/button';
import { AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { CheckoutFacade, CheckoutStep } from '@royal-code/features/checkout/core';

@Component({
  selector: 'plushie-royal-code-checkout-page',
  standalone: true,
  imports: [
    TranslateModule,
    UiTitleComponent,
    UiButtonComponent,
    OrderSummaryComponent,
    CheckoutShippingStepComponent,
    CheckoutPaymentStepComponent,
    CheckoutReviewStepComponent,
    CheckoutProgressComponent,
    UiIconComponent
],
  template: `
    <div class="container mx-auto px-4 py-6 lg:py-8">
      <div class="mb-6 lg:mb-8">
        <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="'checkout.pageTitle' | translate" extraClasses="mb-4" />
           <plushie-royal-code-checkout-progress
            [activeStep]="checkoutViewModel().activeStep"
            [completedSteps]="checkoutViewModel().completedSteps"
            [canProceedToPayment]="checkoutViewModel().canProceedToPayment"
            [canProceedToReview]="checkoutViewModel().canProceedToReview"
            (stepClicked)="onStepSelected($event)"
          />
      </div>
      <div class="grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-3">
        <main class="lg:col-span-2 space-y-8">
          @switch (checkoutViewModel().activeStep) {
            @case ('shipping') { <plushie-royal-code-checkout-shipping-step /> }
            @case ('payment') { <plushie-royal-code-checkout-payment-step /> }
            @case ('review') { <plushie-royal-code-checkout-review-step /> }
          }
          <div class="flex items-center justify-between border-t border-border pt-6">
            @if (checkoutViewModel().activeStep !== 'shipping') {
              <royal-code-ui-button type="outline" (clicked)="goBack()">
                <royal-code-ui-icon [icon]="AppIcon.ArrowLeft" extraClass="mr-2" />
                <span>{{ 'checkout.previousStep' | translate }}</span>
              </royal-code-ui-button>
            } @else {
              <royal-code-ui-button type="transparent" (clicked)="router.navigate(['/cart'])">
                <royal-code-ui-icon [icon]="AppIcon.ArrowLeft" extraClass="mr-2" />
                <span>{{ 'checkout.backToCart' | translate }}</span>
              </royal-code-ui-button>
            }
          </div>
        </main>
        <plushie-royal-code-order-summary [summary]="cartViewModel()" />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPageComponent implements OnInit {
  private readonly cartFacade = inject(CartFacade);
  protected readonly checkoutFacade = inject(CheckoutFacade);
  protected readonly router = inject(Router);

  readonly cartViewModel = this.cartFacade.viewModel;
  readonly checkoutViewModel = this.checkoutFacade.viewModel;

  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  ngOnInit(): void {
    this.checkoutFacade.initialize();
  }

  onStepSelected(step: CheckoutStep): void {
    this.checkoutFacade.goToStep(step);
  }


  goBack(): void {
    const currentStep = this.checkoutViewModel().activeStep;
    const previousStep: CheckoutStep = currentStep === 'review' ? 'payment' : 'shipping';
    this.checkoutFacade.goToStep(previousStep);
  }
}
