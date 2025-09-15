/**
 * @file variant-management-page.component.ts
 * @Version 3.1.0 (Internationalized & Final UI)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-28
 * @Description Smart component for managing global product attributes.
 */
import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { AdminVariantsFacade, CreateVariantValuePayload, UpdateVariantValuePayload } from '@royal-code/features/admin-variants/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { UiButtonComponent } from '@royal-code/ui/button';
import { AppIcon } from '@royal-code/shared/domain';
import { VariantGroupComponent, VariantCreateFormComponent, VariantInfoPanelComponent } from '@royal-code/features/admin-variants/ui';
import { DynamicOverlayService, DynamicOverlayRef } from '@royal-code/ui/overlay';
import { UiIconComponent } from '@royal-code/ui/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'admin-variant-management-page',
  standalone: true,
  imports: [CommonModule, KeyValuePipe, UiTitleComponent, UiSpinnerComponent, VariantGroupComponent, VariantCreateFormComponent, UiButtonComponent, UiIconComponent, TranslateModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="'variants.title' | translate" />
          <royal-code-ui-button type="outline" sizeVariant="icon" (clicked)="showInfoPanel()" [title]="'variants.tooltips.pricingInfo' | translate">
             <royal-code-ui-icon [icon]="AppIcon.HelpCircle" />
          </royal-code-ui-button>
        </div>
        @if(!isCreateFormVisible()) {
          <royal-code-ui-button type="primary" (clicked)="isCreateFormVisible.set(true)">
            <royal-code-ui-icon [icon]="AppIcon.Plus" extraClass="mr-2"/>
            {{ 'variants.create.newButton' | translate }}
          </royal-code-ui-button>
        }
      </div>

      @if (isCreateFormVisible()) {
        <admin-variant-create-form 
          [attributeTypes]="attributeTypeKeys()"
          (save)="onCreateVariant($event)"
          (cancel)="isCreateFormVisible.set(false)"
        />
      }

      @if (facade.isLoading() && !hasData()) {
        <div class="flex justify-center items-center h-64"><royal-code-ui-spinner size="lg" /></div>
      } @else if (facade.error()) {
        <p class="text-destructive">{{ facade.error() }}</p>
      } @else {
        <div class="space-y-8">
          @for (group of facade.groupedAttributes() | keyvalue; track group.key) {
            <admin-variant-group 
              [groupName]="group.key" 
              [items]="group.value"
              (update)="onUpdateVariant($event)"
              (delete)="onDeleteVariant($event)"
            />
          }
        </div>
      }
    </div>
  `
,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariantManagementPageComponent implements OnInit {
  protected readonly facade = inject(AdminVariantsFacade);
  private readonly overlayService = inject(DynamicOverlayService);
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  protected isCreateFormVisible = signal(false);
  protected readonly hasData = computed(() => Object.keys(this.facade.groupedAttributes()).length > 0);
  protected readonly attributeTypeKeys = computed(() => Object.keys(this.facade.groupedAttributes()));
  private infoPanelRef?: DynamicOverlayRef;

  ngOnInit(): void {
    this.facade.loadVariants();
  }

  showInfoPanel(): void {
    this.infoPanelRef = this.overlayService.open({
        component: VariantInfoPanelComponent,
        backdropType: 'dark',
        closeOnClickOutside: true,
    });
    this.infoPanelRef.componentInstance!.close.subscribe(() => {
        this.infoPanelRef?.close();
    });
  }

  onUpdateVariant(event: { id: string, payload: UpdateVariantValuePayload }): void {
    this.facade.updateVariant(event.id, event.payload);
  }

  onDeleteVariant(event: { id: string, attributeType: string }): void {
    if (confirm('Are you sure you want to delete this value? This cannot be undone.')) { // Simple confirm for now
      this.facade.deleteVariant(event.id, event.attributeType);
    }
  }
  
  onCreateVariant(payload: CreateVariantValuePayload): void {
    this.facade.createVariant(payload);
    this.isCreateFormVisible.set(false);
  }
}