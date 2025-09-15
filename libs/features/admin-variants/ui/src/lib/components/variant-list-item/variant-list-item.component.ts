/**
 * @file variant-list-item.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-28
 * @Description Dumb component for a single, editable variant value.
 */
import { Component, ChangeDetectionStrategy, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PredefinedAttributeValueDto } from '@royal-code/features/admin-products/core';
import { UpdateVariantValuePayload } from '@royal-code/features/admin-variants/core';
import { AppIcon } from '@royal-code/shared/domain';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'admin-variant-list-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiInputComponent, UiButtonComponent, UiIconComponent, TranslateModule],
  template: `
    <form [formGroup]="itemForm" (ngSubmit)="onSave()" class="grid grid-cols-12 gap-4 items-center p-2 border-b border-border last:border-b-0">
      <div class="col-span-1">
        @if (item().colorHex) {
          <div class="w-6 h-6 rounded-full border border-border" [style.backgroundColor]="item().colorHex"></div>
        }
      </div>
      <div class="col-span-2 font-mono text-xs">{{ item().value }}</div>
      <div class="col-span-3">
        <royal-code-ui-input formControlName="displayName" [required]="true" extraClasses="!py-1 text-sm" />
      </div>
      <div class="col-span-2">
        @if (isColor) {
           <royal-code-ui-input formControlName="colorHex" extraClasses="!py-1 text-sm" />
        }
      </div>
      <div class="col-span-2">
         <royal-code-ui-input formControlName="priceModifier" type="number" extraClasses="!py-1 text-sm" />
      </div>
    <div class="col-span-2 flex items-center justify-end gap-2">
        <royal-code-ui-button type="primary" sizeVariant="sm" htmlType="submit" [disabled]="itemForm.pristine || !itemForm.valid">
           {{ 'common.buttons.save' | translate }}
        </royal-code-ui-button>
        <royal-code-ui-button type="fire" sizeVariant="icon" (clicked)="delete.emit(item().id)" [title]="'common.buttons.delete' | translate">
          <royal-code-ui-icon [icon]="AppIcon.Trash2" />
        </royal-code-ui-button>
    </div>
</form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariantListItemComponent {
  item = input.required<PredefinedAttributeValueDto>();
  isColor: boolean = false;
  
  update = output<UpdateVariantValuePayload>();
  delete = output<string>();

  protected readonly AppIcon = AppIcon;
  itemForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.itemForm = this.fb.group({
      displayName: ['', Validators.required],
      colorHex: [null],
      priceModifier: [null],
    });

    effect(() => {
      const currentItem = this.item();
      this.isColor = !!currentItem.colorHex;
      this.itemForm.patchValue({
        displayName: currentItem.displayName,
        colorHex: currentItem.colorHex,
        priceModifier: currentItem.priceModifier
      }, { emitEvent: false });
      this.itemForm.markAsPristine();
    });
  }

  onSave(): void {
    if (this.itemForm.valid && this.itemForm.dirty) {
      this.update.emit(this.itemForm.value);
    }
  }
}