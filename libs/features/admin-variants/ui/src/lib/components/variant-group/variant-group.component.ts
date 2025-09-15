/**
 * @file variant-group.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-28
 * @Description Dumb component to display a group of variants (e.g., all colors).
 */
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredefinedAttributeValueDto } from '@royal-code/features/admin-products/core';
import { UpdateVariantValuePayload } from '@royal-code/features/admin-variants/core';
import { VariantListItemComponent } from '../variant-list-item/variant-list-item.component';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'admin-variant-group',
  standalone: true,
  imports: [CommonModule, VariantListItemComponent, UiTitleComponent, TranslateModule],
  template: `
    <div class="p-6 bg-card border border-border rounded-xs">
  <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="groupName()" />
  <div class="mt-4">
    <!-- Header Row -->
    <div class="grid grid-cols-12 gap-4 px-2 py-1 text-xs font-semibold text-muted uppercase">
      <div class="col-span-1">{{ 'admin.variants.table.color' | translate }}</div>
      <div class="col-span-2">{{ 'admin.variants.table.systemValue' | translate }}</div>
      <div class="col-span-3">{{ 'admin.variants.table.displayName' | translate }}</div>
      <div class="col-span-2">{{ 'admin.variants.table.hexCode' | translate }}</div>
      <div class="col-span-2">{{ 'admin.variants.table.priceModifier' | translate }}</div>
      <div class="col-span-2 text-right">{{ 'admin.variants.table.actions' | translate }}</div>
    </div>
    <!-- Data Rows -->
    @for(item of items(); track item.id) {
      <admin-variant-list-item 
        [item]="item" 
        (update)="update.emit({ id: item.id, payload: $event })"
        (delete)="delete.emit({ id: item.id, attributeType: groupName() })" 
      />
    } @empty {
      <p class="text-secondary text-sm p-4 text-center">{{ 'admin.variants.table.noValues' | translate }}</p>
    }
  </div>
</div>

  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariantGroupComponent {
  groupName = input.required<string>();
  items = input.required<readonly PredefinedAttributeValueDto[]>();

  update = output<{ id: string, payload: UpdateVariantValuePayload }>();
  delete = output<{ id: string, attributeType: string }>();
  
  protected readonly TitleTypeEnum = TitleTypeEnum;
}