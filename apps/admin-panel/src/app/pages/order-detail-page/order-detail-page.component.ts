/**
 * @file order-detail-page.component.ts
 * @Version 4.0.0 (Definitive - Full i18n & Robust Item Array Binding)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description
 *   Definitive smart component fully synced and integrated with all i18n keys for a comprehensive
 *   and translatable order detail view, now with robust binding for the order items array.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { filter, map, Subject, takeUntil } from 'rxjs';
import { Order, OrderItem, OrderStatus } from '@royal-code/features/orders/domain';
import { Address, AppIcon } from '@royal-code/shared/domain';
import { AdminOrdersFacade } from '@royal-code/features/admin-orders/core';
import { NotificationService } from '@royal-code/ui/notifications';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { OrderItemUpdate, OrderItemsTableComponent } from '@royal-code/features/admin-orders/ui';

// UI Components
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiTextareaComponent } from '@royal-code/ui/textarea';

// Dumb presentational components
import { OrderCustomerInfoComponent, OrderActionsCardComponent, AdminOrderFinancialsCardComponent, AdminOrderPaymentDetailsComponent } from '@royal-code/features/admin-orders/ui';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { AddProductResult, AddProductToOrderDialogComponent } from '../../../../../../libs/features/admin-orders/ui/src';

@Component({
  selector: 'royal-code-admin-order-detail-page',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, TranslateModule,
    UiTitleComponent, UiSpinnerComponent, UiButtonComponent, UiIconComponent, UiTextareaComponent,
    OrderCustomerInfoComponent, OrderItemsTableComponent, OrderActionsCardComponent, AdminOrderFinancialsCardComponent, AdminOrderPaymentDetailsComponent
  ],
    template: `
    <form [formGroup]="orderForm">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-4 px-4 border-b border-border">
        <div class="flex justify-between items-center">
          <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="pageTitle()" />
          <div class="flex items-center gap-3">
            <royal-code-ui-button type="outline" routerLink="/orders">{{ 'common.buttons.back' | translate }}</royal-code-ui-button>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="p-2 md:p-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        @if (facade.isLoading() && !selectedOrder()) {
          <div class="lg:col-span-3 flex justify-center items-center h-64"><royal-code-ui-spinner size="lg" /></div>
        } @else {
          @if (selectedOrder(); as order) {
            <!-- Main Content Column -->
            <div class="lg:col-span-2 space-y-6">
              <div class="p-6 bg-card border border-border rounded-xs flex flex-col">
                <h3 class="text-lg font-medium mb-4">{{ 'admin.orders.detail.products' | translate }}</h3>
                <div>
                  <admin-order-items-table [parentFormGroup]="orderForm" (addItem)="addItem()" (removeItem)="removeOrderItem($event)" (itemUpdated)="updateOrderItem($event)" />
                </div>
                <div class="pt-4 mt-4 border-t border-border flex justify-end gap-2">
                   <royal-code-ui-button type="outline" sizeVariant="sm" (clicked)="addItem()">
                     <royal-code-ui-icon [icon]="AppIcon.Plus" extraClass="mr-2" /> {{ 'admin.orders.detail.addProducts' | translate }}
                   </royal-code-ui-button>
                   <royal-code-ui-button type="primary" sizeVariant="sm" (clicked)="saveOrderItems()" [disabled]="!itemsFormArray.dirty || facade.isSubmitting()">
                      @if (facade.isSubmitting()) { <royal-code-ui-spinner size="xs" extraClass="mr-2"/> }
                      <span>{{ 'common.buttons.save' | translate }} {{ 'admin.orders.detail.products' | translate }}</span>
                   </royal-code-ui-button>
                 </div>
              </div>
              <div class="p-6 bg-card border border-border rounded-xs flex flex-col ">
                <h3 class="text-lg font-medium mb-4 flex-shrink-0">{{ 'admin.orders.detail.notes' | translate }}</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                  <div>
                    <h4 class="text-sm font-semibold mb-2">{{ 'admin.orders.detail.customerNotes' | translate }}</h4>
                    <p class="text-sm text-secondary p-3 bg-surface-alt rounded-md min-h-24">{{ order.customerNotes || ('admin.orders.detail.noNotes' | translate) }}</p>
                  </div>
                  <div>
                    <h4 class="text-sm font-semibold mb-2">{{ 'admin.orders.detail.internalNotes' | translate }} ({{ 'common.buttons.edit' | translate }})</h4>
                    <royal-code-ui-textarea formControlName="internalNotes" [rows]="4" />
                  </div>
                </div>
                 <div class="pt-4 mt-4 border-t border-border flex justify-end">
                   <royal-code-ui-button type="primary" sizeVariant="sm" (clicked)="saveInternalNotes()" [disabled]="!orderForm.get('internalNotes')?.dirty || facade.isSubmitting()">
                      @if (facade.isSubmitting()) { <royal-code-ui-spinner size="xs" extraClass="mr-2"/> }
                      <span>{{ 'admin.orders.detail.saveNotes' | translate }}</span>
                   </royal-code-ui-button>
                 </div>
              </div>
            </div>

            <!-- Sidebar Column -->
            <aside class="lg:col-span-1 space-y-6 sticky top-24">
              <div class="p-6 bg-card border border-border rounded-xs">
                 <h3 class="text-lg font-medium mb-4">{{ 'admin.orders.detail.actionsAndDocuments' | translate }}</h3>
                 <admin-order-actions-card [parentFormGroup]="orderForm" [lookups]="facade.lookups()" (cancelOrder)="onCancelOrder(order.id)" (refundOrder)="onRefundOrder(order.id)" />
                 <div class="flex flex-col gap-2 pt-4 mt-4 border-t border-border">
                    <royal-code-ui-button type="outline" (clicked)="onDownloadInvoice(order.id)">{{ 'admin.orders.detail.downloadInvoice' | translate }}</royal-code-ui-button>
                    <royal-code-ui-button type="outline" (clicked)="onExport()">{{ 'admin.orders.detail.exportOrder' | translate }}</royal-code-ui-button>
                 </div>
                 <div class="pt-4 mt-4 border-t border-border flex justify-end">
                    <royal-code-ui-button type="primary" sizeVariant="sm" (clicked)="saveStatusAndTracking()" [disabled]="(!orderForm.get('status')?.dirty && !orderForm.get('shippingDetails')?.dirty) || facade.isSubmitting()">
                        @if (facade.isSubmitting()) { <royal-code-ui-spinner size="xs" extraClass="mr-2"/> }
                        <span>{{ 'admin.orders.detail.saveStatus' | translate }}</span>
                    </royal-code-ui-button>
                 </div>
              </div>
              <div class="p-6 bg-card border border-border rounded-xs">
                <h3 class="text-lg font-medium mb-4">{{ 'admin.orders.detail.financialSummary' | translate }}</h3>
                <admin-order-financials-card [order]="order" />
              </div>
              <div class="p-6 bg-card border border-border rounded-xs">
                <h3 class="text-lg font-medium mb-4">{{ 'admin.orders.detail.paymentDetails' | translate }}</h3>
                <admin-order-payment-details [paymentDetails]="order.paymentDetails" />
              </div>
              <div class="p-6 bg-card border border-border rounded-xs flex flex-col ">
                <h3 class="text-lg font-medium mb-4 flex-shrink-0">{{ 'admin.orders.detail.customerAndAddresses' | translate }}</h3>
                <div class="flex-grow">
                    <admin-order-customer-info [parentFormGroup]="orderForm" />
                </div>
                 <div class="pt-4 mt-4 border-t border-border flex justify-end gap-2">
                   <royal-code-ui-button type="primary" sizeVariant="sm" (clicked)="saveBillingAddress()" [disabled]="!orderForm.get('billingAddress')?.dirty || orderForm.get('billingAddress')?.invalid || facade.isSubmitting()">
                      @if (facade.isSubmitting()) { <royal-code-ui-spinner size="xs" extraClass="mr-2"/> }
                      <span>{{ 'admin.orders.detail.saveAddress' | translate }}</span>
                   </royal-code-ui-button>
                   <royal-code-ui-button type="primary" sizeVariant="sm" (clicked)="saveShippingAddress()" [disabled]="!orderForm.get('shippingAddress')?.dirty || orderForm.get('shippingAddress')?.invalid || facade.isSubmitting()">
                      @if (facade.isSubmitting()) { <royal-code-ui-spinner size="xs" extraClass="mr-2"/> }
                      <span>{{ 'admin.orders.detail.saveAddress' | translate }}</span>
                   </royal-code-ui-button>
                 </div>
              </div>
            </aside>
          } @else if (facade.viewModel().error) {
            <div class="lg:col-span-3 p-4 bg-destructive/10 text-destructive border border-destructive rounded-xs">
              <p class="font-bold">{{ 'admin.errors.loadingOrderFailed' | translate }}</p>
              <p>{{ facade.viewModel().error }}</p>
            </div>
          } @else {
             <p class="lg:col-span-3 text-center">{{ 'admin.orders.detail.orderNotFound' | translate }}</p>
          }
        }
      </div>
    </form>
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailPageComponent implements OnInit, OnDestroy {
  protected readonly facade = inject(AdminOrdersFacade);
  private readonly notificationService = inject(NotificationService);
  private readonly translate = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly overlayService = inject(DynamicOverlayService); 
  private readonly destroy$ = new Subject<void>();

  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;
  protected readonly selectedOrder = this.facade.selectedOrder;

  protected pageTitle = signal<string>('');

  orderForm: FormGroup = this.fb.group({
    status: ['', Validators.required],
    shippingDetails: this.fb.group({ trackingNumber: [''], trackingUrl: [''] }),
    customer: this.fb.group({
        customerName: [{ value: '', disabled: true }],
        customerEmail: [{ value: '', disabled: true }],
    }),
    shippingAddress: this.fb.group({
      street: ['', Validators.required], houseNumber: ['', Validators.required], postalCode: ['', Validators.required], city: ['', Validators.required], countryCode: ['', Validators.required], contactName: ['', Validators.required]
    }),
    billingAddress: this.fb.group({
      street: ['', Validators.required], houseNumber: ['', Validators.required], postalCode: ['', Validators.required], city: ['', Validators.required], countryCode: ['', Validators.required], contactName: ['', Validators.required]
    }),
    internalNotes: [''],
    items: this.fb.array([])
  });

  get itemsFormArray() {
    return this.orderForm.get('items') as FormArray;
  }

  constructor() {
    effect(() => {
      const order = this.selectedOrder();
      if (order) {
        this.pageTitle.set(this.translate.instant('admin.orders.detail.titlePrefix') + ` #${order.orderNumber}`);
        
        this.orderForm.patchValue({
          status: order.status,
          customer: { customerName: order.customerName, customerEmail: order.customerEmail },
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          internalNotes: order.internalNotes ? order.internalNotes[0]?.text : '',
          shippingDetails: {
            trackingNumber: order.shippingDetails?.trackingNumber,
            trackingUrl: order.shippingDetails?.trackingUrl
          }
        }, { emitEvent: false });
        this.buildItemsFormArray(order.items);
        this.orderForm.markAsPristine();
      } else {
         this.pageTitle.set(this.translate.instant('admin.orders.detail.loadingOrderDetails'));
      }
    });
  }


  private buildItemsFormArray(items: readonly OrderItem[]): void {
    this.itemsFormArray.clear();
    items.forEach(item => {
      this.itemsFormArray.push(this.fb.group({
        id: [item.id],
        productName: [{ value: item.productName, disabled: true }],
        sku: [{ value: item.sku, disabled: true }],
        variantInfo: [item.variantInfo],
        productImageUrl: [item.productImageUrl],
        pricePerItem: [item.pricePerItem, [Validators.required, Validators.min(0)]],
        quantity: [item.quantity, [Validators.required, Validators.min(1)]]
      }));
    });
    this.itemsFormArray.markAsPristine();
  }

  ngOnInit(): void {
    this.facade.init();

    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter((id): id is string => !!id),
      takeUntil(this.destroy$)
    ).subscribe(id => {
      this.facade.openOrderDetailPage(id);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.facade.selectOrder(null);
  }

  saveStatusAndTracking(): void {
    const statusControl = this.orderForm.get('status');
    const shippingDetailsGroup = this.orderForm.get('shippingDetails');
    const orderId = this.selectedOrder()?.id;
    if (!orderId) return;

    if (!statusControl?.dirty && !shippingDetailsGroup?.dirty) { return; }
    
    this.facade.updateStatus(orderId, statusControl?.value as OrderStatus, shippingDetailsGroup?.get('trackingNumber')?.value, shippingDetailsGroup?.get('trackingUrl')?.value);
    statusControl?.markAsPristine();
    shippingDetailsGroup?.markAsPristine();
  }

  saveShippingAddress(): void {
    const addressGroup = this.orderForm.get('shippingAddress');
    const orderId = this.selectedOrder()?.id;
    if (!orderId) return;
    
    if (!addressGroup || !addressGroup.dirty) { return; }
    
    if (addressGroup.invalid) {
      this.notificationService.showError(this.translate.instant('admin.orders.messages.invalidShippingAddress'));
      addressGroup.markAllAsTouched();
      return;
    }
    this.facade.updateShippingAddress(orderId, addressGroup.value as Address);
    addressGroup.markAsPristine();
  }
  
  saveBillingAddress(): void {
    const addressGroup = this.orderForm.get('billingAddress');
    const orderId = this.selectedOrder()?.id;
    if (!orderId) return;

    if (!addressGroup || !addressGroup.dirty) { return; }

    if (addressGroup.invalid) {
      this.notificationService.showError(this.translate.instant('admin.orders.messages.invalidShippingAddress'));
      addressGroup.markAllAsTouched();
      return;
    }
    this.facade.updateBillingAddress(orderId, addressGroup.value as Address);
    addressGroup.markAsPristine();
  }

  saveInternalNotes(): void {
    const notesControl = this.orderForm.get('internalNotes');
    const orderId = this.selectedOrder()?.id;
    if (!orderId) return;

    if (!notesControl || !notesControl.dirty) { return; }

    this.facade.updateInternalNotes(orderId, notesControl.value);
    notesControl.markAsPristine();
  }

  updateOrderItem(update: OrderItemUpdate): void {
    const itemControl = this.itemsFormArray.controls.find(c => c.value.id === update.itemId);
    if (itemControl) {
      this.itemsFormArray.markAsDirty();
    }
  }

  saveOrderItems(): void {
    const orderId = this.selectedOrder()?.id;
    if (!orderId) return;

    if (!this.itemsFormArray.dirty) {
      this.notificationService.showInfo(this.translate.instant('admin.orders.detail.noChanges'));
      return;
    }

    if (this.itemsFormArray.invalid) {
      this.notificationService.showError(this.translate.instant('admin.orders.detail.formInvalid'));
      this.itemsFormArray.markAllAsTouched();
      return;
    }
    
    this.itemsFormArray.controls.forEach(control => {
      if (control.dirty) {
        const itemValue = control.getRawValue();
        this.facade.updateOrderItem(orderId, itemValue.id, itemValue.quantity);
        control.markAsPristine();
      }
    });

    this.itemsFormArray.markAsPristine();
    this.notificationService.showSuccess(this.translate.instant('common.buttons.save') + ' ' + this.translate.instant('admin.orders.detail.products'));
  }

  removeOrderItem(itemId: string): void {
    if (confirm(this.translate.instant('admin.orders.detail.confirmRemoveItem'))) {
        const orderId = this.selectedOrder()?.id;
        if (!orderId) return;
        this.facade.removeOrderItem(orderId, itemId);
    }
  }
  
  addItem(): void {
    const orderId = this.selectedOrder()?.id;
    if (!orderId) {
      this.notificationService.showError('Kan product niet toevoegen: order ID ontbreekt.');
      return;
    }

    const dialogRef = this.overlayService.open<AddProductResult>({
      component: AddProductToOrderDialogComponent,
      data: {},
      backdropType: 'dark',
      closeOnClickOutside: true,
    });

    dialogRef.afterClosed$.pipe(
      filter((result): result is AddProductResult => !!result),
      takeUntil(this.destroy$)
    ).subscribe(result => {
      this.facade.addItemToOrder(orderId, {
        productId: result.productId,
        variantId: result.variantId,
        quantity: result.quantity,
      });
    });
  }

  onCancelOrder(orderId: string): void {
    if (confirm(this.translate.instant('admin.orders.detail.confirmCancelOrder'))) {
      this.facade.cancelOrder(orderId);
    }
  }
  
  onRefundOrder(orderId: string): void {
    const amountStr = prompt(this.translate.instant('admin.orders.detail.refundAmountPrompt'));
    if (amountStr === null) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      this.notificationService.showError(this.translate.instant('admin.orders.detail.invalidRefundAmount'));
      return;
    }
    const reason = prompt(this.translate.instant('admin.orders.detail.refundReasonPrompt'));
    if (reason === null) return;
    this.facade.refundOrder(orderId, amount, reason || 'No reason provided');
  }

  onDownloadInvoice(orderId: string): void {
    const orderNumber = this.selectedOrder()?.orderNumber;
    if (orderId && orderNumber) {
      this.facade.downloadInvoice(orderId, orderNumber);
    } else {
      this.notificationService.showError(this.translate.instant('admin.orders.detail.invoiceNotFound'));
    }
  }

  onExport(): void {
    this.notificationService.showInfo(this.translate.instant('admin.orders.detail.exportNotImplemented'));
  }
}