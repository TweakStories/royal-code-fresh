--- START OF FILE libs/features/checkout/core/src/lib/data-access/abstract-checkout-api.service.ts ---

/**
 * @file abstract-checkout-api.service.ts
 * @Version 2.0.0 (Shipping Methods Added)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description
 *   Defines the abstract base class `AbstractCheckoutApiService`.
 */
import { Observable } from 'rxjs';
import { SubmitOrderPayload } from '../state/checkout.types';
import { Order } from '@royal-code/features/orders/domain';
import { ShippingMethod, ShippingMethodFilter } from '@royal-code/features/checkout/domain';

/**
 * @abstract
 * @class AbstractCheckoutApiService
 * @description
 *   Serves as the dependency-inversion token and contract for checkout API services.
 *   The core `CheckoutEffects` will inject this abstract class, and the specific
 *   application (e.g., 'plushie-paradise', 'challenger') will provide a concrete
 *   implementation.
 *
 * @example
 * // In a specific app's app.config.ts:
 * providers: [
 *   { provide: AbstractCheckoutApiService, useClass: MySpecificCheckoutApiService }
 * ]
 */
export abstract class AbstractCheckoutApiService {
  /**
   * @abstract
   * @method getShippingMethods
   * @description
   *   Contract for fetching available shipping methods.
   * @param {ShippingMethodFilter} filters - The filters to apply, primarily the shipping address ID.
   * @returns {Observable<ShippingMethod[]>} An observable that emits a list of available shipping methods.
   */
  abstract getShippingMethods(filters: ShippingMethodFilter): Observable<ShippingMethod[]>;

  /**
   * @abstract
   * @method submitOrder
   * @description
   *   Contract for submitting the complete order details to the backend.
   *   Implementations of this method should handle the HTTP POST request to the
   *   appropriate order-creation endpoint for their specific backend.
   *
   * @param {SubmitOrderPayload} payload - The complete order data, including cart items,
   *                                       shipping address, and payment method details.
   * @returns {Observable<Order>} An observable that emits the newly created `Order` object
   *                              as returned by the backend upon success.
   */

  abstract submitOrder(payload: SubmitOrderPayload): Observable<Order>;
}

--- END OF FILE ---

--- START OF FILE libs/features/checkout/core/src/lib/state/checkout.actions.ts ---

/**
 * @file checkout.actions.ts
 * @Version 4.0.0 (With Shipping Methods)
 * @Description Definitive actions for the Checkout feature.
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Address } from '@royal-code/shared/domain';
import { CheckoutStep } from './checkout.types';
import { ShippingMethod, ShippingMethodFilter } from '@royal-code/features/checkout/domain';

export const CheckoutActions = createActionGroup({
  source: 'Checkout',
  events: {
    // Lifecycle
    'Flow Initialized': emptyProps(),
    'State Rehydrated': props<{ persistedState: any }>(),
    'Flow Reset': emptyProps(),

    // Navigation
    'Go To Step': props<{ step: CheckoutStep }>(),

    // Data Submission & Orchestration
    'Shipping Step Submitted': props<{ address: Address, saveAddress: boolean, shouldNavigate: boolean }>(),
    'Shipping Address Set': props<{ address: Address | null }>(),
    'Billing Address Set': props<{ address: Address | null }>(),
    'Payment Method Set': props<{ methodId: string }>(),

    // Shipping Methods
    'Load Shipping Methods': props<{ filters: ShippingMethodFilter }>(),
    'Load Shipping Methods Success': props<{ methods: ShippingMethod[] }>(),
    'Load Shipping Methods Failure': props<{ error: string }>(),
    'Shipping Method Set': props<{ methodId: string }>(),

    // Order Submission Flow
    'Order Submitted': emptyProps(),
  },
});

--- END OF FILE ---

--- START OF FILE libs/features/checkout/core/src/lib/state/checkout.effects.ts ---

/**
 * @file checkout.effects.ts
 * @Version 6.1.0 (Corrected Imports & Return Types)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-31
 * @Description
 *   Definitive implementation of checkout effects, with corrected RxJS imports
 *   and type-safe action returns.
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, Action } from '@ngrx/store';
import { of } from 'rxjs';
import { map, withLatestFrom, tap, concatMap, switchMap, catchError } from 'rxjs/operators';
import { CheckoutActions } from './checkout.actions';
import { checkoutFeature } from './checkout.feature';
import { selectAllCartItems } from '@royal-code/features/cart/core';
import { NotificationService } from '@royal-code/ui/notifications';
import { StorageService } from '@royal-code/core/storage';
import { UserActions } from '@royal-code/store/user';
import { OrderActions } from '@royal-code/features/orders/core';
import { CreateOrderPayload } from '@royal-code/features/orders/domain';
import { LoggerService } from '@royal-code/core/logging';
import { AbstractCheckoutApiService } from '../data-access/abstract-checkout-api.service';

@Injectable()
export class CheckoutEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store);
  private readonly notificationService = inject(NotificationService);
  private readonly storageService = inject(StorageService);
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(AbstractCheckoutApiService);

  loadShippingMethods$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CheckoutActions.loadShippingMethods),
      switchMap(({ filters }) =>
        this.apiService.getShippingMethods(filters).pipe(
          map(methods => CheckoutActions.loadShippingMethodsSuccess({ methods })),
          catchError((error: Error) => {
            this.logger.error('[CheckoutEffects] Failed to load shipping methods', error);
            return of(CheckoutActions.loadShippingMethodsFailure({ error: 'Failed to load shipping methods.' }));
          })
        )
      )
    )
  );

  submitOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CheckoutActions.orderSubmitted),
      withLatestFrom(
        this.store.select(checkoutFeature.selectCheckoutViewModel),
        this.store.select(selectAllCartItems)
      ),
      map(([, checkout, cartItems]): Action => { 
        if (!checkout.shippingAddress?.id || !checkout.selectedShippingMethodId || !checkout.paymentMethodId || cartItems.length === 0) {
          this.notificationService.showError('Onvolledige bestelgegevens. Kan niet doorgaan.');
          return ({ type: '[Checkout] Submit Order Aborted - Incomplete Data' });
        }

        const payload: CreateOrderPayload = {
          shippingAddressId: checkout.shippingAddress.id,
          billingAddressId: checkout.shippingAddress.id,
          shippingMethodId: checkout.selectedShippingMethodId, 
          paymentMethod: checkout.paymentMethodId,
          items: cartItems.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          customerNotes: '',
        };
        return OrderActions.createOrderFromCheckout({ payload });
      })
    )
  );

handleShippingStepSubmitted$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CheckoutActions.shippingStepSubmitted),
      concatMap(({ address, saveAddress, shouldNavigate }) => {
        const actionsToDispatch: Action[] = [
          CheckoutActions.shippingAddressSet({ address })
        ];

        if (saveAddress) {
          const tempId = `temp-addr-${Date.now()}`;
          this.store.dispatch(UserActions.createAddressSubmitted({ payload: address, tempId }));
        }

        if (shouldNavigate) {
          actionsToDispatch.push(CheckoutActions.goToStep({ step: 'payment' }));
        }
        
        return of(...actionsToDispatch);
      })
    )
  );


  private readonly CHECKOUT_STORAGE_KEY = 'royal-code-checkout';

  persistStateToSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        CheckoutActions.shippingAddressSet,
        CheckoutActions.paymentMethodSet,
        CheckoutActions.goToStep
      ),
      withLatestFrom(this.store.select(checkoutFeature.selectCheckoutState)),
      tap(([, state]) => {
        this.storageService.setItem(this.CHECKOUT_STORAGE_KEY, state, 'session');
      })
    ),
    { dispatch: false }
  );

  clearStateOnSuccessOrReset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        OrderActions.createOrderSuccess,
        CheckoutActions.flowReset
      ),
      tap(() => {
        this.storageService.removeItem(this.CHECKOUT_STORAGE_KEY, 'session');
      })
    ),
    { dispatch: false }
  );
}

--- END OF FILE ---

--- START OF FILE libs/features/checkout/core/src/lib/state/checkout.facade.ts ---

/**
 * @file checkout.facade.ts
 * @Version 3.2.0 (With Shipping Method Selection)
 * @Description Publieke API voor de Checkout state.
 */
import { Injectable, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Address } from '@royal-code/shared/domain';
import { CheckoutActions } from './checkout.actions';
import { selectCheckoutViewModel } from './checkout.feature';
import { CheckoutViewModel, CheckoutStep } from './checkout.types';
import { ShippingMethodFilter } from '@royal-code/features/checkout/domain';

@Injectable({ providedIn: 'root' })
export class CheckoutFacade {
  private readonly store = inject(Store);

  // <<< DE FIX: initialViewModel bijgewerkt >>>
  private readonly initialViewModel: CheckoutViewModel = {
    activeStep: 'shipping',
    completedSteps: new Set<CheckoutStep>(),
    shippingAddress: null,
    paymentMethodId: null,
    selectedShippingMethodId: null, // <<< DE FIX: TOEGEVOEGD
    shippingMethods: [],
    isLoadingShippingMethods: false,
    canProceedToPayment: false,
    canProceedToReview: false,
    isSubmittingOrder: false,
    error: null,
  };

  public readonly viewModel$: Observable<CheckoutViewModel> = this.store.select(selectCheckoutViewModel);
public readonly viewModel: Signal<CheckoutViewModel> = toSignal(this.store.select(selectCheckoutViewModel), { initialValue: this.initialViewModel });

  initialize(): void { this.store.dispatch(CheckoutActions.flowInitialized()); }
  goToStep(step: CheckoutStep): void { this.store.dispatch(CheckoutActions.goToStep({ step })); }
setShippingAddress(address: Address | null, saveAddress: boolean, shouldNavigate: boolean = false): void {
    if (address) {
      this.store.dispatch(CheckoutActions.shippingStepSubmitted({ address, saveAddress, shouldNavigate }));
    } else {
      // Als er geen adres is, dispatch dan direct de 'Shipping Address Set' actie met null.
      this.store.dispatch(CheckoutActions.shippingAddressSet({ address: null }));
    }
  }

  
  setPaymentMethod(methodId: string): void {
    this.store.dispatch(CheckoutActions.paymentMethodSet({ methodId }));
    this.store.dispatch(CheckoutActions.goToStep({ step: 'review' }));
  }
  setShippingMethod(methodId: string): void {
    this.store.dispatch(CheckoutActions.shippingMethodSet({ methodId }));
  }

  loadShippingMethods(filters: ShippingMethodFilter): void { this.store.dispatch(CheckoutActions.loadShippingMethods({ filters })); }
  submitOrder(): void { this.store.dispatch(CheckoutActions.orderSubmitted()); }
  resetFlow(): void { this.store.dispatch(CheckoutActions.flowReset()); }
}

--- END OF FILE ---

--- START OF FILE libs/features/checkout/core/src/lib/state/checkout.feature.ts ---

/**
 * @file checkout.feature.ts
 * @Version 5.0.0 (With Shipping Methods)
 * @Description
 *   Definitive NgRx feature definition for Checkout state.
 */
import { createFeature, createSelector, createReducer, on } from '@ngrx/store';
import { CheckoutStep, CheckoutViewModel } from './checkout.types';
import { CheckoutActions } from './checkout.actions';
import { Address } from '@royal-code/shared/domain';
import { ShippingMethod } from '@royal-code/features/checkout/domain';

// --- STATE DEFINITION ---
export interface SerializableCheckoutState {
  activeStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  shippingAddress: Address | null;
  billingAddress: Address | null;
  paymentMethodId: string | null;
  selectedShippingMethodId: string | null;
  shippingMethods: ShippingMethod[];
  isLoadingShippingMethods: boolean;
  isSubmittingOrder: boolean;
  error: string | null;
}

export const initialCheckoutState: SerializableCheckoutState = {
  activeStep: 'shipping',
  completedSteps: [],
  shippingAddress: null,
  billingAddress: null,
  paymentMethodId: null,
  selectedShippingMethodId: null, // <<< DE FIX: TOEGEVOEGD
  shippingMethods: [],
  isLoadingShippingMethods: false,
  isSubmittingOrder: false,
  error: null,
};


// --- NGRX FEATURE ---
export const checkoutFeature = createFeature({
  name: 'checkout',
  reducer: createReducer(
    initialCheckoutState,
    on(CheckoutActions.flowInitialized, () => initialCheckoutState),
    on(CheckoutActions.flowReset, () => initialCheckoutState),
    on(CheckoutActions.stateRehydrated, (state, { persistedState }) => ({ ...state, ...persistedState })),
    on(CheckoutActions.goToStep, (state, { step }) => ({ ...state, activeStep: step })),
    on(CheckoutActions.shippingAddressSet, (state, { address }) => ({
      ...state,
      shippingAddress: address,
      completedSteps: [...new Set([...state.completedSteps, 'shipping'])] as CheckoutStep[],
    })),
    on(CheckoutActions.paymentMethodSet, (state, { methodId }) => ({
      ...state,
      paymentMethodId: methodId,
      completedSteps: [...new Set([...state.completedSteps, 'shipping', 'payment'])] as CheckoutStep[],
    })),
    on(CheckoutActions.shippingMethodSet, (state, { methodId }) => ({
      ...state,
      selectedShippingMethodId: methodId,
    })),
    on(CheckoutActions.loadShippingMethods, (state) => ({ ...state, isLoadingShippingMethods: true, error: null })),
    on(CheckoutActions.loadShippingMethodsSuccess, (state, { methods }) => ({ ...state, isLoadingShippingMethods: false, shippingMethods: methods })),
    on(CheckoutActions.loadShippingMethodsFailure, (state, { error }) => ({ ...state, isLoadingShippingMethods: false, error }))
  ),
    extraSelectors: ({ selectActiveStep, selectCompletedSteps, selectIsSubmittingOrder, selectShippingAddress, selectPaymentMethodId, selectError, selectShippingMethods, selectIsLoadingShippingMethods, selectSelectedShippingMethodId }) => { // <<< DE FIX: selectSelectedShippingMethodId toegevoegd
    const selectCompletedStepsAsSet = createSelector(selectCompletedSteps, (completedArray) => new Set(completedArray));
    const selectCanProceedToPayment = createSelector(selectCompletedStepsAsSet, (completedSet) => completedSet.has('shipping'));
    const selectCanProceedToReview = createSelector(selectCompletedStepsAsSet, (completedSet) => completedSet.has('shipping') && completedSet.has('payment'));

    const selectCheckoutViewModel = createSelector(
      selectActiveStep, selectCompletedStepsAsSet, selectShippingAddress,
      selectPaymentMethodId, selectCanProceedToPayment, selectCanProceedToReview,
      selectIsSubmittingOrder, selectError, selectShippingMethods, selectIsLoadingShippingMethods,
      selectSelectedShippingMethodId, 
      (activeStep, completedSteps, shippingAddress, paymentMethodId, canProceedToPayment, canProceedToReview, isSubmittingOrder, error, shippingMethods, isLoadingShippingMethods, selectedShippingMethodId): CheckoutViewModel => ({ // <<< DE FIX: selectedShippingMethodId als argument
        activeStep, completedSteps, shippingAddress, paymentMethodId,
        selectedShippingMethodId, 
        canProceedToPayment, canProceedToReview, isSubmittingOrder, error,
        shippingMethods, isLoadingShippingMethods
      })
    );
    return { selectCheckoutViewModel };
  }

});

// --- PUBLIC API EXPORTS ---
export const { name: CHECKOUT_FEATURE_KEY, reducer: checkoutReducer, selectCheckoutViewModel } = checkoutFeature;

--- END OF FILE ---

--- START OF FILE libs/features/checkout/core/src/lib/state/checkout.types.ts ---

/**
 * @file checkout.types.ts
 * @Version 3.2.0 (With Shipping Method Selection)
 * @Description Types en interfaces voor de Checkout feature state.
 */
import { Address } from '@royal-code/shared/domain';
import { CartItem } from '@royal-code/features/cart/domain';
import { ShippingMethod } from '@royal-code/features/checkout/domain';

export type CheckoutStep = 'shipping' | 'payment' | 'review';

export interface CheckoutState {
  activeStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  shippingAddress: Address | null;
  billingAddress: Address | null;
  paymentMethodId: string | null;
  selectedShippingMethodId: string | null; // <<< DE FIX: Toegevoegd in de State
  shippingMethods: ShippingMethod[];
  isLoadingShippingMethods: boolean;
  isSubmittingOrder: boolean;
  error: string | null;
}

export interface CheckoutViewModel {
  activeStep: CheckoutStep;
  completedSteps: Set<CheckoutStep>;
  shippingAddress: Address | null;
  paymentMethodId: string | null;
  selectedShippingMethodId: string | null; // <<< DE FIX: TOEGEVOEGD AAN DE VIEWMODEL
  shippingMethods: ShippingMethod[];
  isLoadingShippingMethods: boolean;
  canProceedToPayment: boolean;
  canProceedToReview: boolean;
  isSubmittingOrder: boolean;
  error: string | null;
}

export interface SubmitOrderPayload {
  cartItems: readonly CartItem[];
  shippingAddress: Address;
  paymentMethodId: string;
}

--- END OF FILE ---

--- START OF FILE libs/features/checkout/data-access-plushie/src/lib/services/plushie-checkout-api.service.ts ---

/**
 * @file plushie-checkout-api.service.ts
 * @Version 3.0.0 (Synchronized with correct Domain Models)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description
 *   Data-access service voor checkout, nu gesynchroniseerd met de correcte
 *   'ShippingMethodFilter' die de universele 'Address' interface gebruikt.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { APP_CONFIG } from '@royal-code/core/config';
import { SubmitOrderPayload, AbstractCheckoutApiService } from '@royal-code/features/checkout/core';
import { Order } from '@royal-code/features/orders/domain';
import { ShippingMethod, ShippingMethodFilter } from '@royal-code/features/checkout/domain';

@Injectable({ providedIn: 'root' })
export class PlushieCheckoutApiService extends AbstractCheckoutApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly apiUrl = `${this.config.backendUrl}/Checkout`;

  getShippingMethods(filters: ShippingMethodFilter): Observable<ShippingMethod[]> {
    if (filters.shippingAddressId) {
      const params = new HttpParams().set('shippingAddressId', filters.shippingAddressId);
      return this.http.get<ShippingMethod[]>(`${this.apiUrl}/shipping-methods`, { params });
    } else if (filters.address) {
      return this.http.post<ShippingMethod[]>(`${this.apiUrl}/shipping-methods/calculate`, filters.address);
    }
    return of([]);
  }

  submitOrder(payload: SubmitOrderPayload): Observable<Order> {
    return this.http.post<Order>(`${this.config.backendUrl}/orders`, payload);
  }
}

--- END OF FILE ---

--- START OF FILE libs/features/checkout/domain/src/lib/models/shipping.model.ts ---

/**
 * @file shipping.model.ts
 * @Version 2.0.0 (Definitive: Uses Shared Address Model)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description
 *   Definitieve versie die de lokale, incorrecte 'Address' interface verwijdert
 *   en de enige correcte 'Address' interface importeert vanuit @royal-code/shared/domain.
 *   Dit lost alle type-inconsistenties op.
 */
import { Address } from '@royal-code/shared/domain';

/**
 * @interface ShippingMethod
 * @description Representeert een beschikbare verzendmethode met details.
 */
export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  estimatedDeliveryTime: string;
  cost: number;
}

/**
 * @interface ShippingMethodFilter
 * @description Filters voor het ophalen van verzendmethoden. Accepteert een ID (voor ingelogde gebruikers)
 *              OF een volledig adresobject (voor anonieme gebruikers).
 */
export interface ShippingMethodFilter {
  shippingAddressId?: string;
  address?: Address; // Gebruikt nu de correct geïmporteerde, universele Address interface
}

// De lokale 'Address' interface die hier stond is nu volledig en permanent verwijderd.

--- END OF FILE ---

--- START OF FILE libs/features/checkout/ui-plushie/src/lib/components/checkout-shipping-step/checkout-shipping-step.component.ts ---

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
import { AddressManagerComponent, AddressSubmitEvent } from '@royal-code/ui/forms';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { Address, AppIcon } from '@royal-code/shared/domain';
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
      this.openAddAddressOverlay();
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

--- END OF FILE ---

--- START OF FILE libs/shared/domain/src/lib/models/locations/address.model.ts ---

/**
 * @file address.model.ts
 * @Version 3.1.0 (DEFINITIVE: displayName REMOVED for clarity)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description
 *   Definitieve versie van de `Address` interface. De `displayName` property is
 *   verwijderd om consistentie te garanderen met backend DTO's die doorgaans
 *   'contactName' als de primaire displaynaam gebruiken. Dit model is de
 *   enige bron van waarheid voor 'Address' door de hele applicatie.
 */
import { AuditableEntityBase } from '@royal-code/shared/base-models';

export interface Address extends AuditableEntityBase {
  id: string;
  userId?: string; // Optioneel, kan null zijn voor anonieme bestellingen.
  contactName: string;
  street: string;
  houseNumber: string;
  addressAddition?: string | null;
  city: string;
  postalCode: string;
  countryCode: string;
  phoneNumber?: string | null;
  email?: string | null;
  companyName?: string | null;
  deliveryInstructions?: string | null;
  isDefaultShipping?: boolean; // Optioneel (boolean | undefined)
  isDefaultBilling?: boolean;  // Optioneel (boolean | undefined)
}

--- END OF FILE ---

--- START OF FILE libs/store/auth/src/lib/state/auth.facade.ts ---

/**
 * @file auth.facade.ts
 * @Version 3.1.0 (Complete Dual API - Signals & Observables)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description
 *   De publieke API voor de Auth-state. Deze facade is de enige interface die componenten
 *   en effects zouden moeten gebruiken. Het biedt nu een complete, duale API met zowel
 *   Signals (voor UI) als Observables (voor RxJS-stromen zoals in effects).
 */
import { Injectable, Signal, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs'; // <-- Importeer Observable
import { AuthActions } from './auth.actions';
import { selectIsAuthenticated, selectCurrentUser, selectAuthLoading, selectAuthError } from './auth.feature';
import { Profile } from '@royal-code/shared/domain';
import { LoginCredentials, RegisterCredentials } from '@royal-code/auth/domain';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly store = inject(Store);

  // --- PUBLIC API: STATE SIGNALS (voor UI) ---

  /** @description Een signaal dat `true` is als de gebruiker geauthenticeerd is. */
  readonly isAuthenticated: Signal<boolean> = this.store.selectSignal(selectIsAuthenticated);

  /** @description Een signaal dat het profiel van de huidige gebruiker bevat, of `null` indien niet ingelogd. */
  readonly currentUser: Signal<Profile | null> = this.store.selectSignal(selectCurrentUser);

  /** @description Een signaal dat `true` is als er een authenticatie-operatie (login, refresh) bezig is. */
  readonly isLoading: Signal<boolean> = this.store.selectSignal(selectAuthLoading);

  /** @description Een signaal dat de laatste authenticatie-foutmelding bevat, of `null`. */
  readonly error: Signal<string | null> = this.store.selectSignal(selectAuthError);

  /** @description Een Observable-stream die `true` is als de gebruiker geauthenticeerd is. */
  readonly isAuthenticated$: Observable<boolean> = this.store.select(selectIsAuthenticated);

  /** @description Een Observable-stream die het profiel van de huidige gebruiker bevat. */
  readonly currentUser$: Observable<Profile | null> = this.store.select(selectCurrentUser);

  readonly currentUserId: Signal<string | null> = computed(() => this.currentUser()?.id ?? null);

  /** @description Een Observable-stream die `true` is als er een authenticatie-operatie bezig is. */
  readonly isLoading$: Observable<boolean> = this.store.select(selectAuthLoading);

  /** @description Een Observable-stream die de laatste authenticatie-foutmelding bevat. */
  readonly error$: Observable<string | null> = this.store.select(selectAuthError);

  // --- PUBLIC API: ACTION DISPATCHERS ---

  register(credentials: RegisterCredentials): void {
    this.store.dispatch(AuthActions.registerPageSubmitted({ credentials }));
  }

  /** @description Start het login-proces door een actie te dispatchen. */
  login(credentials: LoginCredentials): void {
    this.store.dispatch(AuthActions.loginPageSubmitted({ credentials }));
  }

  /** @description Start het uitlog-proces. */
  logout(): void {
    this.store.dispatch(AuthActions.logoutButtonClicked());
  }

  /** @description Vraagt een controle van de auth-status aan, meestal bij het opstarten van de app. */
  checkAuthStatus(): void {
    this.store.dispatch(AuthActions.checkAuthStatusOnAppInit());
  }

  /** @description Wist de huidige foutmelding uit de state. */
  clearAuthError(): void {
    this.store.dispatch(AuthActions.clearAuthError());
  }
}

--- END OF FILE ---

--- START OF FILE libs/store/user/src/lib/state/user.actions.ts ---

/**
 * @file user.actions.ts
 * @Version 3.0.0 (Definitive Blueprint)
 * @Description NgRx actions voor de globale User store.
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import { ApplicationSettings } from '@royal-code/shared/domain';
import {
  UserProfile,
  UserAddress,
  UpdateSettingsPayload,
  CreateAddressPayload,
  UpdateAddressPayload,
} from './user.types';
import { State as UserState } from './user.feature';
import { Profile } from 'libs/features/social/domain/src/lib/models/profile.model';

export const UserActions = createActionGroup({
  source: 'User',
  events: {
    // --- Lifecycle & Context ---
    'Context Initialized': emptyProps(),
    'State Cleared on Logout': emptyProps(),

    // --- Profile Actions ---
    'Load Profile Requested': emptyProps(),
    'Load Profile Success': props<{ profile: Profile }>(),
    'Load Profile Failure': props<{ error: string }>(),

    // --- Settings Actions ---
    'Load Settings Requested': emptyProps(),
    'Load Settings Success': props<{ settings: ApplicationSettings }>(),
    'Load Settings Failure': props<{ error: string }>(),
    'Update Settings Submitted': props<{ payload: UpdateSettingsPayload }>(),
    'Update Settings Success': props<{ settings: ApplicationSettings }>(),
    'Update Settings Failure': props<{ error: string }>(),

    // --- Address Actions ---
    'Load Addresses Requested': emptyProps(),
    'Load Addresses Success': props<{ addresses: UserAddress[] }>(),
    'Load Addresses Not Modified': emptyProps(),
    'Load Addresses Failure': props<{ error:string }>(),
    'Address Version Updated': props<{ version: number }>(),
    'Create Address Submitted': props<{ payload: CreateAddressPayload; tempId: string }>(),
    'Create Address Success': props<{ address: UserAddress; tempId: string }>(),
    'Create Address Failure': props<{ error: string; tempId: string }>(),
    'Update Address Submitted': props<{ id: string; payload: UpdateAddressPayload }>(),
    'Update Address Success': props<{ addressUpdate: Update<UserAddress> }>(),
    'Update Address Failure': props<{ error: string; id: string }>(),
    'Delete Address Submitted': props<{ id: string }>(),
    'Delete Address Success': props<{ id: string }>(),
    'Delete Address Failure': props<{ error: string; id: string; originalAddress: UserAddress | null }>(),
  },
});

--- END OF FILE ---

--- START OF FILE libs/store/user/src/lib/state/user.facade.ts ---

/**
 * @file user.facade.ts
 * @Version 3.0.0 (Definitive Blueprint)
 * @Description Public API voor de User state, met een hybride Signal/Observable aanpak en backwards compatibility.
 */
import { Injectable, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserActions } from './user.actions';
import {
  selectProfile,
  selectSettings,
  selectAllAddresses,
  selectDefaultShippingAddress,
  selectIsLoading,
  selectError,
  selectUserViewModel,
} from './user.feature';
import {
  UserProfile,
  UserAddress,
  UpdateSettingsPayload,
  CreateAddressPayload,
  UpdateAddressPayload,
  UserViewModel,
  FeatureError,
} from './user.types';
import { ApplicationSettings } from '@royal-code/shared/domain';
import { Image } from '@royal-code/shared/domain';

@Injectable({ providedIn: 'root' })
export class UserFacade {
  private readonly store = inject(Store);

  // --- ViewModel (Primary API) ---
  readonly viewModel$: Observable<UserViewModel> = this.store.select(selectUserViewModel);
  readonly viewModel: Signal<UserViewModel> = toSignal(this.viewModel$, {
    initialValue: { profile: null, settings: null, addresses: [], defaultShippingAddress: undefined, defaultBillingAddress: undefined, isLoading: true, error: null }
  });

  // --- Granular State Accessors ---
  readonly profile$: Observable<UserProfile | null> = this.store.select(selectProfile);
  readonly profile: Signal<UserProfile | null> = toSignal(this.profile$, { initialValue: null });
  readonly settings$: Observable<ApplicationSettings | null> = this.store.select(selectSettings);
  readonly settings: Signal<ApplicationSettings | null> = toSignal(this.settings$, { initialValue: null });
  readonly addresses$: Observable<UserAddress[]> = this.store.select(selectAllAddresses);
  readonly addresses: Signal<UserAddress[]> = toSignal(this.addresses$, { initialValue: [] });
  readonly defaultShippingAddress$: Observable<UserAddress | undefined> = this.store.select(selectDefaultShippingAddress);
  readonly defaultShippingAddress: Signal<UserAddress | undefined> = toSignal(this.defaultShippingAddress$, { initialValue: undefined });
  readonly isLoading$: Observable<boolean> = this.store.select(selectIsLoading);
  readonly isLoading: Signal<boolean> = toSignal(this.isLoading$, { initialValue: true });
  readonly error$: Observable<FeatureError | null> = this.store.select(selectError);
  readonly error: Signal<FeatureError | null> = toSignal(this.error$, { initialValue: null });
  readonly isLoggedIn = computed(() => !!this.profile());

  // --- BACKWARDS COMPATIBILITY LAYER ---
  readonly avatar$: Observable<Image | null | undefined> = this.profile$.pipe(map(p => p?.avatar));
  readonly isMapViewSelected$: Observable<boolean> = this.settings$.pipe(map(s => !!s?.mapViewSelected));
  readonly isLoadingProfile$ = this.isLoading$;
  readonly isLoadingSettings$ = this.isLoading$;

  selectIsBookmarked(entityId: string | null | undefined): Observable<boolean> {
    if (!entityId) return of(false);
    // TODO: Deze logica moet worden geïmplementeerd met echte bookmark-data in de state.
    // Voorbeeld: return this.store.select(selectIsEntityBookmarkedInProfile(entityId));
    return of(false);
  }

  // --- ACTION DISPATCHERS ---
  updateSetting(setting: Partial<ApplicationSettings>): void {
    this.store.dispatch(UserActions.updateSettingsSubmitted({ payload: setting }));
  }

  clearProfileAndSettings(): void {
    this.store.dispatch(UserActions.stateClearedOnLogout());
  }


  createAddress(payload: CreateAddressPayload): void {
    const tempId = `temp-addr-${Date.now()}`;
    this.store.dispatch(UserActions.createAddressSubmitted({ payload, tempId }));
  }

    updateAddress(id: string, payload: UpdateAddressPayload): void {
    this.store.dispatch(UserActions.updateAddressSubmitted({ id, payload }));
  }

  deleteAddress(id: string): void {
    this.store.dispatch(UserActions.deleteAddressSubmitted({ id }));
  }
}

--- END OF FILE ---

--- START OF FILE libs/store/user/src/lib/state/user.feature.ts ---

/**
 * @file user.feature.ts
 * @Version 7.1.0 (Exported Version Selector)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-19
 * @Description
 *   Definitive, stable NgRx feature for User state. This version correctly
 *   defines and exports the `selectAddressesVersion` selector required by
 *   the ETag interceptor.
 */
import { createFeature, createSelector } from '@ngrx/store';
import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { UserActions } from './user.actions';
import { AuthActions } from '@royal-code/store/auth';
import { UserAddress, FeatureError, UserViewModel } from './user.types';
import { Address, ApplicationSettings, SyncStatus } from '@royal-code/shared/domain';
import { Profile } from 'libs/features/social/domain/src/lib/models/profile.model';

// --- STATE DEFINITION & ADAPTER ---
export interface State extends EntityState<UserAddress> {
  profile: Profile | null;
  settings: ApplicationSettings | null;
  versions: {
    addresses: number;
    settings: number;
    profile: number;
  };
  isLoadingProfile: boolean;
  isLoadingSettings: boolean;
  isLoadingAddresses: boolean;
  error: FeatureError | null;
}

export const addressAdapter: EntityAdapter<UserAddress> = createEntityAdapter<UserAddress>();

export const initialUserState: State = addressAdapter.getInitialState({
  profile: null,
  settings: null,
  versions: {
    addresses: 0,
    settings: 0,
    profile: 0,
  },
  isLoadingProfile: false,
  isLoadingSettings: false,
  isLoadingAddresses: false,
  error: null,
});

// --- REDUCER LOGIC ---
const userReducerInternal = createReducer(
  initialUserState,
  on(AuthActions.logoutCompleted, UserActions.stateClearedOnLogout, () => initialUserState),

  // Versioning
  on(UserActions.addressVersionUpdated, (state, { version }) => ({
    ...state,
    versions: { ...state.versions, addresses: version }
  })),

  // Profile
  on(UserActions.loadProfileRequested, s => ({ ...s, isLoadingProfile: true, error: null })),
  on(UserActions.loadProfileSuccess, (s, { profile }) => ({ ...s, profile, isLoadingProfile: false })),
  on(UserActions.loadProfileFailure, (s, { error }) => ({ ...s, profile: null, isLoadingProfile: false, error: { userMessage: error, operation: 'loadProfile' } })),

  // Settings
  on(UserActions.loadSettingsRequested, s => ({ ...s, isLoadingSettings: true, error: null })),
  on(UserActions.loadSettingsSuccess, (s, { settings }) => ({
    ...s,
    settings: Object.keys(settings).length > 0 ? settings : s.settings,
    isLoadingSettings: false,
    error: null,
  })),
  on(UserActions.loadSettingsFailure, (s, { error }) => ({ ...s, isLoadingSettings: false, error: { userMessage: error, operation: 'loadSettings' } })),

  // Addresses
  on(UserActions.loadAddressesRequested, s => ({ ...s, isLoadingAddresses: true, error: null })),
on(UserActions.loadAddressesSuccess, (state, { addresses }) => {
    console.log(`[UserFeature Reducer] Handling loadAddressesSuccess. Received ${addresses.length} addresses:`, addresses);

    if (addresses.length > 0) {
      return addressAdapter.setAll(addresses, { ...state, isLoadingAddresses: false, error: null });
    } else {
      return addressAdapter.setAll([], { ...state, isLoadingAddresses: false, error: null });
    }
  }),

  on(UserActions.loadAddressesFailure, (state, { error }) => ({ ...state, isLoadingAddresses: false, error: { userMessage: error, operation: 'loadAddresses' } })),

  // Address CUD
  on(UserActions.createAddressSubmitted, (state, { payload, tempId }) => {
    const tempAddress: UserAddress = { ...payload, id: tempId, syncStatus: SyncStatus.Pending };
    return addressAdapter.addOne(tempAddress, state);
  }),

  on(UserActions.createAddressSuccess, (state, { address, tempId }) => {
    const stateWithoutTemp = addressAdapter.removeOne(tempId, state);
    const finalAddress: UserAddress = { ...address, syncStatus: SyncStatus.Synced };
    return addressAdapter.addOne(finalAddress, stateWithoutTemp);
  }),

  on(UserActions.createAddressFailure, (state, { tempId, error }) => {
    return addressAdapter.updateOne({
      id: tempId,
      changes: { syncStatus: SyncStatus.Error, error: error }
    }, state);
  }),

  on(UserActions.updateAddressSubmitted, (state, { id, payload }) => {
    return addressAdapter.updateOne({ id: id as string, changes: { syncStatus: SyncStatus.Pending } }, state);
  }),

  on(UserActions.updateAddressSuccess, (state, { addressUpdate }) => {
    return addressAdapter.updateOne({
        id: addressUpdate.id as string,
        changes: { ...addressUpdate.changes, syncStatus: SyncStatus.Synced }
    }, state);
  }),


  on(UserActions.deleteAddressSubmitted, (state, { id }) => {
    return addressAdapter.updateOne({
      id,
      changes: { syncStatus: SyncStatus.PendingDeletion }
    }, state);
  }),

  on(UserActions.deleteAddressSuccess, (state, { id }) => {
    // ✅ SUCCES: De API call is gelukt, verwijder het item nu ECHT uit de state.
    return addressAdapter.removeOne(id, state);
  }),

  on(UserActions.deleteAddressFailure, (state, { error, id }) => {
    // ✅ ROLLBACK: Zet de syncStatus terug naar SyncStatus.Synced of 'Error'.
    // De UI zal het item weer normaal tonen.
    return addressAdapter.updateOne({
      id,
      changes: { syncStatus: SyncStatus.Synced } // of 'Error' als je dat wilt bijhouden
    }, {
      ...state,
      error: { userMessage: error, operation: 'deleteAddress' }
    });
  })

);

// --- NGRX FEATURE WITH extraSelectors ---
export const userFeature = createFeature({
  name: 'user',
  reducer: userReducerInternal,

  extraSelectors: ({ selectUserState, selectProfile, selectSettings, selectIsLoadingProfile, selectIsLoadingSettings, selectIsLoadingAddresses, selectError, selectVersions }) => {
    const { selectAll, selectEntities } = addressAdapter.getSelectors();

    const selectAllAddresses = createSelector(selectUserState, (state) => selectAll(state));
    const selectAddressEntities = createSelector(selectUserState, (state) => selectEntities(state));

    const selectAddressesVersion = createSelector(selectVersions, (versions) => versions.addresses);

    const selectIsLoading = createSelector(selectIsLoadingProfile, selectIsLoadingSettings, selectIsLoadingAddresses, (p, s, a) => p || s || a);
    const selectDefaultShippingAddress = createSelector(selectAllAddresses, (addresses) => addresses.find(address => address.isDefaultShipping));
    const selectDefaultBillingAddress = createSelector(selectAllAddresses, (addresses) => addresses.find(address => address.isDefaultBilling));

    const selectUserViewModel = createSelector(
        selectProfile,
        selectSettings,
        selectAllAddresses,
        selectDefaultShippingAddress,
        selectDefaultBillingAddress,
        selectIsLoading,
        selectError,
        (profile, settings, addresses, defaultShippingAddress, defaultBillingAddress, isLoading, error): UserViewModel => ({
            profile,
            settings,
            addresses,
            defaultShippingAddress,
            defaultBillingAddress,
            isLoading,
            error
        })
    );

    return {
        selectAllAddresses,
        selectAddressEntities,
        selectIsLoading,
        selectDefaultShippingAddress,
        selectDefaultBillingAddress,
        selectUserViewModel,
        selectAddressesVersion, // <-- Exporteer hem hier
    };
  }
});

// --- PUBLIC API EXPORTS ---
export const {
  name: USER_FEATURE_KEY,
  reducer: userReducer,
  selectProfile,
  selectSettings,
  selectError,
  selectAllAddresses,
  selectIsLoading,
  selectUserViewModel,
  selectDefaultShippingAddress,
  selectDefaultBillingAddress,
  selectAddressesVersion, // <-- En voeg hem hier toe
} = userFeature;

--- END OF FILE ---

--- START OF FILE libs/ui/forms/src/lib/components/address-form/address-form.component.ts ---

import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Address, AppIcon } from '@royal-code/shared/domain';
import { DYNAMIC_OVERLAY_DATA, DYNAMIC_OVERLAY_REF } from '@royal-code/ui/overlay';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiInputComponent } from '@royal-code/ui/input';

export interface AddressFormData {
  address?: Address;
  isLoggedIn: boolean;
  showSaveAddressToggle: boolean;
}

@Component({
  selector: 'royal-code-ui-address-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, UiButtonComponent, UiInputComponent],
  template: `
    <form [formGroup]="addressForm" (ngSubmit)="onSubmit()" class="bg-card p-6 rounded-lg shadow-xl w-full max-w-lg">
      <h2 class="text-xl font-bold mb-4">{{ (data.address?.id ? 'checkout.shipping.editAddressTitle' : 'checkout.shipping.addAddressTitle') | translate }}</h2>
      
      <div class="space-y-4">
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
      </div>

      @if (data.showSaveAddressToggle) {
        <div class="pt-4 mt-4 border-t border-border">
          <div class="flex items-center">
            <input type="checkbox" id="saveAddressOverlay" formControlName="saveAddress" class="h-4 w-4 rounded border-border text-primary focus:ring-primary disabled:opacity-50" [disabled]="!data.isLoggedIn">
            <label for="saveAddressOverlay" class="ml-2 block text-sm text-foreground" [class.text-muted]="!data.isLoggedIn">{{ 'checkout.shipping.form.saveAddress' | translate }}</label>
          </div>
          @if (!data.isLoggedIn) {
            <p class="text-xs text-secondary mt-2">{{ 'checkout.shipping.form.saveAddressForLoggedInUsers' | translate }}</p>
          }
        </div>
      }
      
      <div class="flex justify-end gap-2 mt-6">
        <royal-code-ui-button type="default" (clicked)="close()">{{ 'common.buttons.cancel' | translate }}</royal-code-ui-button>
        <royal-code-ui-button type="primary" htmlType="submit" [disabled]="addressForm.invalid">{{ 'common.buttons.save' | translate }}</royal-code-ui-button>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressFormComponent {
  private readonly fb = inject(FormBuilder);
  readonly data: AddressFormData = inject(DYNAMIC_OVERLAY_DATA);
  private readonly overlayRef = inject(DYNAMIC_OVERLAY_REF);

  addressForm = this.fb.group({
    contactName: [this.data.address?.contactName ?? '', Validators.required],
    street: [this.data.address?.street ?? '', Validators.required],
    houseNumber: [this.data.address?.houseNumber ?? '', Validators.required],
    addressAddition: [this.data.address?.addressAddition ?? null],
    postalCode: [this.data.address?.postalCode ?? '', Validators.required],
    city: [this.data.address?.city ?? '', Validators.required],
    countryCode: [this.data.address?.countryCode ?? '', Validators.required],
    phoneNumber: [this.data.address?.phoneNumber ?? null],
    email: [this.data.address?.email ?? '', [Validators.required, Validators.email]],
    companyName: [this.data.address?.companyName ?? null],
    deliveryInstructions: [this.data.address?.deliveryInstructions ?? null],
    saveAddress: [false],
  });

  onSubmit(): void {
    if (this.addressForm.invalid) return;
    const formValue = this.addressForm.getRawValue();
    const result = {
      address: {
        id: this.data.address?.id ?? '',
        contactName: formValue.contactName,
        street: formValue.street,
        houseNumber: formValue.houseNumber,
        addressAddition: formValue.addressAddition,
        postalCode: formValue.postalCode,
        city: formValue.city,
        countryCode: formValue.countryCode,
        phoneNumber: formValue.phoneNumber,
        email: formValue.email,
        companyName: formValue.companyName,
        deliveryInstructions: formValue.deliveryInstructions,
      } as Address,
      shouldSave: formValue.saveAddress ?? false,
    };
    this.overlayRef.close(result);
  }

  close(): void {
    this.overlayRef.close();
  }
}

--- END OF FILE ---

--- START OF FILE libs/ui/forms/src/lib/components/address-manager/address-manager.component.ts ---

/**
 * @file address-manager.component.ts
 * @Version 13.0.0 (DEFINITIVE: UiCheckboxComponent Integration)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description
 *   Definitieve component voor het beheren van adressen. Deze versie vervangt
 *   de native HTML checkbox met de `UiCheckboxComponent` voor een consistente
 *   UI en correcte CVA-binding. Alle eerdere problemen zijn opgelost.
 */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, OnInit, signal, booleanAttribute } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AppIcon, Address } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiCardComponent } from '@royal-code/ui/card';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiCheckboxComponent, UiInputComponent } from '@royal-code/ui/input';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { NotificationService } from '@royal-code/ui/notifications';
import { UserFacade } from '@royal-code/store/user';

export interface AddressSubmitEvent {
  address: Address;
  shouldSave: boolean;
}

@Component({
  selector: 'royal-code-ui-address-manager',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, TranslateModule,
    UiButtonComponent, UiCardComponent, UiIconComponent, UiInputComponent,
    UiParagraphComponent, UiTitleComponent, UiCheckboxComponent // <<< DE FIX: UiCheckboxComponent toegevoegd aan imports
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
            <a (click)="onAddNewAddressCardClick()" class="block cursor-pointer group add-address-card">
              <royal-code-ui-card extraContentClasses="flex flex-col items-center justify-center p-6 text-center h-full border-2 border-dashed border-border hover:border-primary transition-colors" class="h-full">
                <royal-code-ui-icon [icon]="AppIcon.Plus" sizeVariant="xl" extraClasses="text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 class="text-lg font-semibold text-foreground">{{ 'account.addresses.addAddressTitle' | translate }}</h3>
                <p class="text-sm text-secondary">{{ 'account.addresses.addAddressDescription' | translate }}</p>
              </royal-code-ui-card>
            </a>
          </div>
          <div class="flex items-center justify-center pt-2">
            <div class="h-px flex-grow bg-border"></div>
            <royal-code-ui-paragraph size="sm" color="muted" extraClasses="px-4">{{ 'common.or' | translate }}</royal-code-ui-paragraph>
            <div class="h-px flex-grow bg-border"></div>
          </div>
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

--- END OF FILE ---

--- START OF FILE libs/ui/overlay/src/lib/dynamic-overlay.service.ts ---

/**
 * @file dynamic-overlay.service.ts
 * @Version 5.0.0 (Definitive & Simplified)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-28
 * @Description
 *   The definitive, simplified, and robust version of the DynamicOverlayService.
 *   This version centralizes component attachment logic within the service itself,
 *   ensuring the `componentInstance` on the `DynamicOverlayRef` is always correctly populated.
 */
import { ElementRef, Injectable, Injector, Type, inject, Renderer2, RendererFactory2 } from '@angular/core';
import { Overlay, OverlayConfig, PositionStrategy, ConnectedPosition, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { Subject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { DynamicOverlayContainerComponent } from './dynamic-overlay-container.component';
import { DYNAMIC_OVERLAY_DATA, DYNAMIC_OVERLAY_REF, DynamicOverlayConfig, DynamicOverlayRef } from './dynamic-overlay.tokens';
import { DOCUMENT } from '@angular/common';


@Injectable({ providedIn: 'root' })
export class DynamicOverlayService {
    public readonly overlay = inject(Overlay);
    private rootInjector = inject(Injector);
    private rendererFactory = inject(RendererFactory2);
    private document = inject(DOCUMENT);
    private readonly logPrefix = '[DynamicOverlayService]';

    open<R = any, C = any>(config: DynamicOverlayConfig<any>): DynamicOverlayRef<R, C> {
        const overlayConfig = this.createOverlayConfig(config);
        const overlayRef = this.overlay.create(overlayConfig);
        const renderer = this.getRenderer();
        this.syncTheme(overlayRef, renderer);

        const afterClosedSubject = new Subject<R | undefined>();
        const afterClosed$ = afterClosedSubject.asObservable().pipe(take(1));
        let result: R | undefined;

        const dynamicOverlayRef: DynamicOverlayRef<R, C> = {
            data: config.data ?? null,
            afterClosed$,
            close: (closeResult?: R) => {
                result = closeResult;
                overlayRef.dispose();
            },
            componentInstance: undefined, // Initialize as undefined
        };

        const injector = Injector.create({
            providers: [
                { provide: DYNAMIC_OVERLAY_DATA, useValue: dynamicOverlayRef.data },
                { provide: DYNAMIC_OVERLAY_REF, useValue: dynamicOverlayRef },
            ],
            parent: this.rootInjector,
        });

        // Attach the CONTAINER component
        const containerPortal = new ComponentPortal(DynamicOverlayContainerComponent, null, injector);
        const containerRef = overlayRef.attach(containerPortal);
        containerRef.instance.config = config;
        
        // DE FIX: Attach de CONTENT component AAN de container en zet de `componentInstance`
        const contentPortal = new ComponentPortal(config.component, null, injector);
        const contentRef = containerRef.instance.portalOutlet.attachComponentPortal(contentPortal);
        dynamicOverlayRef.componentInstance = contentRef.instance as C;

        overlayRef.detachments().pipe(take(1)).subscribe(() => {
            if (!afterClosedSubject.closed) {
                afterClosedSubject.next(result);
                afterClosedSubject.complete();
            }
        });

        this.setupCloseListeners(config, overlayRef, dynamicOverlayRef);
        
        return dynamicOverlayRef;
    }

    private syncTheme(overlayRef: OverlayRef, renderer: Renderer2): void {
      const htmlElement = this.document.documentElement;
      if (htmlElement.classList.contains('dark')) {
        renderer.addClass(overlayRef.overlayElement, 'dark');
      }
      const theme = htmlElement.getAttribute('data-theme');
      if (theme) {
        renderer.setAttribute(overlayRef.overlayElement, 'data-theme', theme);
      }
    }

    private setupCloseListeners<R, C>(config: DynamicOverlayConfig<any>, overlayRef: OverlayRef, dynamicOverlayRef: DynamicOverlayRef<R, C>): void {
        const backdropType = config.backdropType ?? 'dark';
        const closeOnClick = config.closeOnClickOutside ?? (backdropType !== 'none');
        if (backdropType !== 'none' && closeOnClick) {
            overlayRef.backdropClick().pipe(take(1)).subscribe(() => dynamicOverlayRef.close());
        }
    }

    private getRenderer(): Renderer2 {
        return this.rendererFactory.createRenderer(this.document.body, null);
    }
    
    private createOverlayConfig(config: DynamicOverlayConfig): OverlayConfig {
        const backdropType = config.backdropType ?? 'dark';
        const hasBackdrop = backdropType !== 'none';
        const backdropClass = !hasBackdrop ? '' : backdropType === 'transparent' ? 'cdk-overlay-transparent-backdrop' : 'cdk-overlay-dark-backdrop';
        const positionStrategy = this.createPositionStrategy(config);

        return new OverlayConfig({
            hasBackdrop: hasBackdrop,
            backdropClass: backdropClass,
            panelClass: ['dynamic-overlay-panel', ...(Array.isArray(config.panelClass) ? config.panelClass : config.panelClass ? [config.panelClass] : [])],
            scrollStrategy: config.overlayConfigOptions?.scrollStrategy ?? this.overlay.scrollStrategies.block(),
            width: config.width,
            maxWidth: config.maxWidth,
            height: config.height,
            positionStrategy: positionStrategy,
            ...config.overlayConfigOptions,
        });
    }

    private createPositionStrategy(config: DynamicOverlayConfig): PositionStrategy {
        if (config.positionStrategy === 'connected' && config.origin) {
            const positions = config.connectedPosition ?? this.getDefaultConnectedPositions();
            return this.overlay.position().flexibleConnectedTo(config.origin).withPositions(positions).withPush(false);
        }
        return this.overlay.position().global().centerHorizontally().centerVertically();
    }

    private getDefaultConnectedPositions(): ConnectedPosition[] {
        return [
            { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 8 },
            { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -8 },
        ];
    }
}

--- END OF FILE ---

--- START OF FILE libs/ui/overlay/src/lib/dynamic-overlay.tokens.ts ---

/**
 * @file dynamic-overlay.tokens.ts
 * @Version 3.0.0 (Definitive Fix: Interface-based Ref)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-24
 * @Description
 *   Vervangt de `DynamicOverlayRef` klasse met een `interface` om de hardnekkige
 *   `_overlayRef is read-only` fout te omzeilen. Dit patroon is robuuster voor DI.
 */
import { ConnectedPosition, OverlayConfig } from '@angular/cdk/overlay';
import { ElementRef, InjectionToken, Type } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * @description Injection token voor de data die aan de overlay wordt meegegeven.
 */
export const DYNAMIC_OVERLAY_DATA = new InjectionToken<any>('DYNAMIC_OVERLAY_DATA');

/**
 * @description De interface die de publieke API van een overlay referentie definieert.
 *              Componenten in de overlay gebruiken dit om zichzelf te sluiten en te communiceren.
 */
export interface DynamicOverlayRef<R = any, T = any> {
  /**
   * @description Een observable die een waarde uitzendt en voltooit wanneer de overlay wordt gesloten.
   */
  readonly afterClosed$: Observable<R | undefined>;

  /**
   * @description De data die is meegegeven bij het openen van de overlay.
   */
  readonly data: T | null;

  /**
   * @description De instantie van de component die binnen deze overlay is geladen.
   *              Gebruik dit om inputs in te stellen of outputs te subscriben.
   */
  componentInstance?: any; // <<-- VOEG DEZE REGEL TOE

  /**
   * @description Sluit de overlay en geeft optioneel een resultaat terug.
   * @param result Het resultaat dat wordt uitgezonden door `afterClosed$`.
   */
  close(result?: R): void;
}

/**
 * @description Injection token voor de `DynamicOverlayRef` instantie.
 */
export const DYNAMIC_OVERLAY_REF = new InjectionToken<DynamicOverlayRef<any>>('DYNAMIC_OVERLAY_REF');

export interface DynamicOverlayConfig<D = any> {
    component: Type<any>;
    data?: D;
    panelClass?: string | string[];
    backdropType?: 'dark' | 'transparent' | 'none';
    closeOnClickOutside?: boolean;
    mobileFullscreen?: boolean;
    positionStrategy?: 'global-center' | 'connected';
    origin?: ElementRef | HTMLElement;
    connectedPosition?: ConnectedPosition[];
    width?: string | number;
    maxWidth?: string | number;
    height?: string | number;
    overlayConfigOptions?: Partial<OverlayConfig>;
    disableCloseOnEscape?: boolean;
}

--- END OF FILE ---