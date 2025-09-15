/**
 * @file cart.feature.ts
 * @Version 26.0.0 (Hardened with Rollback Logic)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-29
 * @description
 *   The definitive, enterprise-grade NgRx feature for the Cart. This version
 *   includes robust rollback mechanisms for failed API calls and uses a strict
 *   enum for synchronization states.
 */
import { createFeature, createSelector, createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { CartActions } from './cart.actions';
import { CartItem, CartSummary, CartViewModel, CartItemViewModel } from './cart.types';
import { getProductPrice, selectProductEntities } from '@royal-code/features/products/core';
import { Image, MediaType, SyncStatus } from '@royal-code/shared/domain';

// --- STATE & ADAPTER ---
export interface State extends EntityState<CartItem> {
  readonly syncStatus: 'Idle' | 'Syncing' | 'Error';
  readonly error: string | null;
  readonly totalVatAmount: number;
  readonly totalDiscountAmount: number;
}
export const cartAdapter: EntityAdapter<CartItem> = createEntityAdapter<CartItem>();
export const initialCartState: State = cartAdapter.getInitialState({
  syncStatus: 'Idle', error: null, totalVatAmount: 0, totalDiscountAmount: 0,
});

// --- REDUCER ---
const cartReducerInternal = createReducer(
  initialCartState,
  on(CartActions.syncWithServerSuccess, (state, { items, totalVatAmount, totalDiscountAmount }) =>
    cartAdapter.setAll((items ?? []).map(item => ({ ...item, syncStatus: SyncStatus.Synced })), {
      ...state, syncStatus: 'Idle' as const, error: null,
      totalVatAmount: totalVatAmount ?? 0,
      totalDiscountAmount: totalDiscountAmount ?? 0,
    })
  ),
  on(CartActions.syncWithServerError, (state, { error }) => ({ ...state, syncStatus: 'Error' as const, error })),

  // --- ADD ITEM ---
  on(CartActions.createNewItem, (state, { payload, tempId }) =>
    cartAdapter.addOne({ id: tempId, productId: payload.productId, variantId: payload.variantId, quantity: payload.quantity, syncStatus: SyncStatus.Pending }, state)
  ),
    on(CartActions.addItemSuccess, (state, { item, tempId }) => {
    // Verwijder eerst het tijdelijke (optimistische) item
    const stateWithoutTemp = cartAdapter.removeOne(tempId, state);
    // Voeg het definitieve, verrijkte item van de API (of lokaal) toe
    // Zorg ervoor dat de volledige 'item' payload wordt gebruikt
    return cartAdapter.addOne({ ...item, syncStatus: SyncStatus.Synced }, stateWithoutTemp);
  }),

  on(CartActions.addItemFailure, (state, { tempId, error }) =>
    cartAdapter.updateOne({ id: tempId, changes: { syncStatus: SyncStatus.Error, error } }, state)
  ),

  // --- UPDATE QUANTITY ---
  on(CartActions.updateItemQuantitySubmitted, (state, { itemId, payload }) =>
    cartAdapter.updateOne({ id: itemId, changes: { syncStatus: SyncStatus.Pending, quantity: payload.quantity } }, state)
  ),
  on(CartActions.updateItemQuantitySuccess, (state, { itemUpdate }) =>
    cartAdapter.updateOne({ id: itemUpdate.id as string, changes: { ...itemUpdate.changes, syncStatus: SyncStatus.Synced } }, state)
  ),
  on(CartActions.updateItemQuantityFailure, (state, { itemId, error }) =>
    cartAdapter.updateOne({ id: itemId, changes: { syncStatus: SyncStatus.Error, error }}, state)
  ),

  // --- REMOVE & CLEAR (with rollback) ---
  on(CartActions.removeItemSuccess, (state, { itemId }) => cartAdapter.removeOne(itemId, state)),
  on(CartActions.removeItemFailure, (state, { originalItem }) =>
    originalItem ? cartAdapter.addOne({ ...originalItem, syncStatus: SyncStatus.Synced }, state) : state
  ),
  on(CartActions.clearCartSuccess, (state) => cartAdapter.removeAll({ ...state, totalVatAmount: 0, totalDiscountAmount: 0 })),
  on(CartActions.clearCartFailure, (state, { originalItems }) =>
    cartAdapter.addMany([...originalItems].map(item => ({ ...item, syncStatus: SyncStatus.Synced })), state)
  )
);

// --- NGRX FEATURE ---
export const cartFeature = createFeature({
  name: 'cart', reducer: cartReducerInternal,
  extraSelectors: ({ selectCartState, selectSyncStatus, selectError, selectTotalVatAmount, selectTotalDiscountAmount }) => {
    const { selectAll: selectAllCartItems } = cartAdapter.getSelectors(selectCartState);
        const selectRichCartItems = createSelector(
        selectAllCartItems, selectProductEntities,
        (items, productEntities): CartItemViewModel[] => items.map(item => {
            const product = item.productId ? productEntities[item.productId] : undefined;

            // --- DE KERN VAN DE FIX ---
            // Als het product niet in de state is gevonden (bv. API-call mislukt of nog niet voltooid),
            // creëer dan een fallback ViewModel op basis van de data die al in het cart item zelf zit.
            if (!product) {
              return {
                ...item,
                product: null, // Geen volledig productobject beschikbaar
                productName: item.productName ?? 'Product wordt geladen...',
                productImageUrl: item.productImageUrl,
                pricePerItem: item.pricePerItem ?? 0,
                lineTotal: (item.pricePerItem ?? 0) * item.quantity,
              } as unknown as CartItemViewModel; // Cast omdat 'product' null is, wat technisch niet overeenkomt.
            }

            // Als het product wel is gevonden, doe de volledige verrijking.
            const pricePerItem = getProductPrice(product, item.variantId);
            const primaryImage = product.media?.find((m): m is Image => m.type === MediaType.IMAGE);
            return {
                ...item,
                product,
                productName: product.name,
                productImageUrl: primaryImage?.variants?.[0]?.url,
                pricePerItem,
                lineTotal: pricePerItem ? pricePerItem * item.quantity : 0,
            };
        })
        // Verwijder de filter, want we retourneren nu altijd een geldig object.
        // .filter((item): item is CartItemViewModel => item !== null) 
    );

    const selectSummary = createSelector(
      selectRichCartItems, selectTotalVatAmount, selectTotalDiscountAmount,
      (richItems, totalVatAmount, totalDiscountAmount): CartSummary => {
        const subTotal = richItems.reduce((acc, item) => acc + item.lineTotal, 0);
        const totalItemCount = richItems.reduce((acc, item) => acc + item.quantity, 0);
        const shippingCost = subTotal >= 50.00 ? 0 : 4.95;
        return {
            totalItemCount, uniqueItemCount: richItems.length, subTotal, totalDiscountAmount,
            isEligibleForFreeShipping: shippingCost === 0, shippingCost,
            totalWithShipping: subTotal - totalDiscountAmount + shippingCost,
            totalVatAmount,
        };
      }
    );
    const selectCartViewModel = createSelector(
      selectRichCartItems, selectSyncStatus, selectError, selectSummary,
      (items, syncStatus, error, summary): CartViewModel => ({
        ...summary, items,
        isLoading: syncStatus === 'Syncing', isSubmitting: items.some(i => i.syncStatus === SyncStatus.Pending),
        error, isEmpty: items.length === 0 && syncStatus !== 'Syncing',
        optimisticItemIds: new Set(items.filter(i => i.syncStatus === SyncStatus.Pending).map(i => i.id))
      })
    );
    return { selectAllCartItems, selectCartViewModel };
  }
});
// --- PUBLIC API ---
export const { name: CART_FEATURE_KEY, reducer: cartReducer, selectCartState, selectAllCartItems, selectCartViewModel } = cartFeature;
