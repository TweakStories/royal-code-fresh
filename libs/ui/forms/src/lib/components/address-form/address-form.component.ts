import { Component, ChangeDetectionStrategy, inject, booleanAttribute, input, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Address, AddressFormData, AddressFormOverlayResult, AppIcon } from '@royal-code/shared/domain';
import { DYNAMIC_OVERLAY_DATA, DYNAMIC_OVERLAY_REF, DynamicOverlayRef } from '@royal-code/ui/overlay';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';


@Component({
  selector: 'royal-code-ui-address-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, UiButtonComponent, UiInputComponent, UiSpinnerComponent],
  template: `
    <form novalidate="" [formGroup]="addressForm" (ngSubmit)="onSubmit()" class="w-full max-w-lg">
  <h2 class="text-xl font-bold mb-4">{{ addressToEdit() ? ('checkout.shipping.editAddressTitle' | translate) : ('checkout.shipping.addAddressTitle' | translate) }}</h2>
  <div class="space-y-4">
    <royal-code-ui-input formcontrolname="contactName" [label]="'checkout.shipping.form.contactName' | translate" [required]="true" />
    <royal-code-ui-input formcontrolname="street" [label]="'checkout.shipping.form.street' | translate" [required]="true" />
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <royal-code-ui-input formcontrolname="houseNumber" extraContainerClasses="sm:col-span-1" [label]="'checkout.shipping.form.houseNumber' | translate" [required]="true" />
      <royal-code-ui-input formcontrolname="addressAddition" extraContainerClasses="sm:col-span-2" [label]="'checkout.shipping.form.addressAddition' | translate" />
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <royal-code-ui-input formcontrolname="postalCode" extraContainerClasses="sm:col-span-1" [label]="'checkout.shipping.form.postalCode' | translate" [required]="true" />
      <royal-code-ui-input formcontrolname="city" extraContainerClasses="sm:col-span-2" [label]="'checkout.shipping.form.city' | translate" [required]="true" />
    </div>
    <royal-code-ui-input formcontrolname="countryCode" [label]="'checkout.shipping.form.country' | translate" [required]="true" />
    <royal-code-ui-input formcontrolname="phoneNumber" [label]="'checkout.shipping.form.phoneNumber' | translate" />
    <royal-code-ui-input formcontrolname="email" type="email" [label]="'checkout.shipping.form.email' | translate" [required]="true" />
    <royal-code-ui-input formcontrolname="companyName" [label]="'checkout.shipping.form.companyName' | translate" />
    <royal-code-ui-input formcontrolname="deliveryInstructions" [label]="'checkout.shipping.form.deliveryInstructions' | translate" />
  </div>

  @if (showSaveAddressToggle()) {
    <div class="flex items-center mt-6">
      <input type="checkbox" id="saveAddress" [formControl]="saveAddressControl" class="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
      <label for="saveAddress" class="ml-2 block text-sm text-foreground">
        {{ 'checkout.shipping.form.saveAddressCheckbox' | translate }}
      </label>
    </div>
  }

  <div class="flex justify-end gap-2 mt-6">
    <royal-code-ui-button type="default" (clicked)="overlayRef.close()">
      {{ 'common.buttons.cancel' | translate }}
    </royal-code-ui-button>
    <royal-code-ui-button type="primary" htmlType="submit" [disabled]="addressForm.invalid || isSubmitting()">
      @if (isSubmitting()) {
        <royal-code-ui-spinner size="sm" />
      } @else {
        <span>{{ submitButtonTextKey() | translate }}</span>
      }
    </royal-code-ui-button>
  </div>
</form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressFormComponent implements OnInit {
  // === Dependencies ===
  private readonly fb = inject(FormBuilder);
  public readonly overlayRef: DynamicOverlayRef<AddressFormOverlayResult | null> = inject(DYNAMIC_OVERLAY_REF);
  private readonly overlayData: AddressFormData | null = inject(DYNAMIC_OVERLAY_DATA, { optional: true });

  // === Inputs (nu als Signalen) ===
  // FIX: showSaveAddressToggle en isLoggedIn worden nu uit de overlayData gehaald
  readonly showSaveAddressToggle = computed(() => this.overlayData?.showSaveAddressToggle ?? false);
  readonly isLoggedIn = computed(() => this.overlayData?.isLoggedIn ?? false);
  readonly submitButtonTextKey = input<string>('common.buttons.save');
  readonly isSubmitting = input(false, { transform: booleanAttribute });

  // === Formulier Definitie ===
  // FIX: saveAddressControl is nu een computed property of wordt elders beheerd.
  // We kunnen de state hier lokaal bijhouden.
  readonly _saveAddressValue = signal(true); // Lokale state voor de checkbox
  readonly saveAddressControl = new FormControl(true); // Wordt nog steeds gebruikt voor form binding

  readonly addressForm = this.fb.group({
    id: [''],
    contactName: ['', Validators.required],
    street: ['', Validators.required],
    houseNumber: ['', Validators.required],
    addressAddition: [''],
    postalCode: ['', Validators.required],
    city: ['', Validators.required],
    countryCode: ['NL', Validators.required], // Default naar NL
    phoneNumber: [''],
    email: ['', [Validators.required, Validators.email]],
    companyName: [''],
    deliveryInstructions: [''],
    isDefaultShipping: [false],
    isDefaultBilling: [false],
  });

  ngOnInit(): void {
    if (this.addressToEdit()) {
      this.addressForm.patchValue(this.addressToEdit() as Address);
    }
    this.saveAddressControl.setValue(this.showSaveAddressToggle());
  }

  readonly addressToEdit = computed(() => this.overlayData?.address);

  onSubmit(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }
    const result: AddressFormOverlayResult = {
      address: this.addressForm.getRawValue() as Address,
      shouldSave: this.saveAddressControl.value ?? false, // Zorg voor een fallback
    };
    this.overlayRef.close(result);
  }
}