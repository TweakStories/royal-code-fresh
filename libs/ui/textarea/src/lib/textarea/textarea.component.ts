/**
 * @file ui-textarea.component.ts
 * @Version 1.6.0 (Definitive - Required Input Added)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-09-09
 * @Description
 *   Een standalone, enterprise-ready textarea component. Deze definitieve versie
 *   voegt de ontbrekende `required` input toe, inclusief een visuele indicator
 *   in de template, wat de oorspronkelijke compilerfout oplost.
 */
import { CommonModule } from '@angular/common';
import {
  Component, ChangeDetectionStrategy, forwardRef, afterNextRender, Injector,
  inject, input, computed, viewChild, effect, booleanAttribute, ElementRef,
  signal, model, output, OutputEmitterRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextId = 0;

@Component({
  selector: 'royal-code-ui-textarea',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full" [ngClass]="extraContainerClasses()">
      @if (label()) {
        <label [for]="id()" class="block text-sm font-medium text-foreground mb-1">
          {{ label() }}
          <!-- DE FIX: Voegt een asterisk toe als het veld verplicht is -->
          @if (required()) {
            <span class="text-error ml-1">*</span>
          }
        </label>
      }
      <textarea #textarea
        [id]="id()"
        [attr.name]="name() || id()"
        [class]="textareaClasses()"
        [placeholder]="placeholder()"
        [attr.rows]="rows()"
        [attr.maxLength]="maxLength() > 0 ? maxLength() : null"
        [value]="value()"
        [readonly]="readonly()"
        [required]="required()"
        [attr.aria-label]="ariaLabel() || label()"
        [attr.aria-invalid]="!!error()"
        [attr.aria-describedby]="errorDescriptionId()"
        [disabled]="disabled()"
        (input)="onInput($event)"
        (blur)="handleBlur()"
        (focus)="handleFocus()"
      ></textarea>
      @if (shouldShowCounter()) {
        <div class="absolute bottom-2 right-2 text-xs"
             [class.text-error]="charCount() >= maxLength()"
             [class.text-muted]="charCount() < maxLength()">
          {{ charCount() }} / {{ maxLength() }}
        </div>
      }
      @if (error() || success()) {
        <p [id]="errorDescriptionId()"
           class="mt-1 text-xs"
           [class.text-error]="!!error()"
           [class.text-success]="!!success()"
           role="alert">
           {{ error() || success() }}
        </p>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiTextareaComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiTextareaComponent implements ControlValueAccessor {
  private readonly injector = inject(Injector);
  private readonly textareaRef = viewChild.required<ElementRef<HTMLTextAreaElement>>('textarea');

  readonly value = model('');
  readonly id = input(`ui-textarea-${nextId++}`);
  readonly name = input<string>();
  readonly label = input<string>();
  readonly placeholder = input<string>('');
  readonly extraContainerClasses = input<string>('');
  readonly extraTextareaClasses = input<string>('');
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute }); // <<< DE FIX: 'required' input toegevoegd
  readonly ariaLabel = input<string>();
  readonly showCharCounter = input(false, { transform: booleanAttribute });
  readonly autoResize = input(true, { transform: booleanAttribute });
  readonly maxHeightPx = input<number>();
  readonly error = input<string | null>(null);
  readonly success = input<string | null>(null);

  readonly rows = input(3, {
    transform: (value: number | string) => {
      const num = Number(value);
      return isNaN(num) ? 3 : num;
    }
  });

  readonly minHeightPx = input(60, {
    transform: (value: number | string) => {
      const num = Number(value);
      return isNaN(num) ? 60 : num;
    }
  });

  readonly maxLength = input(-1, {
    transform: (value: number | string | undefined | null) => {
      const num = Number(value);
      return isNaN(num) || num <= 0 ? -1 : num;
    }
  });

  readonly blurred: OutputEmitterRef<void> = output<void>();
  readonly focusedEvent: OutputEmitterRef<void> = output<void>();

  readonly _isDisabled = computed(() => this._cvaDisabled() || this.disabled());
  private readonly _cvaDisabled = signal(false);
  readonly _isFocused = signal(false);

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  readonly charCount = computed(() => this.value()?.length ?? 0);
  readonly shouldShowCounter = computed(() => this.maxLength() > 0 && this.showCharCounter());
  readonly errorDescriptionId = computed(() => (this.error() || this.success()) ? `${this.id()}-description` : null);

  readonly textareaClasses = computed(() => {
    const base = `block w-full bg-input px-3 py-2 text-sm ring-1 ring-inset ring-offset-background transition-colors placeholder:text-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`;
    const stateClasses = this.error() ? 'ring-error focus-visible:ring-error'
      : this.success() ? 'ring-success focus-visible:ring-success'
      : 'ring-border focus-visible:ring-primary';
    const resizeClass = this.autoResize() ? 'resize-none' : 'resize-y';
    return `${base} ${stateClasses} ${resizeClass} ${this.extraTextareaClasses()}`;
  });

  constructor() {
    effect(() => {
        this.value();
        this.onChange(this.value());
        if (this.autoResize()) {
            afterNextRender(() => this.adjustHeight(), { injector: this.injector });
        }
    });
  }

  onInput(event: Event): void {
    const newValue = (event.target as HTMLTextAreaElement).value;
    this.value.set(newValue);
  }

  handleBlur(): void {
    this._isFocused.set(false);
    this.onTouched();
    this.blurred.emit();
  }

  handleFocus(): void {
    this._isFocused.set(true);
    this.focusedEvent.emit();
  }

  private adjustHeight(): void {
    const textarea = this.textareaRef()?.nativeElement;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const minHeight = this.minHeightPx();
      const maxHeight = this.maxHeightPx() ?? Infinity;
      const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = scrollHeight > newHeight ? 'auto' : 'hidden';
    }
  }

  writeValue(obj: any): void { this.value.set(obj ?? ''); }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this._cvaDisabled.set(isDisabled); }

  public focus(): void {
    this.textareaRef()?.nativeElement.focus();
  }
}