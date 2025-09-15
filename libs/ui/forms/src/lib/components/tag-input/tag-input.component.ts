/**
 * @file tag-input.component.ts
 * @Version 2.0.0 (Refactored for pure UiInputComponent CVA with ngModel)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-05
 * @Description
 *   A reusable tag input component with autocomplete functionality. This version
 *   is refactored to correctly interact with the pure `UiInputComponent` CVA,
 *   relying on `ngModel` for two-way binding to its internal input field.
 */
import { Component, ChangeDetectionStrategy, input, inject, signal, computed, effect, OnInit, OnDestroy, forwardRef, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms'; // FormsModule voor ngModel
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter, map, catchError } from 'rxjs/operators';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UiInputComponent } from '@royal-code/ui/input';

@Component({
  selector: 'royal-code-ui-tag-input',
  standalone: true,
  imports: [CommonModule, FormsModule, UiIconComponent, UiInputComponent],
  template: `
    <div>
      @if (label()) {
        <label [for]="inputId()" class="block text-sm font-medium text-foreground mb-1">{{ label() }}</label>
      }
      <div class="relative">
        <royal-code-ui-input
          [id]="inputId()"
          type="text"
          [placeholder]="placeholder()"
          [(ngModel)]="currentInputValue"
          (blur)="onInputBlur()"
          (focusedEvent)="onInputFocus()"
          [disabled]="isDisabled()"
          [icon]="AppIcon.Search"
          iconPosition="right"
        ></royal-code-ui-input>

        @if (suggestions().length > 0 && showSuggestions()) {
          <ul class="absolute z-10 w-full bg-card border border-border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
            @for(suggestion of suggestions(); track suggestion.name) {
              <li
                class="px-3 py-2 cursor-pointer hover:bg-hover text-sm"
                (mousedown)="onSuggestionMouseDown($event, suggestion.name)"
              >
                {{ suggestion.name }}
              </li>
            }
          </ul>
        }
      </div>

      <div class="mt-2 flex flex-wrap gap-2">
        @for(tag of selectedTags(); track tag) {
          <span class="flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-sm text-primary-on border border-primary">
            {{ tag }}
            <button type="button" (click)="removeTag(tag)" class="ml-1 text-primary-on/80 hover:text-primary-on">
              <royal-code-ui-icon [icon]="AppIcon.X" sizeVariant="xs" />
            </button>
          </span>
        }
        @if (selectedTags().length === 0 && !currentInputValue()) {
            <p class="text-sm text-secondary mt-1">{{ noTagsMessage() }}</p>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiTagInputComponent),
      multi: true,
    },
  ],
})
export class UiTagInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  // Inputs
  readonly label = input<string>('Tags');
  readonly placeholder = input<string>('Voeg tags toe...');
  readonly noTagsMessage = input<string>('Nog geen tags gekozen.');
  readonly debounceTimeMs = input<number>(300);
  readonly searchFn = input<(term: string) => Observable<{id: string, name: string}[]>>();

  // Dependencies
  // Note: API service should be provided via input function
  private readonly destroyRef = inject(DestroyRef);

  // Internal state (signals & model())
  protected readonly inputId = signal(`tag-input-${Math.random().toString(36).substring(2, 9)}`);
  protected readonly selectedTags = signal<string[]>([]);
  protected currentInputValue = signal<string>(''); // Gebruikt met [(ngModel)]
  protected readonly suggestions = signal<{id: string, name: string}[]>([]);
  protected readonly showSuggestions = signal<boolean>(false);
  protected readonly AppIcon = AppIcon;

  // ControlValueAccessor internal functions
  private _onChange: (value: string[] | null) => void = () => {};
  private _onTouched: () => void = () => {};
  protected isDisabled = signal(false); // Via setDisabledState

  // RxJS Subjects
  private readonly searchTerm$ = new Subject<string>();

  constructor() {
    // Effect om de waarde van de interne input te volgen voor de zoekterm
    effect(() => {
      this.searchTerm$.next(this.currentInputValue());
    });
  }

  ngOnInit(): void {
    this.searchTerm$.pipe(
      debounceTime(this.debounceTimeMs()),
      distinctUntilChanged(),
      filter(term => term.length > 1),
      switchMap(term => {
        const searchFunction = this.searchFn();
        if (!searchFunction) {
          return of([]);
        }
        return searchFunction(term).pipe(
          map((tags: {id: string, name: string}[]) => tags),
          catchError(() => of([] as {id: string, name: string}[]))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((suggestions: {id: string, name: string}[]) => {
      this.suggestions.set(suggestions);
      this.showSuggestions.set(suggestions.length > 0);
    });
  }

  ngOnDestroy(): void {
    this.searchTerm$.complete();
  }

  // ControlValueAccessor methods
  writeValue(value: string[] | null): void {
    this.selectedTags.set(value || []);
  }

  registerOnChange(fn: (value: string[] | null) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  // Event Handlers
  onInputFocus(): void {
    if (this.currentInputValue().length > 1) {
      this.searchTerm$.next(this.currentInputValue());
    }
    this.showSuggestions.set(true);
  }

  onSuggestionMouseDown(event: MouseEvent, tagName: string): void {
    event.preventDefault(); // Voorkom dat de input blur-event triggert en de suggesties sluit
    this.addTag(tagName);
  }

  onInputBlur(): void {
    if (this.currentInputValue().length > 0) {
      this.addTag(this.currentInputValue());
    }
    
    // Kleine timeout om click op suggestie toe te staan voordat suggesties verdwijnen
    setTimeout(() => {
      this.showSuggestions.set(false);
      this._onTouched();
    }, 100);
  }

  // Tag Management Logic
  addTag(tag: string): void {
    const trimmedTag = tag.trim();
    if (trimmedTag && !this.selectedTags().includes(trimmedTag)) {
      this.selectedTags.update((tags: string[]) => [...tags, trimmedTag]);
      this.currentInputValue.set(''); // Reset de inputwaarde
      this.suggestions.set([]);
      this.showSuggestions.set(false);
      this._onChange(this.selectedTags());
      this._onTouched();
    }
  }

  removeTag(tagToRemove: string): void {
    this.selectedTags.update((tags: string[]) => tags.filter((tag: string) => tag !== tagToRemove));
    this._onChange(this.selectedTags());
    this._onTouched();
  }
}