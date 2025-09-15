/**
 * @file address-manager.component.ts - UPDATED to hide add address card
 * @Version 14.0.0 (Hide Add Address Card Option)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description
 *   Updated AddressManagerComponent met optie om de "add address card" te verbergen
 *   voor gevallen waar een parent component eigen add-button heeft.
 */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, OnInit, signal, booleanAttribute } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AppIcon, Address, AddressSubmitEvent } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiCardComponent } from '@royal-code/ui/cards/card';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiCheckboxComponent, UiInputComponent } from '@royal-code/ui/input';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { NotificationService } from '@royal-code/ui/notifications';
import { UserFacade } from '@royal-code/store/user';



@Component({
  selector: 'royal-code-ui-address-manager',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, TranslateModule,
    UiButtonComponent, UiCardComponent, UiIconComponent, UiInputComponent,
    UiParagraphComponent, UiCheckboxComponent
  ],
  template: `
    <section class="space-y-6">
      <!-- Opgeslagen adressen (alleen voor ingelogde gebruikers) -->
      @if (isLoggedIn() && addresses().length > 0) {
        <div class="space-y-4">
          <royal-code-ui-paragraph color="muted">{{ 'checkout.shipping.selectSavedAddress' | translate }}</royal-code-ui-paragraph>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (address of addresses(); track address.id) {
              <royal-code-ui-button
                type="none"
                (clicked)="selectAddress(address)"
                [extraClasses]="'relative group/address w-full p-4 text-left border-2 ' + (isSelected(address) ? 'border-primary bg-surface-alt' : 'border-border')"
                [attr.aria-pressed]="isSelected(address)">
                <div>
                  <p class="font-semibold pointer-events-none">{{ address.contactName }}</p>
                  <p class="text-sm text-muted pointer-events-none">
                    {{ address.street }} {{ address.houseNumber }}<br>
                    @if (address.addressAddition) {
                      {{ address.addressAddition }}<br>
                    }
                    {{ address.postalCode }} {{ address.city }}
                  </p>
                </div>
                <div class="address-actions-desktop absolute top-2 right-2 flex items-center gap-1">
                  <royal-code-ui-button type="transparent" sizeVariant="icon" extraClasses="h-8 w-8 text-muted hover:!text-primary" (clicked)="$event.stopPropagation(); editAddressClicked.emit(address)">
                    <royal-code-ui-icon [icon]="AppIcon.Edit" sizeVariant="sm" />
                  </royal-code-ui-button>
                  <royal-code-ui-button type="transparent" sizeVariant="icon" extraClasses="h-8 w-8 text-muted hover:!text-error" (clicked)="$event.stopPropagation(); deleteAddressClicked.emit(address.id!)">
                    <royal-code-ui-icon [icon]="AppIcon.Trash2" sizeVariant="sm" />
                  </royal-code-ui-button>
                </div>
              </royal-code-ui-button>
            }
            <!-- Add address card - alleen tonen als showAddAddressCard = true -->
            @if (showAddAddressCard()) {
              <a (click)="onAddNewAddressCardClick()" class="block cursor-pointer group add-address-card">
                <royal-code-ui-card extraContentClasses="flex flex-col items-center justify-center p-6 text-center h-full border-2 border-dashed border-border hover:border-primary transition-colors" class="h-full">
                  <royal-code-ui-icon [icon]="AppIcon.Plus" sizeVariant="xl" extraClasses="text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <h3 class="text-lg font-semibold text-foreground">{{ 'account.addresses.addAddressTitle' | translate }}</h3>
                  <p class="text-sm text-secondary">{{ 'account.addresses.addAddressDescription' | translate }}</p>
                </royal-code-ui-card>
              </a>
            }
          </div>
          @if (isLoggedIn() && addresses().length > 0) {
            <div class="flex items-center justify-center pt-2">
              <div class="h-px flex-grow bg-border"></div>
              <royal-code-ui-paragraph size="sm" color="muted" extraClasses="px-4">{{ 'common.or' | translate }}</royal-code-ui-paragraph>
              <div class="h-px flex-grow bg-border"></div>
            </div>
          }
        </div>
      }

      <!-- Formulier voor nieuw adres of anonieme gebruiker -->
      @if (showAddAddressForm() || !isLoggedIn()) {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <royal-code-ui-input formControlName="contactName" [label]="'checkout.shipping.form.recipientName' | translate" [required]="true" />
          <royal-code-ui-input formControlName="street" [label]="'checkout.shipping.form.street' | translate" [required]="true" />
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <royal-code-ui-input formControlName="houseNumber" [label]="'checkout.shipping.form.houseNumber' | translate" [required]="true" extraContainerClasses="sm:col-span-1" />
            <royal-code-ui-input formControlName="addressAddition" [label]="'checkout.shipping.form.addressAddition' | translate" extraContainerClasses="sm:col-span-2" />
          </div>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <royal-code-ui-input formControlName="postalCode" [label]="'checkout.shipping.form.postalCode' | translate" [required]="true" extraContainerClasses="sm:col-span-1" />
            <royal-code-ui-input formControlName="city" [label]="'checkout.shipping.form.city' | translate" [required]="true" extraContainerClasses="sm:col-span-2" />
          </div>
          <royal-code-ui-input formControlName="countryCode" [label]="'checkout.shipping.form.country' | translate" [required]="true" />
          <royal-code-ui-input formControlName="phoneNumber" [label]="'checkout.shipping.form.phoneNumber' | translate" />
          <royal-code-ui-input formControlName="email" [label]="'checkout.shipping.form.email' | translate" [required]="true" />
          <royal-code-ui-input formControlName="companyName" [label]="'checkout.shipping.form.companyName' | translate" />
          <royal-code-ui-input formControlName="deliveryInstructions" [label]="'checkout.shipping.form.deliveryInstructions' | translate" />

          @if (showSaveAddressToggle()) {
            <div class="pt-4 space-y-2">
              <royal-code-ui-checkbox
                formControlName="saveAddress"
                [label]="'checkout.shipping.form.saveAddress' | translate"
                [disabled]="!isLoggedIn()" />
              @if (!isLoggedIn()) {
                <div class="p-3 bg-surface-alt rounded-md flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p class="text-sm text-secondary">{{ 'checkout.shipping.form.saveAddressForLoggedInUsers' | translate }}</p>
                  <royal-code-ui-button type="secondary" sizeVariant="sm" [routerLink]="['/register']" (clicked)="$event.stopPropagation()">
                    {{ 'auth.register.submit' | translate }}
                  </royal-code-ui-button>
                </div>
              }
            </div>
          }
          
          @if (showSubmitButton()) {
            <div class="pt-4 flex justify-end">
              <royal-code-ui-button type="primary" htmlType="submit" [disabled]="form.invalid">
                <royal-code-ui-icon [icon]="AppIcon.Plus" extraClass="mr-2" />
                <span>{{ submitButtonTextKey() | translate }}</span>
              </royal-code-ui-button>
            </div>
          }
        </form>
      }
    </section>
  `,
  styles: [`
    :host { display: block; }
    .group\\/address:hover .address-actions-desktop {
      opacity: 1;
    }
    .address-actions-desktop {
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
    }
    .add-address-card {
        height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressManagerComponent implements OnInit {
  // --- INPUTS ---
  readonly addresses = input.required<Address[]>();
  readonly initialAddress = input<Address | undefined>();
  readonly isLoggedIn = input.required<boolean>();
  readonly submitButtonTextKey = input.required<string>();
  readonly showSaveAddressToggle = input(true, { transform: booleanAttribute });
  readonly showEditAndDeleteActions = input(true, { transform: booleanAttribute });
  readonly alwaysShowActions = input(false, { transform: booleanAttribute });
  readonly showSubmitButton = input(true, { transform: booleanAttribute });
  readonly showAddAddressForm = input(false, { transform: booleanAttribute });
  
  // NEW: Input to control add address card visibility
  readonly showAddAddressCard = input(true, { transform: booleanAttribute });

  // --- OUTPUTS ---
  readonly addressSelected = output<Address>();
  readonly addressSubmitted = output<AddressSubmitEvent>();
  readonly editAddressClicked = output<Address>();
  readonly deleteAddressClicked = output<string>();
  readonly addAddressCardClicked = output<void>();

  // --- INTERNAL STATE ---
  protected readonly AppIcon = AppIcon;
  protected readonly TitleTypeEnum = TitleTypeEnum;

  protected readonly isEditing = signal(false);
  protected readonly selectedLocalAddress = signal<Address | undefined>(undefined);

  protected form = inject(FormBuilder).group({
    id: [null as string | null],
    contactName: ['', Validators.required],
    street: ['', Validators.required],
    houseNumber: ['', Validators.required],
    addressAddition: [null as string | null],
    postalCode: ['', Validators.required],
    city: ['', Validators.required],
    countryCode: ['', Validators.required],
    phoneNumber: [null as string | null],
    email: ['', [Validators.required, Validators.email]],
    companyName: [null as string | null],
    deliveryInstructions: [null as string | null],
    isDefaultShipping: [false as boolean | null],
    isDefaultBilling: [false as boolean | null],
    saveAddress: [false],
  });

  private readonly notificationService = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  private readonly userFacade = inject(UserFacade);

  ngOnInit(): void {
    if (this.initialAddress()) {
      this.selectedLocalAddress.set(this.initialAddress());
      this.patchFormWithAddress(this.initialAddress()!);
      this.isEditing.set(false);
    }
  }

  isSelected(address: Address): boolean {
    return this.selectedLocalAddress()?.id === address.id;
  }

  selectAddress(address: Address): void {
    this.selectedLocalAddress.set(address);
    this.addressSelected.emit(address);
    this.isEditing.set(false);
    this.resetForm();
  }

  onAddNewAddressCardClick(): void {
    this.resetForm();
    this.isEditing.set(false);
    this.addAddressCardClicked.emit();
  }

  onEditAddress(address: Address): void {
    this.patchFormWithAddress(address);
    this.isEditing.set(true);
    this.selectedLocalAddress.set(address);
    this.editAddressClicked.emit(address);
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.notificationService.showError(this.translate.instant('common.messages.error'));
      return;
    }
    const formValue = this.form.getRawValue();
    const shouldSave = formValue.saveAddress ?? false;
    const address: Address = {
      id: formValue.id || '',
      userId: this.userFacade.profile()?.id,
      contactName: formValue.contactName!,
      street: formValue.street!,
      houseNumber: formValue.houseNumber!,
      addressAddition: formValue.addressAddition,
      postalCode: formValue.postalCode!,
      city: formValue.city!,
      countryCode: formValue.countryCode!,
      phoneNumber: formValue.phoneNumber,
      email: formValue.email!,
      companyName: formValue.companyName,
      deliveryInstructions: formValue.deliveryInstructions,
      isDefaultShipping: formValue.isDefaultShipping ?? undefined,
      isDefaultBilling: formValue.isDefaultBilling ?? undefined,
    };

    this.addressSubmitted.emit({ address, shouldSave });
    this.resetForm();
    this.isEditing.set(false);
  }

  resetForm(): void {
    this.form.reset({
      id: null,
      contactName: '',
      street: '',
      houseNumber: '',
      addressAddition: null,
      postalCode: '',
      city: '',
      countryCode: '',
      phoneNumber: null,
      email: '',
      companyName: null,
      deliveryInstructions: null,
      isDefaultShipping: false,
      isDefaultBilling: false,
      saveAddress: false,
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.isEditing.set(false);
  }

  private patchFormWithAddress(address: Address): void {
    this.form.patchValue({
      id: address.id,
      contactName: address.contactName,
      street: address.street,
      houseNumber: address.houseNumber,
      addressAddition: address.addressAddition,
      postalCode: address.postalCode,
      city: address.city,
      countryCode: address.countryCode,
      phoneNumber: address.phoneNumber,
      email: address.email,
      companyName: address.companyName,
      deliveryInstructions: address.deliveryInstructions,
      isDefaultShipping: address.isDefaultShipping ?? null,
      isDefaultBilling: address.isDefaultBilling ?? null,
      saveAddress: false,
    });
    this.form.markAsPristine();
  }
}