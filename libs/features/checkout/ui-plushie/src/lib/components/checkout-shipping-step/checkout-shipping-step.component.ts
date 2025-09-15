/**
 * @file checkout-shipping-step.component.ts
 * @Version 33.0.0 (IMPROVED UX: Registration Form + Always Visible Shipping Methods)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description
 *   Verbeterde implementatie van de shipping step met:
 *   - Altijd zichtbare shipping methods (disabled totdat adres is ingevuld)
 *   - Inline registratie form voor anonieme gebruikers
 *   - Verbeterde UX voor adres aanmaken bij ingelogde gebruikers
 *   - Correcte edit/delete button zichtbaarheid
 */
import { Component, ChangeDetectionStrategy, inject, viewChild, computed, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserFacade } from '@royal-code/store/user';
import { AuthFacade } from '@royal-code/store/auth';
import { CheckoutFacade } from '@royal-code/features/checkout/core';
import { AddressManagerComponent } from '@royal-code/ui/forms';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { Address, AppIcon, AddressSubmitEvent} from '@royal-code/shared/domain';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { AddressFormComponent } from '@royal-code/ui/forms';
import { NotificationService } from '@royal-code/ui/notifications';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegisterCredentials } from '@royal-code/auth/domain';

@Component({
  selector: 'plushie-royal-code-checkout-shipping-step',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, CurrencyPipe,
    AddressManagerComponent, UiTitleComponent, UiParagraphComponent, TranslateModule,
    UiIconComponent, UiSpinnerComponent, UiButtonComponent, UiInputComponent
  ],
  template: `
    <section class="rounded-lg border border-border p-4 sm:p-6 space-y-6">
      <!-- Verzendadres Sectie -->
      <div>
        <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'checkout.shipping.title' | translate" />
        <royal-code-ui-paragraph color="muted" extraClasses="mt-2 mb-6">
          {{ 'checkout.shipping.description' | translate }}
        </royal-code-ui-paragraph>

        <!-- Address Manager -->
        <royal-code-ui-address-manager
          #addressManager
          [addresses]="userFacade.addresses()"
          [initialAddress]="checkoutFacade.viewModel().shippingAddress ?? undefined"
          [isLoggedIn]="userFacade.isLoggedIn()"
          [showAddAddressForm]="!userFacade.isLoggedIn() || showInlineAddressForm()"
          [showSubmitButton]="true"
          [showSaveAddressToggle]="false"
          [submitButtonTextKey]="getSubmitButtonTextKey()"
          [showEditAndDeleteActions]="userFacade.isLoggedIn()"
          [alwaysShowActions]="userFacade.isLoggedIn()"
          (addressSelected)="onAddressSelected($event)"
          (addressSubmitted)="onAddressSubmitted($event)"
          (editAddressClicked)="onEditAddress($event)"
          (deleteAddressClicked)="onDeleteAddress($event)"
          (addAddressCardClicked)="onAddNewAddressClick()"
        />

        <!-- Account aanmaken optie ONDER het adres form (alleen voor anonieme gebruikers) -->
        @if (!userFacade.isLoggedIn() && !showRegistrationForm()) {
          <div class="mt-6 p-4 bg-surface-alt rounded-lg border border-border">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-foreground">{{ 'checkout.shipping.registration.title' | translate }}</h3>
                <p class="text-sm text-secondary mt-1">{{ 'checkout.shipping.registration.description' | translate }}</p>
              </div>
              <royal-code-ui-button type="primary" (clicked)="toggleRegistrationForm()">
                {{ 'checkout.shipping.registration.button' | translate }}
              </royal-code-ui-button>
            </div>
          </div>
        }

        <!-- Inline Registratie Form -->
        @if (!userFacade.isLoggedIn() && showRegistrationForm()) {
          <div class="mt-6 p-4 bg-surface-alt rounded-lg border border-primary">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-foreground">{{ 'checkout.shipping.registration.formTitle' | translate }}</h3>
              <royal-code-ui-button type="transparent" sizeVariant="icon" (clicked)="toggleRegistrationForm()">
                <royal-code-ui-icon [icon]="AppIcon.X" />
              </royal-code-ui-button>
            </div>
            
            <form [formGroup]="registrationForm" (ngSubmit)="onRegisterSubmit()" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <royal-code-ui-input 
                  formControlName="firstName" 
                  [label]="'auth.register.firstName' | translate" 
                  [required]="true" />
                <royal-code-ui-input 
                  formControlName="lastName" 
                  [label]="'auth.register.lastName' | translate" 
                  [required]="true" />
              </div>
              <royal-code-ui-input 
                formControlName="email" 
                [label]="'auth.register.email' | translate" 
                [required]="true" 
                type="email" />
              <royal-code-ui-input 
                formControlName="password" 
                [label]="'auth.register.password' | translate" 
                [required]="true" 
                type="password" />
              
              <div class="flex justify-end gap-2 pt-2">
                <royal-code-ui-button type="default" (clicked)="toggleRegistrationForm()">
                  {{ 'common.buttons.cancel' | translate }}
                </royal-code-ui-button>
                <royal-code-ui-button 
                  type="primary" 
                  htmlType="submit" 
                  [disabled]="registrationForm.invalid || isRegistering()">
                  @if (isRegistering()) {
                    <royal-code-ui-spinner size="sm" class="mr-2" />
                  }
                  {{ 'auth.register.submit' | translate }}
                </royal-code-ui-button>
              </div>
            </form>
          </div>
        }

        <!-- Nieuw Adres Toevoegen button voor ingelogde gebruikers -->
        @if (userFacade.isLoggedIn() && !showInlineAddressForm()) {
          <div class="mt-4 flex justify-center">
            <royal-code-ui-button type="secondary" (clicked)="toggleInlineAddressForm()">
              <royal-code-ui-icon [icon]="AppIcon.Plus" extraClass="mr-2" />
              {{ 'checkout.shipping.addNewAddress' | translate }}
            </royal-code-ui-button>
          </div>
        }
      </div>

      <!-- Verzendmethoden Sectie - Altijd zichtbaar -->
      <div class="border-t border-border pt-6">
        <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'checkout.shipping.methods.title' | translate" />
        
        @if (!hasValidShippingAddress()) {
          <royal-code-ui-paragraph color="muted" extraClasses="mt-2 mb-4">
            {{ 'checkout.shipping.methods.selectAddressFirst' | translate }}
          </royal-code-ui-paragraph>
          <!-- Placeholder shipping methods voor visuele feedback -->
          <div class="mt-4 space-y-4 opacity-30">
            @for (placeholder of placeholderMethods; track $index) {
              <div class="flex items-center gap-4 rounded-xs border-2 border-border p-4">
                <div class="h-4 w-4 rounded-full border-2 border-border"></div>
                <div class="flex-grow">
                  <div class="h-4 bg-border rounded mb-2" [style.width.%]="placeholder.nameWidth"></div>
                  <div class="h-3 bg-border rounded" [style.width.%]="placeholder.descWidth"></div>
                </div>
                <div class="h-4 w-16 bg-border rounded"></div>
              </div>
            }
          </div>
        } @else if (checkoutFacade.viewModel().isLoadingShippingMethods) {
          <div class="flex items-center justify-center p-8">
            <royal-code-ui-spinner />
            <span class="ml-2 text-secondary">{{ 'checkout.shipping.methods.loading' | translate }}</span>
          </div>
        } @else if (checkoutFacade.viewModel().shippingMethods.length > 0) {
          <div class="mt-4 space-y-4">
            @for (method of checkoutFacade.viewModel().shippingMethods; track method.id) {
              <label
                class="flex items-center gap-4 rounded-xs border-2 p-4 text-left transition-all cursor-pointer"
                [class.border-primary]="selectedShippingMethodId() === method.id"
                [class.bg-surface-alt]="selectedShippingMethodId() === method.id"
                [class.border-border]="selectedShippingMethodId() !== method.id">
                <input 
                  type="radio" 
                  name="shippingMethod" 
                  [value]="method.id" 
                  [checked]="selectedShippingMethodId() === method.id" 
                  (change)="onShippingMethodSelected(method.id)" 
                  class="h-4 w-4 border-gray-300 text-primary focus:ring-primary" />
                <div class="flex-grow">
                  <p class="font-semibold text-foreground">{{ method.name }}</p>
                  <p class="text-sm text-secondary">{{ method.description }} ({{ method.estimatedDeliveryTime }})</p>
                </div>
                <p class="font-semibold text-foreground">{{ method.cost | currency:'EUR' }}</p>
              </label>
            }
          </div>
        } @else {
          <div class="text-center p-8">
            <royal-code-ui-icon [icon]="AppIcon.Truck" sizeVariant="xl" extraClasses="text-muted mb-2" />
            <p class="text-sm text-secondary">{{ 'checkout.shipping.methods.noMethods' | translate }}</p>
          </div>
        }
      </div>

      <!-- Continue Button -->
      <div class="border-t border-border pt-6 flex justify-end">
        <royal-code-ui-button 
          type="primary" 
          (clicked)="onContinueToPayment()"
          [disabled]="!canContinueToPayment()">
          {{ 'checkout.shipping.form.continueButton' | translate }}
        </royal-code-ui-button>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutShippingStepComponent implements OnInit {
  protected readonly userFacade = inject(UserFacade);
  protected readonly authFacade = inject(AuthFacade);
  protected readonly checkoutFacade = inject(CheckoutFacade);
  protected readonly fb = inject(FormBuilder);
  private readonly overlayService = inject(DynamicOverlayService);
  private readonly notificationService = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  addressManager = viewChild.required(AddressManagerComponent);
  
  // Component state
  protected readonly showRegistrationForm = signal(false);
  protected readonly showInlineAddressForm = signal(false);
  protected readonly isRegistering = signal(false);
  protected readonly pendingAddressAfterRegistration = signal<Address | null>(null);

  // Computed properties
  readonly selectedShippingMethodId = computed(() => 
    this.checkoutFacade.viewModel().selectedShippingMethodId
  );

  readonly hasValidShippingAddress = computed(() => 
    !!this.checkoutFacade.viewModel().shippingAddress
  );

  readonly canContinueToPayment = computed(() => 
    this.hasValidShippingAddress() && !!this.selectedShippingMethodId()
  );

  // Placeholder data voor shipping methods
  protected readonly placeholderMethods = [
    { nameWidth: 60, descWidth: 80 },
    { nameWidth: 45, descWidth: 75 },
    { nameWidth: 70, descWidth: 85 }
  ];

  // Registration form
  protected registrationForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit(): void {
    // Load shipping methods altijd tonen (ook zonder adres voor placeholder)
    this.initializeShippingMethods();
    
    // Watch voor auth status changes
    this.authFacade.isAuthenticated$.subscribe(isAuth => {
      if (isAuth && this.pendingAddressAfterRegistration()) {
        this.savePendingAddress();
      }
    });

    // Initialize address manager voor anonieme gebruikers
    if (!this.userFacade.isLoggedIn()) {
      setTimeout(() => this.addressManager().resetForm(), 0);
    }
  }

  protected getSubmitButtonTextKey(): string {
    if (!this.userFacade.isLoggedIn()) {
      return 'checkout.shipping.form.saveAddressButton';
    }
    return this.showInlineAddressForm() 
      ? 'checkout.shipping.form.saveAddressButton'
      : 'checkout.shipping.form.selectAddressButton';
  }

  private initializeShippingMethods(): void {
    const currentAddress = this.checkoutFacade.viewModel().shippingAddress;
    if (currentAddress) {
      this.loadShippingMethodsForAddress(currentAddress);
    }
  }

  // Registration methods
  protected toggleRegistrationForm(): void {
    this.showRegistrationForm.set(!this.showRegistrationForm());
    if (!this.showRegistrationForm()) {
      this.registrationForm.reset();
    }
  }

  protected onRegisterSubmit(): void {
    if (this.registrationForm.invalid) return;

    this.isRegistering.set(true);
    const formValue = this.registrationForm.getRawValue();
    
    const credentials: RegisterCredentials = {
      email: formValue.email!,
      password: formValue.password!,
      firstName: formValue.firstName!,
      lastName: formValue.lastName!,
      displayName: `${formValue.firstName} ${formValue.lastName}`.trim()
    };

    this.authFacade.register(credentials);
    
    // Reset form and hide registration after submission
    setTimeout(() => {
      this.registrationForm.reset();
      this.showRegistrationForm.set(false);
      this.isRegistering.set(false);
    }, 1000);
  }

  // Address methods
  protected toggleInlineAddressForm(): void {
    this.showInlineAddressForm.set(!this.showInlineAddressForm());
  }

  protected onAddNewAddressClick(): void {
    if (this.userFacade.isLoggedIn()) {
      // Voor ingelogde gebruikers: toon inline form (niet overlay)
      this.toggleInlineAddressForm();
    } else {
      // Voor anonieme gebruikers: scroll naar form
      this.addressManager().resetForm();
    }
  }

  onAddressSelected(address: Address): void {
    this.checkoutFacade.setShippingAddress(address, false, false);
    this.loadShippingMethodsForAddress(address);
    this.showInlineAddressForm.set(false);
  }

  onAddressSubmitted(event: AddressSubmitEvent): void {
    if (!this.userFacade.isLoggedIn() && event.shouldSave) {
      // Store address om later op te slaan na registratie
      this.pendingAddressAfterRegistration.set(event.address);
      this.notificationService.showInfo(
        this.translate.instant('checkout.shipping.registration.addressWillBeSaved')
      );
    }

    this.checkoutFacade.setShippingAddress(event.address, event.shouldSave, false);
    this.loadShippingMethodsForAddress(event.address);
    
    setTimeout(() => {
      this.addressManager().resetForm();
      this.showInlineAddressForm.set(false);
    }, 0);
  }

  private savePendingAddress(): void {
    const pendingAddress = this.pendingAddressAfterRegistration();
    if (pendingAddress) {
      this.userFacade.createAddress(pendingAddress);
      this.pendingAddressAfterRegistration.set(null);
      this.notificationService.showSuccess(
        this.translate.instant('checkout.shipping.addressSavedAfterRegistration')
      );
    }
  }

  private loadShippingMethodsForAddress(address: Address): void {
    if (address.id) {
      this.checkoutFacade.loadShippingMethods({ shippingAddressId: address.id });
    } else {
      this.checkoutFacade.loadShippingMethods({ address });
    }
  }

  // Shipping method selection
  onShippingMethodSelected(methodId: string): void {
    if (this.hasValidShippingAddress()) {
      this.checkoutFacade.setShippingMethod(methodId);
    }
  }

  // Navigation
  onContinueToPayment(): void {
    const vm = this.checkoutFacade.viewModel();
    
    if (!vm.shippingAddress) {
      this.notificationService.showError(
        this.translate.instant('checkout.notifications.selectAddress')
      );
      return;
    }
    
    if (!vm.selectedShippingMethodId) {
      this.notificationService.showError(
        this.translate.instant('checkout.notifications.selectShippingMethod')
      );
      return;
    }

    this.checkoutFacade.goToStep('payment');
  }

  // Overlay methods voor ingelogde gebruikers
  openAddAddressOverlay(): void {
    const overlayRef = this.overlayService.open({
      component: AddressFormComponent,
      data: { 
        address: undefined,
        isLoggedIn: this.userFacade.isLoggedIn(),
        showSaveAddressToggle: false // Altijd opslaan voor ingelogde gebruikers
      },
      panelClass: ['flex', 'items-center', 'justify-center', 'p-4', 'sm:p-0'],
      backdropType: 'dark', 
      mobileFullscreen: true
    });
    
    overlayRef.afterClosed$.subscribe((result?: { address: Address, shouldSave: boolean } | null) => {
      if (result) {
        this.userFacade.createAddress(result.address);
        this.checkoutFacade.setShippingAddress(result.address, true, false);
        this.loadShippingMethodsForAddress(result.address);
      }
    });
  }

  onEditAddress(address: Address): void {
    const overlayRef = this.overlayService.open({
      component: AddressFormComponent,
      data: { 
        address,
        isLoggedIn: this.userFacade.isLoggedIn(),
        showSaveAddressToggle: false
      },
      panelClass: ['flex', 'items-center', 'justify-center', 'p-4', 'sm:p-0'],
      backdropType: 'dark', 
      mobileFullscreen: true
    });
    
    overlayRef.afterClosed$.subscribe((updatedAddress?: Address | null) => {
      if (updatedAddress?.id) {
        this.userFacade.updateAddress(updatedAddress.id, updatedAddress);
        this.checkoutFacade.setShippingAddress(updatedAddress, false, false);
        this.loadShippingMethodsForAddress(updatedAddress);
      }
    });
  }

  onDeleteAddress(id: string): void {
    this.notificationService.showConfirmationDialog({
      titleKey: 'checkout.shipping.delete.title', 
      messageKey: 'checkout.shipping.delete.message',
      confirmButtonKey: 'common.buttons.delete', 
      cancelButtonKey: 'common.buttons.cancel',
      confirmButtonType: 'theme-fire',
    }).subscribe(confirmed => {
      if (confirmed) {
        this.userFacade.deleteAddress(id);
        
        // Reset shipping address als het verwijderde adres geselecteerd was
        const currentAddress = this.checkoutFacade.viewModel().shippingAddress;
        if (currentAddress?.id === id) {
          this.checkoutFacade.setShippingAddress(null, false, false);
        }
      }
    });
  }
}