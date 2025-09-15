# Complete Uitleg: Product Reload Fix

## 🔍 Het Oorspronkelijke Probleem

**Symptoom:** Bij browser refresh werd het product niet geladen - je zag "Product not found".

**Oorzaak:** De NgRx store werd gereset bij refresh, maar het product werd niet opnieuw opgehaald van de API.

## 🔄 De Volledige Flow (Hoe het HOORT te werken)

```mermaid
graph TD
    A[Browser Refresh] --> B[Component ngOnInit]
    B --> C[Route Param: 'id']
    C --> D[Facade: selectProduct(id)]
    D --> E[Action: productSelected]
    E --> F[Effect: loadSelectedProduct$]
    F --> G[API Call]
    G --> H[Success Response]
    H --> I[Action: updateProductSuccess]
    I --> J[Reducer: Update Store]
    J --> K[Selector: selectedProduct]
    K --> L[Component: Product Visible]
```

## 🚫 Waar het Fout Ging

### Probleem 1: `exhaustMap` in het Effect

```typescript
// ❌ VERKEERD - exhaustMap blokkeert nieuwe requests
exhaustMap(({ id }) => this.api.getProduct(id))

// ✅ JUIST - switchMap cancelt oude en start nieuwe
switchMap(({ id }) => this.api.getProduct(id))
```

**Wat betekent dit?**
- `exhaustMap`: "Negeer nieuwe requests totdat de huidige klaar is"
- `switchMap`: "Cancel de vorige request en start de nieuwe"

Bij refresh gebeurde dit:
1. Component start eerste API call
2. Component checkt na 2s opnieuw → tweede API call
3. Met `exhaustMap`: tweede call wordt GENEGEERD 
4. Met `switchMap`: eerste call wordt GECANCELD, tweede start

### Probleem 2: `updateOne` in de Reducer

```typescript
// ❌ VERKEERD - kan alleen bestaande producten updaten
productAdapter.updateOne(productUpdate, state)

// ✅ JUIST - voegt toe of update bestaand product  
productAdapter.upsertOne(productUpdate.changes as Product, state)
```

**Wat betekent dit?**
- `updateOne`: Update alleen als product AL bestaat in store
- `upsertOne`: Update bestaand of voeg nieuw toe ("upsert" = update + insert)

Bij refresh was de store LEEG, dus `updateOne` faalde stilletjes.

## 🛠 Stappen Die We Hebben Genomen

### Stap 1: Debug Logging Toegevoegd
```typescript
console.log(`🚀 [ProductEffects] productSelected action:`, action);
console.log(`📡 [ProductEffects] Starting API call`);
console.log(`📥 [ProductEffects] API response received:`, dto);
```
**Doel:** Zien waar in de flow het stopte.

### Stap 2: `exhaustMap` → `switchMap` 
**Probleem:** Tweede requests werden genegeerd.
**Oplossing:** Switchmap laat nieuwe requests altijd door.

### Stap 3: `updateOne` → `upsertOne`
**Probleem:** Kan niet updaten wat er niet is.
**Oplossing:** Upsert voegt toe als het niet bestaat.

### Stap 4: TypeScript Fix
**Probleem:** `Partial<Product>` vs `Product` type mismatch.
**Oplossing:** Type assertion `as Product`.

## 📚 RxJS Operators Uitgelegd

### `map`
```typescript
map((params: ParamMap) => params.get('id'))
// Transformeert: {name: 'John'} → 'John'
```
**Doel:** Transformeer data van A naar B.

### `distinctUntilChanged`
```typescript
// Input:  'id1', 'id1', 'id2', 'id2', 'id1'
// Output: 'id1',        'id2',        'id1'
```
**Doel:** Skip dubbele waarden. Voorkomt onnodig werk.

### `takeUntilDestroyed`
```typescript
.pipe(takeUntilDestroyed(this.destroyRef))
// Automatisch unsubscribe bij component destroy
```
**Doel:** Voorkom memory leaks. Angular doet de cleanup.

### `filter`
```typescript
filter(action => !!action.id)
// Laat alleen door als ID bestaat
```
**Doel:** Skip items die niet voldoen aan criteria.

### `switchMap` vs `exhaustMap` vs `mergeMap`
```typescript
// switchMap: Cancel vorige, start nieuwe
switchMap(id => api.get(id))

// exhaustMap: Negeer nieuwe tot vorige klaar is  
exhaustMap(id => api.get(id))

// mergeMap: Start alle parallal (kan veel requests maken!)
mergeMap(id => api.get(id))
```

## 🏪 NgRx Entity Adapter Methods

### `updateOne` vs `upsertOne` vs `setOne`
```typescript
// updateOne: Update alleen bestaande entity
state = { entities: { '1': {id: '1', name: 'John'} } }
updateOne({id: '2', changes: {name: 'Jane'}}) // ❌ Werkt niet! ID '2' bestaat niet

// upsertOne: Update bestaande OF voeg nieuwe toe
upsertOne({id: '2', name: 'Jane'}) // ✅ Voegt '2' toe

// setOne: Vervang/voeg toe (overschrijft volledig)
setOne({id: '1', name: 'Johnny'}) // ✅ Vervangt '1' volledig
```

### Andere Entity Methods
```typescript
// Voeg één toe
addOne(product)

// Voeg meerdere toe  
addMany([product1, product2])

// Verwijder één
removeOne('id')

// Vervang alle
setAll([product1, product2])

// Leeg maken
removeAll()
```

## 🔍 Signals vs Observables

### Observable (RxJS)
```typescript
// Stream van waarden over tijd
selectedProduct$: Observable<Product | undefined>

// Subscriben
this.selectedProduct$.subscribe(product => {
  console.log('Product changed:', product);
});
```

### Signal (Angular 17+)
```typescript
// Reactieve waarde
selectedProduct: Signal<Product | undefined>

// Lezen
const product = this.selectedProduct(); // ← Note de ()

// Reageren (in template)
{{ selectedProduct()?.name }}
```

## 🎯 Waarom het Nu Werkt

1. **`switchMap`**: Nieuwe requests worden niet meer geblokkeerd
2. **`upsertOne`**: Product wordt toegevoegd aan lege store
3. **Route als truth**: Component haalt altijd ID uit URL
4. **Proper error handling**: We zien waar het faalt

## 💡 Lessons Learned

### Voor NgRx Effects:
- Gebruik `switchMap` voor user-triggered actions (clicks, route changes)
- Gebruik `exhaustMap` voor one-shot actions (initial loads)
- Gebruik `mergeMap` alleen als je parallel requests wilt

### Voor NgRx Entities:
- `updateOne` alleen voor bestaande entities
- `upsertOne` when in doubt - veiligste optie
- `addOne` alleen voor nieuwe entities

### Voor Component State:
- Route parameters = single source of truth
- Signals voor reactive UI
- Effects in constructor, subscriptions in ngOnInit

## 🚀 Best Practices

```typescript
// ✅ GOED: Clean separation
ngOnInit() {
  // Only side effects hier
  this.routeId$.subscribe(id => this.facade.selectProduct(id));
}

constructor() {
  // Reactive logic hier  
  effect(() => {
    const product = this.selectedProduct();
    // React to changes
  });
}

// ✅ GOED: Descriptive selectors
readonly selectedProduct = this.facade.selectedProduct;
readonly isLoading = this.facade.isLoading;

// ❌ SLECHT: Complex logic in template
{{ someComplexFunction(data1, data2, data3) }}
```

Dit was een perfect debugging scenario - je hebt nu ervaring met:
- NgRx debugging techniques
- RxJS operator differences  
- Entity adapter methods
- Angular Signals
- State management patterns

Geweldig werk! 🎉
