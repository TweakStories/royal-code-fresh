// --- VERVANG VOLLEDIG BLOK: interface PaymentMethod { ... } in libs/features/checkout/ui-plushie/src/lib/components/checkout-payment-step/checkout-payment-step.component.ts ---
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AppIcon } from '@royal-code/shared/domain';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { CheckoutFacade } from '@royal-code/features/checkout/core';
import { UiBadgeComponent } from '@royal-code/ui/badge'; // Importeer UiBadgeComponent

interface PaymentMethod {
  id: string;
  nameKey: string;
  icon: AppIcon;
  descriptionKey: string;
  isRecommended?: boolean; // TOEGEVOEGD
}
// --- VERVANG HET BLOK: protected readonly paymentMethods: PaymentMethod[] = [ ... ] IN libs/features/checkout/ui-plushie/src/lib/components/checkout-payment-step/checkout-payment-step.component.ts ---
// EN VOEG TOE: UiBadgeComponent aan imports array
// En update de template om de badge te tonen
@Component({
  selector: 'plushie-royal-code-checkout-payment-step',
  standalone: true,
  imports: [
    TranslateModule,
    UiTitleComponent,
    UiParagraphComponent,
    UiButtonComponent,
    UiIconComponent,
    UiBadgeComponent // TOEGEVOEGD
],
  template: `
    <section class="rounded-xs border border-border p-4 sm:p-6">
      <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'checkout.payment.title' | translate" />
      <royal-code-ui-paragraph color="muted" extraClasses="mt-2 mb-6">
        {{ 'checkout.payment.description' | translate }}
      </royal-code-ui-paragraph>

      <div class="space-y-4">
        @for (method of paymentMethods; track method.id) {
          <button
            type="button"
            class="w-full flex items-center gap-4 rounded-xs border-2 p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            [class.border-primary]="selectedMethodId() === method.id"
            [class.bg-surface-alt]="selectedMethodId() === method.id"
            [class.border-border]="selectedMethodId() !== method.id"
            (click)="selectMethod(method.id)"
            [attr.aria-pressed]="selectedMethodId() === method.id"
          >
            <royal-code-ui-icon [icon]="method.icon" sizeVariant="lg" extraClass="text-primary w-8 h-8 flex-shrink-0" />
            <div class="flex-grow flex items-center gap-2"> <!-- Flex container voor naam en badge -->
              <royal-code-ui-paragraph extraClasses="font-semibold pointer-events-none">{{ method.nameKey | translate }}</royal-code-ui-paragraph>
              @if (method.isRecommended) {
                <royal-code-ui-badge color="primary" size="sm">{{ 'common.recommended' | translate }}</royal-code-ui-badge>
              }
            </div>
            <royal-code-ui-paragraph size="sm" color="muted" extraClasses="pointer-events-none">
                {{ method.descriptionKey | translate }}
            </royal-code-ui-paragraph>
          </button>
        }
      </div>

      <div class="mt-8 pt-6 border-t border-border">
        <royal-code-ui-button
          type="primary"
          [disabled]="!selectedMethodId()"
          (clicked)="onSubmit()">
          <royal-code-ui-icon [icon]="AppIcon.ArrowRight" extraClass="mr-2" />
          <span>{{ 'checkout.payment.continueButton' | translate }}</span>
        </royal-code-ui-button>
      </div>
    </section>
  `,
  styles: [` :host { display: block; } `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPaymentStepComponent {
  private readonly checkoutFacade = inject(CheckoutFacade);

  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  protected readonly selectedMethodId = signal<string | null>(this.checkoutFacade.viewModel().paymentMethodId);

  // FIX: Banktransfer bovenaan en gemarkeerd als aanbevolen
  protected readonly paymentMethods: PaymentMethod[] = [
    { id: 'banktransfer', nameKey: 'checkout.payment.methods.banktransfer.name', icon: AppIcon.Banknote, descriptionKey: 'checkout.payment.methods.banktransfer.description', isRecommended: true },
    { id: 'paypal', nameKey: 'checkout.payment.methods.paypal.name', icon: AppIcon.Wallet, descriptionKey: 'checkout.payment.methods.paypal.description' },
    // { id: 'ideal', nameKey: 'checkout.payment.methods.ideal.name', icon: AppIcon.Banknote, descriptionKey: 'checkout.payment.methods.ideal.description' },
    // { id: 'creditcard', nameKey: 'checkout.payment.methods.creditcard.name', icon: AppIcon.CreditCard, descriptionKey: 'checkout.payment.methods.creditcard.description' },
  ];

  selectMethod(methodId: string): void {
    this.selectedMethodId.set(methodId);
  }

  onSubmit(): void {
    const selectedId = this.selectedMethodId();
    if (selectedId) {
      this.checkoutFacade.setPaymentMethod(selectedId);
    }
  }
}