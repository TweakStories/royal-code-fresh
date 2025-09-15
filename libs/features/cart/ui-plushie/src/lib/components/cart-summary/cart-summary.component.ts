/**
 * @file cart-summary.component.ts
 * @Version 2.0.0 (Type Fixes)
 */
import { Component, ChangeDetectionStrategy, input, output, InputSignal, OutputEmitterRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { TranslateModule } from '@ngx-translate/core';
import { CartSummary } from '@royal-code/features/cart/core';

@Component({
  selector: 'plushie-royal-code-cart-summary',
  standalone: true,
  imports: [CommonModule, UiButtonComponent, UiTitleComponent, UiParagraphComponent, UiSpinnerComponent, TranslateModule],
  template: `
    <div class="rounded-xs border border-border bg-surface-alt p-6">
      <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'checkout.orderSummary.title' | translate" />
      @if(summary(); as summaryData) {
        <div class="mt-6 space-y-2">

          <!-- Subtotaal -->
          <div class="flex items-center justify-between">
            <royal-code-ui-paragraph color="muted">{{ 'checkout.orderSummary.subtotal' | translate }}</royal-code-ui-paragraph>
            <royal-code-ui-paragraph extraClasses="font-medium">{{ summaryData.subTotal | currency:'EUR' }}</royal-code-ui-paragraph>
          </div>

          <!-- Korting (conditioneel) -->
          @if (summaryData.totalDiscountAmount > 0) {
            <div class="flex items-center justify-between">
              <royal-code-ui-paragraph color="muted">{{ 'checkout.orderSummary.discount' | translate }}</royal-code-ui-paragraph>
              <royal-code-ui-paragraph extraClasses="font-medium text-success">-{{ summaryData.totalDiscountAmount | currency:'EUR' }}</royal-code-ui-paragraph>
            </div>
          }

          <!-- Verzendkosten -->
          <div class="flex items-center justify-between">
            <royal-code-ui-paragraph color="muted">{{ 'checkout.orderSummary.shippingCosts' | translate }}</royal-code-ui-paragraph>
            @if (summaryData.isEligibleForFreeShipping) {
              <royal-code-ui-paragraph extraClasses="font-medium text-success">{{ 'checkout.orderSummary.freeShipping' | translate }}</royal-code-ui-paragraph>
            } @else {
              <royal-code-ui-paragraph extraClasses="font-medium">{{ summaryData.shippingCost | currency:'EUR' }}</royal-code-ui-paragraph>
            }
          </div>

          <!-- Totaal & BTW -->
          <div class="flex items-center justify-between border-t border-border pt-4 mt-2">
            <royal-code-ui-paragraph extraClasses="text-base font-semibold">{{ 'checkout.orderSummary.total' | translate }}</royal-code-ui-paragraph>
            <div class="text-right">
              <royal-code-ui-paragraph extraClasses="text-base font-semibold">{{ summaryData.totalWithShipping | currency:'EUR' }}</royal-code-ui-paragraph>
              @if (summaryData.totalVatAmount > 0) {
                <royal-code-ui-paragraph size="xs" color="muted">
                  {{ 'checkout.orderSummary.includingVat' | translate }} {{ summaryData.totalVatAmount | currency:'EUR' }}
                </royal-code-ui-paragraph>
              }
            </div>
          </div>
        </div>
      }
      <div class="mt-6">
        <royal-code-ui-button type="primary" sizeVariant="lg" [disabled]="isSubmitting()" (clicked)="checkoutClicked.emit()" >
          @if (isSubmitting()) {
            <royal-code-ui-spinner size="md" />
          } @else {
            <span>{{ 'shoppingCart.overview.checkout' | translate }}</span>
          }
        </royal-code-ui-button>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartSummaryComponent {
  readonly summary: InputSignal<CartSummary | undefined> = input<CartSummary | undefined>();
  readonly isSubmitting: InputSignal<boolean> = input(false);
  readonly checkoutClicked: OutputEmitterRef<void> = output<void>();
  protected readonly TitleTypeEnum = TitleTypeEnum;
}
