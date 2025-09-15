/**
 * @file variant-create-form.component.ts
 * @Version 2.1.0 (Cleaned & Production Ready)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-28
 * @Description Dumb component for creating a new reusable attribute value.
 *              This version correctly implements the conditional display and validation
 *              for creating a new attribute group.
 */
import { Component, ChangeDetectionStrategy, input, output, computed, Signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateVariantValuePayload } from '@royal-code/features/admin-variants/core';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { TranslateModule } from '@ngx-translate/core';
import { InfoIconComponent } from '../info-icon/info-icon.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'admin-variant-create-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiButtonComponent, UiTitleComponent, TranslateModule, InfoIconComponent],
  template: `
    <div class="p-6 bg-card border-2 border-dashed border-primary rounded-xs">
      <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'admin.variants.create.title' | translate" />
      <form [formGroup]="createForm" (ngSubmit)="onSave()" class="mt-4 space-y-4">
        
        <!-- === GROUP SELECTION === -->
        <div>
          <label class="block text-sm font-medium text-foreground mb-1">{{ 'admin.variants.create.group' | translate }}</label>
          <select formControlName="attributeType" class="w-full p-2 border border-input rounded-md bg-background text-sm">
            <option value="" disabled>{{ 'admin.variants.create.chooseGroup' | translate }}</option>
            @for(type of attributeTypes(); track type) {
              <option [value]="type">{{ type }}</option>
            }
            <option value="__new__">{{ 'admin.variants.create.newGroup' | translate }}</option>
          </select>
          
          @if (showNewAttributeTypeInput()) {
            <div class="mt-2">
              <royal-code-ui-input 
                formControlName="newAttributeType" 
                [placeholder]="'admin.variants.create.newGroupPlaceholder' | translate" 
                [required]="true"
              />
            </div>
          }
        </div>

        <!-- === VALUE & DISPLAY NAME === -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <royal-code-ui-input formControlName="value" [label]="'admin.variants.table.systemValue' | translate" [required]="true" [placeholder]="'admin.variants.create.systemValuePlaceholder' | translate" />
          <royal-code-ui-input formControlName="displayName" [label]="'admin.variants.table.displayName' | translate" [required]="true" [placeholder]="'admin.variants.create.displayNamePlaceholder' | translate" />
        </div>

        <!-- === CONDITIONAL FIELDS === -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @if (isColorType()) {
              <royal-code-ui-input formControlName="colorHex" [label]="'admin.variants.table.hexCode' | translate" [placeholder]="'#1A2B3C'" />
            }
            <div>
                 <label class="block text-sm font-medium text-foreground mb-1">
                    {{ 'admin.variants.table.priceModifier' | translate }}
                    <admin-info-icon [infoText]="'admin.variants.tooltips.priceModifierGlobal' | translate" />
                 </label>
                 <royal-code-ui-input formControlName="priceModifier" type="number" />
            </div>
        </div>

        <!-- === ACTIONS === -->
        <div class="flex justify-end gap-3 pt-4 border-t border-border">
          <royal-code-ui-button type="outline" (clicked)="cancel.emit()">{{ 'common.buttons.cancel' | translate }}</royal-code-ui-button>
          <royal-code-ui-button type="primary" htmlType="submit" [disabled]="!createForm.valid">{{ 'common.buttons.save' | translate }}</royal-code-ui-button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariantCreateFormComponent {
  // === Inputs & Outputs ===
  attributeTypes = input.required<string[]>();
  save = output<CreateVariantValuePayload>();
  cancel = output<void>();

  // === Template Helpers ===
  protected readonly TitleTypeEnum = TitleTypeEnum;
  
  // === Form & State ===
  createForm: FormGroup;
  protected attributeTypeControlValue: Signal<string | null>;
  protected showNewAttributeTypeInput: Signal<boolean>;
  protected isColorType: Signal<boolean>;
  
  constructor(private fb: FormBuilder) {
    // --- Group: Form Initialization ---
    this.createForm = this.fb.group({
      value: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]+$/)]],
      displayName: ['', Validators.required],
      attributeType: ['', Validators.required],
      newAttributeType: [''],
      colorHex: [null],
      priceModifier: [null],
    });

    // --- Group: Signal Initialization (vereist injectiecontext) ---
    this.attributeTypeControlValue = toSignal(this.createForm.get('attributeType')!.valueChanges.pipe(
      startWith(this.createForm.get('attributeType')!.value)
    ));

    this.showNewAttributeTypeInput = computed(() => {
      const value = this.attributeTypeControlValue();
      return String(value || '').trim() === '__new__';
    });
    
    this.isColorType = computed(() => {
      const selectedType = this.attributeTypeControlValue();
      if (String(selectedType || '').trim() === '__new__') {
        const newType = this.createForm.get('newAttributeType')?.value || '';
        return newType.toLowerCase() === 'color';
      }
      return String(selectedType || '').trim().toLowerCase() === 'color';
    });

    // --- Group: Dynamic Validator Setup ---
    this.createForm.get('attributeType')?.valueChanges.subscribe(value => {
      const newAttributeTypeControl = this.createForm.get('newAttributeType');
      if (value === '__new__') {
        newAttributeTypeControl?.setValidators([Validators.required]);
      } else {
        newAttributeTypeControl?.clearValidators();
      }
      newAttributeTypeControl?.updateValueAndValidity();
    });
  }

  // === Event Handlers ===
  onSave(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    const formValue = this.createForm.getRawValue();
    const rawType = formValue.attributeType === '__new__' ? formValue.newAttributeType : formValue.attributeType;
    const payload: CreateVariantValuePayload = {
      value: formValue.value,
      displayName: formValue.displayName,
      attributeType: rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase(),
      colorHex: formValue.colorHex,
      priceModifier: Number(formValue.priceModifier) || 0,
    };
    this.save.emit(payload);
  }
}