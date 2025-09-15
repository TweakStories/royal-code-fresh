/**
 * @file ui-accordion.component.ts
 * @Version 1.1.2 - Enhanced logging for state persistence.
 * @Author ChallengerAppDevAI
 * @Description
 *   Manages a collection of accordion items, allowing single or multiple items
 *   to be open simultaneously. Supports persisting the open/closed state of items
 *   to localStorage if a `persistStateKey` is provided.
 */
import {
  Component,
  ChangeDetectionStrategy,
  input,
  booleanAttribute,
  signal,
  WritableSignal,
  effect,
  PLATFORM_ID,
  Inject,
  OnInit,
  Injector,
  inject,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LoggerService } from '@royal-code/core/core-logging';

@Component({
  selector: 'royal-code-ui-accordion',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ui-accordion space-y-1" role="presentation">
      <ng-content select="royal-code-ui-accordion-item"></ng-content>
    </div>
  `,
})
export class UiAccordionComponent implements OnInit, OnChanges {
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly initialOpenItems = input<string | string[] | null>(null);
  readonly persistStateKey = input<string | undefined>(undefined);

  private readonly _internalOpenItems: WritableSignal<string | string[] | null> = signal<string | string[] | null>(null);

  private readonly  isBrowser: boolean;
  private hasInitializedFromInputs = false; // Belangrijke vlag
  private readonly logger = inject(LoggerService, { optional: true });
  private readonly injector = inject(Injector);
  private readonly platformId: Object;
  private readonly logContextBase = '[UiAccordionComponent]';

  constructor() {
    this.platformId = inject(PLATFORM_ID);
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.logger?.info(`${this.logContextBase} Constructor. isBrowser: ${this.isBrowser}`);

    // Effect om te reageren op veranderingen in _internalOpenItems NA initialisatie
    // Dit is een secundair mechanisme voor opslag; toggleItem slaat direct op.
    effect(() => {
      const stateToSave = this._internalOpenItems();
      const key = this.persistStateKey();
      const currentLogCtx = `${this.logContextBase} (Key: ${key || 'NO_KEY'}) [Effect]`;

      if (this.isBrowser && key && this.hasInitializedFromInputs) {
        this.logger?.debug(`${currentLogCtx} _internalOpenItems changed to:`, JSON.stringify(stateToSave), ". Attempting to save to localStorage.");
        // We verplaatsen het daadwerkelijke opslaan naar een expliciete methode,
        // maar dit effect kan nuttig zijn voor debugging of als state op andere manieren wijzigt.
        // this.saveStateToLocalStorage(); // Roep expliciete save methode aan
      } else {
        this.logger?.debug(`${currentLogCtx} _internalOpenItems changed, but not saving. isBrowser: ${this.isBrowser}, key: ${key}, hasInitialized: ${this.hasInitializedFromInputs}`);
      }
    }, { injector: this.injector });
  }

  ngOnInit(): void {
    const key = this.persistStateKey();
    const currentLogCtx = `${this.logContextBase} (Key: ${key || 'NO_KEY'}) [ngOnInit]`;
    this.logger?.info(`${currentLogCtx} Initializing state...`);

    this.initializeOrUpdateState(true); // true = isFullInitialization
    this.hasInitializedFromInputs = true; // Zet vlag NA de eerste initialisatie

    this.logger?.info(`${currentLogCtx} Initialized. Current open items:`, JSON.stringify(this._internalOpenItems()), `Initial input:`, JSON.stringify(this.initialOpenItems()));
  }

  ngOnChanges(changes: SimpleChanges): void {
    const key = this.persistStateKey(); // Pak de *huidige* key voor logging
    const currentLogCtx = `${this.logContextBase} (Key: ${key || 'NO_KEY'}) [ngOnChanges]`;

    if (this.hasInitializedFromInputs) { // Alleen als ngOnInit al geweest is
      const keyChanged = !!changes['persistStateKey'];
      const initialItemsChanged = !!changes['initialOpenItems'];

      if (keyChanged || initialItemsChanged) {
        this.logger?.info(`${currentLogCtx} Inputs changed. KeyChanged: ${keyChanged}, InitialItemsChanged: ${initialItemsChanged}. Re-evaluating state.`);
        if (changes['persistStateKey']) {
            this.logger?.debug(`${currentLogCtx} persistStateKey changed from '${changes['persistStateKey'].previousValue}' to '${changes['persistStateKey'].currentValue}'`);
        }
        if (changes['initialOpenItems']) {
            this.logger?.debug(`${currentLogCtx} initialOpenItems changed from '${JSON.stringify(changes['initialOpenItems'].previousValue)}' to '${JSON.stringify(changes['initialOpenItems'].currentValue)}'`);
        }
        this.initializeOrUpdateState(keyChanged); // Als key verandert, is het een 'full' herinitialisatie
      }
    } else {
        this.logger?.debug(`${currentLogCtx} ngOnChanges called BEFORE ngOnInit completed. Skipping re-evaluation.`);
    }
  }

  private initializeOrUpdateState(isFullInitialization: boolean): void {
    const currentPersistKey = this.persistStateKey();
    const currentInitialItems = this.initialOpenItems();
    const logCtx = `${this.logContextBase} (Key: ${currentPersistKey || 'NO_KEY'}) [initializeOrUpdateState (fullInit: ${isFullInitialization})]`;
    this.logger?.debug(`${logCtx} START. Initial input items:`, JSON.stringify(currentInitialItems));

    let stateToApply: string | string[] | null = null;

    if (this.isBrowser && currentPersistKey) {
      const storedStateString = localStorage.getItem(currentPersistKey);
      this.logger?.debug(`${logCtx} Attempting to read from localStorage key '${currentPersistKey}'. Found:`, storedStateString === null ? "NULL" : `"${storedStateString}"`);

      if (storedStateString !== null) {
        try {
          stateToApply = JSON.parse(storedStateString);
          this.logger?.info(`${logCtx} Successfully parsed state from localStorage:`, stateToApply);
        } catch (e) {
          this.logger?.error(`${logCtx} Failed to parse stored state. Error:`, e, `Stored string: "${storedStateString}"`);
          stateToApply = currentInitialItems;
          this.logger?.warn(`${logCtx} Using initialOpenItems due to localStorage parse error:`, stateToApply);
        }
      } else {
        stateToApply = currentInitialItems;
        this.logger?.info(`${logCtx} No state in localStorage for key '${currentPersistKey}'. Using initialOpenItems:`, stateToApply);
      }
    } else {
      stateToApply = currentInitialItems;
      this.logger?.info(`${logCtx} No persistStateKey provided or not in browser. Using initialOpenItems:`, stateToApply);
    }

    this.logger?.debug(`${logCtx} Raw state to apply (from localStorage or initialInput) before 'multiple' check:`, JSON.stringify(stateToApply));

    if (this.multiple()) {
      this._internalOpenItems.set(Array.isArray(stateToApply) ? stateToApply : (stateToApply ? [stateToApply] : []));
    } else {
      this._internalOpenItems.set(Array.isArray(stateToApply) ? (stateToApply[0] ?? null) : stateToApply);
    }
    this.logger?.info(`${logCtx} END. _internalOpenItems updated. Is multiple: ${this.multiple()}. New state:`, JSON.stringify(this._internalOpenItems()));
  }

  toggleItem(itemId: string): void {
    const key = this.persistStateKey();
    const logCtx = `${this.logContextBase} (Key: ${key || 'NO_KEY'}) [toggleItem]`;
    this.logger?.info(`${logCtx} Called for ID: ${itemId}. Current open items BEFORE toggle:`, JSON.stringify(this._internalOpenItems()));

    if (this.multiple()) {
      this._internalOpenItems.update(current => {
        const currentArray = Array.isArray(current) ? current : (current ? [current] : []);
        const index = currentArray.indexOf(itemId);
        if (index > -1) {
          return currentArray.filter(id => id !== itemId);
        } else {
          return [...currentArray, itemId];
        }
      });
    } else {
      this._internalOpenItems.update(current => (current === itemId ? null : itemId));
    }
    this.logger?.info(`${logCtx} _internalOpenItems AFTER toggle for ${itemId}:`, JSON.stringify(this._internalOpenItems()));

    // **Expliciet opslaan naar localStorage na elke toggle, direct hier.**
    this.saveStateToLocalStorage();
  }

  private saveStateToLocalStorage(): void {
    const pKey = this.persistStateKey();
    if (this.isBrowser && pKey) {
      const logContext = `${this.logContextBase} (Key: ${pKey}) [saveStateToLocalStorage]`;
      try {
        const stateToSave = this._internalOpenItems(); // Pak de HUIDIGE waarde van het signal
        localStorage.setItem(pKey, JSON.stringify(stateToSave));
        this.logger?.info(`${logContext} Successfully saved state:`, stateToSave);
      } catch (e) {
        this.logger?.error(`${logContext} Failed to save state to localStorage. Error:`, e);
      }
    } else {
        this.logger?.debug(`${this.logContextBase} [saveStateToLocalStorage] Not saving. isBrowser: ${this.isBrowser}, persistKey: ${pKey}`);
    }
  }

  isItemOpen(itemId: string): boolean {
    const openState = this._internalOpenItems();
    const isMultiple = this.multiple();
    const isOpenResult = isMultiple
      ? Array.isArray(openState) && openState.includes(itemId)
      : openState === itemId;
    return isOpenResult;
  }
}
