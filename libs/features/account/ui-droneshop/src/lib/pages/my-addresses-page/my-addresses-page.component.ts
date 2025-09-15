/**
 * @file my-addresses-page.component.ts
 * @Version 2.4.0 (Always Visible Edit/Delete Actions - Form Reset Fixed)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   Page for managing user addresses, now integrating the "Add New Address" card
 *   and ensuring edit/delete actions are always visible on address cards.
 */
import { Component, ChangeDetectionStrategy, inject, viewChild } from '@angular/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { AddressSubmitEvent, TitleTypeEnum } from '@royal-code/shared/domain';
import { UserFacade } from '@royal-code/store/user';
import { NotificationService } from '@royal-code/ui/notifications';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { AddressFormComponent, AddressManagerComponent } from '@royal-code/ui/forms';
import { Address, AppIcon } from '@royal-code/shared/domain';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'droneshop-my-addresses-page',
  standalone: true,
  imports: [
    UiTitleComponent,
    AddressManagerComponent,
    TranslateModule,
  ],
  template: `
    <div class="space-y-6">
      <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="'account.addresses.title' | translate" />

      <royal-code-ui-address-manager
        #addressManager
        [addresses]="userFacade.addresses()"
        [isLoggedIn]="userFacade.isLoggedIn()"
        [submitButtonTextKey]="'common.buttons.save'"
        [showSaveAddressToggle]="true" 
        [showEditAndDeleteActions]="true" 
        [alwaysShowActions]="true" 
        (addressSubmitted)="onAddressSubmitted($event)"
        (editAddressClicked)="onEditAddress($event)"
        (deleteAddressClicked)="onDeleteAddress($event)"
        (addAddressCardClicked)="openAddAddressOverlay()"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyAddressesPageComponent {
  protected readonly userFacade = inject(UserFacade);
  private readonly notificationService = inject(NotificationService);
  private readonly overlayService = inject(DynamicOverlayService);
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  addressManager = viewChild.required(AddressManagerComponent);

  onAddressSubmitted(event: AddressSubmitEvent): void {
    if (event.address.id) {
      this.userFacade.updateAddress(event.address.id, event.address);
    } else {
      this.userFacade.createAddress(event.address);
    }
  }

  onEditAddress(address: Address): void {
    const overlayRef = this.overlayService.open({
      component: AddressFormComponent, data: { address },
      panelClass: ['flex', 'items-center', 'justify-center', 'p-4', 'sm:p-0'],
      backdropType: 'dark', mobileFullscreen: true
    });
    overlayRef.afterClosed$.subscribe((updatedAddress?: Address | null) => {
      if (updatedAddress?.id) this.userFacade.updateAddress(updatedAddress.id, updatedAddress);
    });
  }

  onDeleteAddress(id: string): void {
    this.notificationService.showConfirmationDialog({
      titleKey: 'checkout.shipping.delete.title', messageKey: 'checkout.shipping.delete.message',
      confirmButtonKey: 'common.buttons.delete', cancelButtonKey: 'common.buttons.cancel',
      confirmButtonType: 'theme-fire',
    }).subscribe(confirmed => {
      if (confirmed) this.userFacade.deleteAddress(id);
    });
  }

  openAddAddressOverlay(): void {
    this.addressManager().resetForm(); // Reset het formulier onder de kaarten
    const overlayRef = this.overlayService.open({
      component: AddressFormComponent,
      data: { address: undefined },
      panelClass: ['flex', 'items-center', 'justify-center', 'p-4', 'sm:p-0'],
      backdropType: 'dark', mobileFullscreen: true
    });
    overlayRef.afterClosed$.subscribe((newAddress?: Address | null) => {
      if (newAddress) {
        this.userFacade.createAddress(newAddress);
      }
    });
  }
}