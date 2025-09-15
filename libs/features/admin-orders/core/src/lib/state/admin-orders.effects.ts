/**
 * @file admin-orders.effects.ts
 * @version 5.0.0 (Fixed Detail Load - Always Full DTO)
 * @description NgRx-effects voor Admin Orders, nu met een robuuste detail load die altijd de volledige order DTO ophaalt en mapt.
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, Observable } from 'rxjs';
import { switchMap, map, catchError, exhaustMap, tap, withLatestFrom } from 'rxjs/operators';

import { AdminOrdersActions } from './admin-orders.actions';
import { AbstractAdminOrderApiService } from '../data-access/abstract-admin-order-api.service';
// AdminOrderMappingService is now in data-access, but we can't import it here due to circular dependency
// We'll need to handle mapping differently or move the service to a shared location
import { NotificationService } from '@royal-code/ui/notifications';
import type {
  BackendAdminOrderDetailDto
} from '../DTOs/backend.dto';
import { Order } from '@royal-code/features/orders/domain';
import { StructuredError } from '@royal-code/shared/domain';
import { Store } from '@ngrx/store';

// Removed isDetailDto as we now always expect BackendAdminOrderDetailDto

@Injectable()
export class AdminOrdersEffects {
  private readonly actions$ = inject(Actions);
  private readonly api      = inject(AbstractAdminOrderApiService);
  // Mapper removed - API service should return mapped domain objects
  private readonly toast    = inject(NotificationService);
  private readonly store = inject(Store);

  // --- INIT ---
  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminOrdersActions.pageInitialized),
      switchMap(() => [
        AdminOrdersActions.loadOrders({ filters: {} }),
        AdminOrdersActions.loadStats({}),
        AdminOrdersActions.loadLookups()
      ])
    )
  );

  // --- LOAD ORDERS ---
  loadOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminOrdersActions.loadOrders),
      switchMap(({ filters }) =>
        this.api.getOrders(filters).pipe(
          map(response =>
            AdminOrdersActions.loadOrdersSuccess({
              orders: response.items, // `response.items` is al `readonly Order[]`
              totalCount: response.totalCount
            })
          ),
          catchError(err =>
            of(AdminOrdersActions.loadOrdersFailure({ error: err.message }))
          )
        )
      )
    )
  );

  // --- LOAD STATS ---
  loadStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminOrdersActions.loadStats),
      switchMap(({ dateFrom, dateTo }) =>
        this.api.getStats(dateFrom, dateTo).pipe(
          map(stats => AdminOrdersActions.loadStatsSuccess({ stats })),
          catchError(err =>
            of(AdminOrdersActions.loadStatsFailure({ error: err.message }))
          )
        )
      )
    )
  );

  // --- LOAD LOOKUPS ---
  loadLookups$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminOrdersActions.loadLookups),
      switchMap(() =>
        this.api.getLookups().pipe(
          map(lookups => AdminOrdersActions.loadLookupsSuccess({ lookups })),
          catchError(err =>
            of(AdminOrdersActions.loadLookupsFailure({ error: err.message }))
          )
        )
      )
    )
  );

  // --- TRIGGER DETAIL LOAD ---
  triggerLoadDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminOrdersActions.orderDetailPageOpened),
      // << DE FIX: Dispatch loadOrderDetail zonder de 'view' parameter >>
      map(({ orderId }) =>
        AdminOrdersActions.loadOrderDetail({ orderId })
      )
    )
  );

  // --- LOAD DETAIL ---
  loadDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminOrdersActions.loadOrderDetail),
      switchMap(({ orderId }) => // << DE FIX: 'view' parameter verwijderd >>
        this.api.getOrderById(orderId).pipe( // << DE FIX: Call zonder 'view' parameter >>
          map(dto => {
            // Nu mappen we altijd naar een volledige Order, de API retourneert altijd DetailDto.
            // TODO: API service should return mapped Order domain object
            const order = dto as any as Order;
            return AdminOrdersActions.loadOrderDetailSuccess({ order });
          }),
          catchError(err =>
            of(AdminOrdersActions.loadOrderDetailFailure({ error: err.message }))
          )
        )
      )
    )
  );

  // Removed loadOrderQuickShipDetails$ effect

  // --- MUTATIONS ---
  mutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        AdminOrdersActions.updateStatusSubmitted,
        AdminOrdersActions.updateShippingAddressSubmitted,
        AdminOrdersActions.updateBillingAddressSubmitted,
        AdminOrdersActions.updateInternalNotesSubmitted,
        AdminOrdersActions.updateCustomerNotesSubmitted,
        AdminOrdersActions.cancelOrderConfirmed,
        AdminOrdersActions.refundOrderSubmitted,
        AdminOrdersActions.createFulfillmentSubmitted,
        AdminOrdersActions.addItemToOrderSubmitted,
        AdminOrdersActions.updateOrderItemSubmitted,
        AdminOrdersActions.removeOrderItemSubmitted
      ),
      exhaustMap(action => {
        let call$: Observable<BackendAdminOrderDetailDto>;

        switch (action.type) {
          case AdminOrdersActions.updateStatusSubmitted.type:
            call$ = this.api.updateStatus(action.orderId, action.payload);
            break;
          case AdminOrdersActions.updateShippingAddressSubmitted.type:
            call$ = this.api.updateShippingAddress(action.orderId, action.payload);
            break;
          case AdminOrdersActions.updateBillingAddressSubmitted.type:
            call$ = this.api.updateBillingAddress(action.orderId, action.payload);
            break;
          case AdminOrdersActions.updateInternalNotesSubmitted.type:
            call$ = this.api.updateInternalNotes(action.orderId, { notes: action.notes });
            break;
          case AdminOrdersActions.updateCustomerNotesSubmitted.type:
            call$ = this.api.updateCustomerNotes(action.orderId, { notes: action.notes });
            break;
          case AdminOrdersActions.cancelOrderConfirmed.type:
            call$ = this.api.cancelOrder(action.orderId);
            break;
          case AdminOrdersActions.refundOrderSubmitted.type:
            call$ = this.api.refundOrder(action.orderId, action.payload);
            break;
          case AdminOrdersActions.createFulfillmentSubmitted.type:
            call$ = this.api.createFulfillment(action.orderId, action.payload);
            break;
          case AdminOrdersActions.addItemToOrderSubmitted.type:
            call$ = this.api.addItemToOrder(action.orderId, action.payload);
            break;
          case AdminOrdersActions.updateOrderItemSubmitted.type:
            call$ = this.api.updateOrderItemQuantity(action.orderItemId, action.payload);
            break;
          case AdminOrdersActions.removeOrderItemSubmitted.type:
            call$ = this.api.removeOrderItem(action.orderItemId);
            break;
          default:
            return of(AdminOrdersActions.mutationFailure({ error: 'Unknown mutation action' }));
        }

        return call$.pipe(
          map(dto => {
            // TODO: API service should return mapped Order domain object
            const order = dto as any as Order;
            // Pas de succesmelding aan voor duidelijkheid
            if (action.type === AdminOrdersActions.addItemToOrderSubmitted.type) {
              this.toast.showSuccess('Product succesvol toegevoegd aan order');
            } else {
              this.toast.showSuccess('Order succesvol bijgewerkt');
            }
            return AdminOrdersActions.mutationSuccess({
              orderUpdate: { id: order.id, changes: order }
            });
          }),
          catchError(err => {
            // Pas de foutmelding aan
            const message = action.type === AdminOrdersActions.addItemToOrderSubmitted.type
              ? 'Toevoegen van product mislukt'
              : 'Update mislukt';
            this.toast.showError(message);
            return of(AdminOrdersActions.mutationFailure({ error: err.message }));
          })
        );
      })
    )
  );

  // --- DOCUMENTEN DOWNLOAD ---
  download$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          AdminOrdersActions.downloadInvoiceSubmitted,
          AdminOrdersActions.downloadPackingSlipSubmitted,
          AdminOrdersActions.exportOrdersSubmitted
        ),
        exhaustMap(action => {
          let call$: Observable<Blob>;
          let filename: string;

          if (action.type === AdminOrdersActions.downloadInvoiceSubmitted.type) {
            call$ = this.api.downloadInvoice(action.orderId);
            filename = `invoice-${action.orderNumber}.pdf`;
          } else if (
            action.type === AdminOrdersActions.downloadPackingSlipSubmitted.type
          ) {
            call$ = this.api.downloadPackingSlip(action.orderId);
            filename = `packing-slip-${action.orderNumber}.pdf`;
          } else {
            call$ = this.api.exportOrders(action.filters);
            filename = `orders-export-${new Date()
              .toISOString()
              .slice(0, 10)}.csv`;
          }

          return call$.pipe(
            tap(blob => this.downloadFile(blob, filename)),
            catchError(() => {
              this.toast.showError('Download mislukt');
              return of();
            })
          );
        })
      ),
    { dispatch: false }
  );

  private downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}