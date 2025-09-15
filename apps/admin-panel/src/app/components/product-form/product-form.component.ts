/**
 * @file product-form.component.ts
 * @Version 45.0.0 (Definitive Data Integrity & Patching Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-04
 * @Description
 *   De definitieve, Gold Standard-versie van het Product Form. Lost alle bekende bugs op
 *   door de `patchFormForEdit` methode volledig te herschrijven om dataverlies te
 *   voorkomen en introduceert robuuste logging voor volledige transparantie.
 */
import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  input,
  output,
  effect,
  DestroyRef,
  signal,
  computed
} from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormArray,
  Validators,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  take,
  finalize,
  auditTime,
  startWith,
  pairwise,
  catchError,
  concatMap,
  tap
} from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { v4 as uuidv4 } from 'uuid';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { EMPTY, forkJoin, from } from 'rxjs';
import { Store } from '@ngrx/store';

// UI & Core Dependencies
import { UiTitleComponent } from '@royal-code/ui/title';
import { SelectOption, TitleTypeEnum } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiTextareaComponent } from '@royal-code/ui/textarea';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { UiToggleButtonComponent } from '@royal-code/ui/button';
import { UiSliderComponent } from '@royal-code/ui/meters';
import { AppIcon } from '@royal-code/shared/domain';
import { NotificationService } from '@royal-code/ui/notifications';
import { Media, Image, MediaType } from '@royal-code/shared/domain';
import { MediaActions, MediaFacade } from '@royal-code/features/media/core';
import { MediaUploaderComponent, VariantImageManagerComponent } from '@royal-code/ui/media';
import {
  UiSelectComponent,
  UiTagInputComponent,
  UiCategorySelectorComponent
} from '@royal-code/ui/forms';
import { DynamicOverlayService } from '@royal-code/ui/overlay';
import { ValidationService } from '@royal-code/shared/utils';
import { ValidationSummaryDialogComponent } from '@royal-code/ui/dialogs';

// Domain, State & DTOs
import { AdminProductListViewModel, CustomAttributeDefinitionDto, PredefinedAttributeValueDto } from '@royal-code/features/admin-products/core';
import { CreateProductPayload, Product, ProductType, StockStatus, UpdateProductPayload, VariantAttributeType, VariantAttribute, VariantAttributeValue, ProductDisplaySpecification, ProductVariantCombination, ProductStatus } from '@royal-code/features/products/domain';
import { isPhysicalProduct } from '@royal-code/features/products/domain';
import { filterImageMedia } from '@royal-code/shared/utils';
import { PlushieMediaApiService } from '@royal-code/features/media/data-access-plushie';
import { CategoryTreeService } from 'libs/features/products/core/src/lib/services/category-tree.service';

// Type Definitions & Constants
const CUSTOM_ATTRIBUTE_VALUE = '__custom__';

interface AttributeFormValue {
  tempId: string;
  nameKeyOrText: string;
  type: VariantAttributeType;
  displayType?: string;
  isRequired: boolean;
  values: AttributeValueFormValue[];
}

interface AttributeValueFormValue {
  tempId: string;
  predefinedValue: PredefinedAttributeValueDto | typeof CUSTOM_ATTRIBUTE_VALUE | null;
  displayNameKeyOrText: string;
  colorHex?: string;
  priceModifier?: number;
  isAvailable: boolean;
}

@Component({
  selector: 'admin-product-form',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, TitleCasePipe, TranslateModule,
    UiTitleComponent, UiButtonComponent, UiIconComponent, UiInputComponent,
    UiTextareaComponent, UiSpinnerComponent, UiToggleButtonComponent,
    UiSliderComponent, MediaUploaderComponent, UiSelectComponent,
    UiTagInputComponent, UiCategorySelectorComponent
  ],
  template: `
<form [formGroup]="productForm" (ngSubmit)="onSave()">
@if (viewModel(); as vm) {
  <!-- === HEADER SECTION === -->
  <div class="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-4 border-b border-border px-4">
    <div class="flex justify-between items-center">
      <royal-code-ui-title 
        [level]="TitleTypeEnum.H1" 
        [text]="(isEditMode() ? 'admin.products.editTitle' : 'admin.products.createTitle') | translate" />
      
      <div class="flex items-center gap-3">
        <!-- Debug Toggle Button (alleen voor development) -->
        <royal-code-ui-button 
          type="transparent" 
          sizeVariant="sm" 
          (clicked)="toggleDebugOverlay()" 
          extraClasses="text-destructive border-destructive"
          title="Open Debug Panel">
          <royal-code-ui-icon [icon]="AppIcon.Bug" extraClass="mr-2" />
          Debug
        </royal-code-ui-button>
        
        <royal-code-ui-button type="outline" routerLink="/products">
          {{ 'admin.products.form.cancel' | translate }}
        </royal-code-ui-button>
        
        <royal-code-ui-button 
          type="primary" 
          htmlType="submit" 
          [disabled]="vm.isSubmitting || isAnyUploadPending()">
          @if (vm.isSubmitting || isMediaUploading()) {
            <royal-code-ui-spinner size="sm" extraClass="mr-2" />
            <span>{{ isMediaUploading() ? 'Uploading media...' : ('admin.products.form.saving' | translate) }}</span>
          } @else {
            <span>{{ 'admin.products.form.save' | translate }}</span>
          }
        </royal-code-ui-button>
      </div>
    </div>
  </div>

  <!-- === DEBUG OVERLAY === -->
  @if (showDebugOverlay()) {
    <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" (click)="closeDebugOverlay()">
      <div class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-lg shadow-xl w-[600px] max-h-[80vh] overflow-y-auto" (click)="$event.stopPropagation()">
        
        <!-- Debug Panel Header -->
        <div class="flex justify-between items-center p-4 border-b border-border">
          <h3 class="text-lg font-semibold flex items-center">
            <royal-code-ui-icon [icon]="AppIcon.Bug" extraClass="mr-2 text-destructive" />
            Debug Panel
          </h3>
          <royal-code-ui-button 
            type="transparent" 
            sizeVariant="icon" 
            (clicked)="closeDebugOverlay()">
            <royal-code-ui-icon [icon]="AppIcon.X" />
          </royal-code-ui-button>
        </div>

        <!-- Debug Panel Content -->
        <div class="p-4 space-y-4">
          
          <!-- Form State Section -->
          <div class="space-y-2">
            <h4 class="font-medium text-sm text-secondary border-b border-border pb-1">Form State</h4>
            <div class="grid grid-cols-1 gap-2">
              <royal-code-ui-button 
                type="outline" 
                sizeVariant="sm" 
                (clicked)="debugVariantState(); closeDebugOverlay()"
                extraClasses="justify-start">
                <royal-code-ui-icon [icon]="AppIcon.Settings" extraClass="mr-2" />
                Debug Variant State
              </royal-code-ui-button>
              
              <royal-code-ui-button 
                type="outline" 
                sizeVariant="sm" 
                (clicked)="debugAttributeState(); closeDebugOverlay()"
                extraClasses="justify-start">
                <royal-code-ui-icon [icon]="AppIcon.Tag" extraClass="mr-2" />
                Debug Attribute State
              </royal-code-ui-button>
            </div>
          </div>

          <!-- Media Section -->
          <div class="space-y-2">
            <h4 class="font-medium text-sm text-secondary border-b border-border pb-1">Media</h4>
            <div class="grid grid-cols-1 gap-2">
              <royal-code-ui-button 
                type="outline" 
                sizeVariant="sm" 
                (clicked)="debugMediaState(); closeDebugOverlay()"
                extraClasses="justify-start">
                <royal-code-ui-icon [icon]="AppIcon.Image" extraClass="mr-2" />
                Debug Media State
              </royal-code-ui-button>
              
              <royal-code-ui-button 
                type="outline" 
                sizeVariant="sm" 
                (clicked)="reloadProductMedia(); closeDebugOverlay()"
                extraClasses="justify-start">
                <royal-code-ui-icon [icon]="AppIcon.RefreshCw" extraClass="mr-2" />
                Reload Product Media
              </royal-code-ui-button>
            </div>
          </div>

          <!-- Categories Section -->
          <div class="space-y-2">
            <h4 class="font-medium text-sm text-secondary border-b border-border pb-1">Categories</h4>
            <div class="grid grid-cols-1 gap-2">
              <royal-code-ui-button 
                type="outline" 
                sizeVariant="sm" 
                (clicked)="debugCategoryState(); closeDebugOverlay()"
                extraClasses="justify-start">
                <royal-code-ui-icon [icon]="AppIcon.Folder" extraClass="mr-2" />
                Debug Category State
              </royal-code-ui-button>
              
              <royal-code-ui-button 
                type="outline" 
                sizeVariant="sm" 
                (clicked)="debugCategoryTree(); closeDebugOverlay()"
                extraClasses="justify-start">
                <royal-code-ui-icon [icon]="AppIcon.Tree" extraClass="mr-2" />
                Debug Category Tree
              </royal-code-ui-button>
              
              <royal-code-ui-button 
                type="outline" 
                sizeVariant="sm" 
                (clicked)="testCategoryParents(); closeDebugOverlay()"
                extraClasses="justify-start">
                <royal-code-ui-icon [icon]="AppIcon.ArrowUp" extraClass="mr-2" />
                Test Category Parents
              </royal-code-ui-button>
            </div>
          </div>

          <!-- Form Actions Section -->
          <div class="space-y-2">
            <h4 class="font-medium text-sm text-secondary border-b border-border pb-1">Form Actions</h4>
            <div class="grid grid-cols-1 gap-2">
              <royal-code-ui-button 
                type="outline" 
                sizeVariant="sm" 
                (clicked)="regenerateSkus(); closeDebugOverlay()"
                extraClasses="justify-start text-warning">
                <royal-code-ui-icon [icon]="AppIcon.RefreshCw" extraClass="mr-2" />
                Regenerate All SKUs
              </royal-code-ui-button>
            </div>
          </div>

          <!-- Current Form Status -->
          <div class="space-y-2 pt-4 border-t border-border">
            <h4 class="font-medium text-sm text-secondary">Current Status</h4>
            <div class="text-xs space-y-1 text-muted-foreground">
              <div>Form Valid: {{ productForm.valid ? 'Yes' : 'No' }}</div>
              <div>Variant Attributes: {{ variantAttributes.length }}</div>
              <div>Combinations: {{ variantCombinations.length }}</div>
              <div>Media Items: {{ uploadedMedia().length }}</div>
              <div>Is Patching: {{ isPatching ? 'Yes' : 'No' }}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  }

  <!-- === FORM CONTENT GRID === -->
  <div class="p-2 md:p-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
    
    <!-- === MAIN CONTENT COLUMN === -->
    <div class="lg:col-span-2 space-y-6">
      
      <!-- Basic Information -->
      <div class="p-6 bg-card border border-border rounded-xs">
        <h3 class="text-lg font-medium mb-4">{{ 'admin.products.form.basicInfo' | translate }}</h3>
        <div class="space-y-4">
          <royal-code-ui-input 
            [label]="'admin.products.form.productName' | translate" 
            formControlName="name" 
            [required]="true" 
            [error]="getFieldError('name')" />
          <royal-code-ui-textarea 
            [label]="'admin.products.form.shortSummary' | translate" 
            formControlName="shortDescription" 
            [rows]="3" />
          <royal-code-ui-textarea 
            [label]="'admin.products.form.fullDescription' | translate" 
            formControlName="description" 
            [rows]="6" />
        </div>
      </div>

      <!-- Media Section -->
      <div class="p-6 bg-card border border-border rounded-xs">
        <h3 class="text-lg font-medium mb-4">{{ 'admin.products.form.media' | translate }}</h3>
        
        <p class="text-sm text-secondary mb-4">Upload all product images here. These images will be available for assignment to the fallback product and specific combinations.</p>
        <media-uploader (filesSelected)="handleFileUploads($event)" />
        
        @if(isUploading()) {
          <div class="mt-2 text-sm text-info flex items-center justify-center">
            <royal-code-ui-icon [icon]="AppIcon.Loader" sizeVariant="sm" extraClass="animate-spin mr-2" />
            <span>Processing images...</span>
          </div>
        }
        
        <h4 class="text-base font-medium mt-6 mb-2 flex justify-between items-center">
          <span>All Uploaded Media</span>
          <royal-code-ui-icon [icon]="AppIcon.Info" class="text-secondary" title="Alle geüploade afbeeldingen voor dit product. Deze kunnen worden toegewezen aan specifieke varianten of combinaties."></royal-code-ui-icon>
        </h4>
        @if(uploadedMedia().length > 0) {
          <div class="mt-4 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
            @for(media of uploadedMedia(); track media.id) {
              <div 
                class="aspect-square bg-muted rounded-md overflow-hidden relative group"
                [class.border-2]="media.id === featuredImageIdC()"
                [class.border-primary]="media.id === featuredImageIdC()"
                [title]="media.id === featuredImageIdC() ? ('admin.products.form.featuredImage' | translate) : ''">
                <img [src]="getMediaUrl(media)" [alt]="getMediaAltText(media)" class="w-full h-full object-cover">
                <button 
                  type="button" 
                  (click)="removeMedia(media.id); $event.stopPropagation()" 
                  class="absolute top-1 right-1 bg-destructive/80 text-destructive-on rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <royal-code-ui-icon [icon]="AppIcon.X" sizeVariant="xs" />
                </button>
                @if (media.id === featuredImageIdC()) {
                  <div class="absolute bottom-0 left-0 right-0 bg-primary/70 text-primary-on text-center text-xs p-0.5">
                    {{ 'admin.products.form.featured' | translate }}
                  </div>
                }
              </div>
            }
          </div>
        } @else {
          <div class="mt-4">
            <p class="text-sm text-secondary">No media in MediaFacade state.</p>
            @if(productForm.get('mediaIds')?.value?.length > 0) {
              <p class="text-sm text-info">Product has {{ productForm.get('mediaIds')?.value?.length }} media items, but they're not loaded in state.</p>
              <royal-code-ui-button type="outline" sizeVariant="sm" (clicked)="reloadProductMedia()">
                Reload Media
              </royal-code-ui-button>
            }
          </div>
        }

        <h4 class="text-base font-medium mt-6 mb-2 flex justify-between items-center">
          <span>Fallback Product Images</span>
          <royal-code-ui-button type="outline" sizeVariant="sm" (clicked)="manageRootMedia()">
            <royal-code-ui-icon [icon]="AppIcon.Image" extraClass="mr-2" />
            Manage Assignment
          </royal-code-ui-button>
          <royal-code-ui-icon [icon]="AppIcon.Info" class="text-secondary" title="Deze afbeeldingen worden getoond als er geen specifieke variant of combinatie is geselecteerd, of als deze geen eigen afbeeldingen heeft."></royal-code-ui-icon>
        </h4>
        <p class="text-sm text-secondary mb-4">These images are shown for the product when no specific variant or combination is selected. One of them can be set as the featured image.</p>
        @if(rootMedia().length > 0) {
          <div class="mt-4 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
            @for(media of rootMedia(); track media.id) {
              <div 
                class="aspect-square bg-muted rounded-md overflow-hidden relative group cursor-pointer"
                [class.border-2]="media.id === featuredImageIdC()"
                [class.border-primary]="media.id === featuredImageIdC()"
                (click)="setFeaturedImage(media.id)"
                [title]="media.id === featuredImageIdC() ? ('admin.products.form.featuredImage' | translate) : ('admin.products.form.setAsFeatured' | translate)">
                <img [src]="getMediaUrl(media)" [alt]="getMediaAltText(media)" class="w-full h-full object-cover">
                @if (media.id === featuredImageIdC()) {
                  <div class="absolute bottom-0 left-0 right-0 bg-primary/70 text-primary-on text-center text-xs p-0.5">
                    {{ 'admin.products.form.featured' | translate }}
                  </div>
                }
              </div>
            }
          </div>
        } @else {
          <p class="text-sm text-secondary mt-2">No fallback images assigned. Click "Manage Assignment" to select them from your uploaded media.</p>
        }
      </div>

      <!-- Variants Section -->
      <div class="p-6 bg-card border border-border rounded-xs">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">{{ 'admin.products.form.variants' | translate }}</h3>
          <royal-code-ui-button type="outline" sizeVariant="sm" (clicked)="addVariantAttribute()">
            <royal-code-ui-icon [icon]="AppIcon.Plus" extraClass="mr-2" />
            {{ 'admin.products.form.addAttribute' | translate }}
          </royal-code-ui-button>
        </div>
        
        <div formArrayName="variantAttributes" class="space-y-4">
          @if(vm.isLoadingAttributes) {
            <div class="text-center p-4 text-secondary">{{ 'admin.products.form.loadingAttributes' | translate }}</div>
          } @else if (!vm.attributeNames.length && vm.error) {
            <div class="text-center p-4 text-destructive bg-destructive/10 border border-destructive rounded-md">
              <p class="font-semibold">{{ 'admin.products.form.errorLoadingAttributes' | translate }}</p>
              <p class="text-sm">{{ vm.error }}</p>
            </div>
          } @else {
            @for (attr of variantAttributes.controls; track trackByTempId($index, attr); let i = $index) {
              <div [formGroupName]="i" class="p-4 border border-border rounded-md bg-surface-alt">
                <div class="grid grid-cols-1 gap-4 mb-3">
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-1">{{ 'admin.products.form.attribute' | translate }}</label>
                    <select formControlName="nameKeyOrText" (change)="onAttributeNameChange(attr)" class="w-full p-2 border border-input rounded-md bg-background text-sm">
                      <option value="" disabled>{{ 'admin.products.form.chooseExistingAttribute' | translate }}</option>
                      @for(name of vm.attributeNames; track name) { 
                        <option [value]="name">{{ name | titlecase }}</option> 
                      }
                    </select>
                  </div>
                  <div class="col-span-2 flex justify-between items-center">
                    <label class="flex items-center text-sm font-medium text-foreground">
                      <input type="checkbox" formControlName="isRequired" class="mr-2 h-4 w-4 rounded text-primary focus:ring-primary border-border">
                      {{ 'admin.products.form.isRequired' | translate }}
                    </label>
                    <royal-code-ui-button type="fire" sizeVariant="sm" (clicked)="removeVariantAttribute(i)">
                      <royal-code-ui-icon [icon]="AppIcon.Trash2" sizeVariant="sm" extraClass="mr-2"/>
                      {{ 'admin.products.form.removeAttribute' | translate }}
                    </royal-code-ui-button>
                  </div>
                </div>
                <div formArrayName="values" class="space-y-2">
                  @for (val of getAttributeValues(attr).controls; track trackByTempId($index, val); let j = $index) {
                    <div [formGroupName]="j" class="p-3 border border-dashed border-border rounded-md">
                      <div class="grid grid-cols-[1fr_auto] gap-2 items-end">
                        <div>
                          <label class="block text-xs font-medium text-foreground mb-1">{{ 'admin.products.form.chooseValue' | translate }}</label>
                          <select formControlName="predefinedValue" class="w-full p-2 border border-input rounded-md bg-background text-sm" [compareWith]="comparePredefinedValues">
                            <option [ngValue]="null" disabled>{{ 'admin.products.form.selectExisting' | translate }}</option>
                            @if(getPredefinedValues(attr.get('nameKeyOrText')?.value); as options) {
                              @for(option of options; track option.id) { 
                                <option [ngValue]="option">{{ option.displayName }}</option> 
                              }
                            }
                            <option [value]="CUSTOM_ATTRIBUTE_VALUE">{{ 'admin.products.form.createNewValue' | translate }}</option>
                          </select>
                        </div>
                        <royal-code-ui-button type="transparent" sizeVariant="icon" (clicked)="removeAttributeValue(attr, j)">
                          <royal-code-ui-icon [icon]="AppIcon.X" sizeVariant="sm"/>
                        </royal-code-ui-button>
                      </div>
                      @if (val.get('predefinedValue')?.value === CUSTOM_ATTRIBUTE_VALUE) {
                        <div class="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border">
                          <royal-code-ui-input 
                            [label]="'admin.products.form.displayNameNew' | translate" 
                            formControlName="displayNameKeyOrText" 
                            [required]="true" 
                            [error]="getArrayError(attr, j, 'displayNameKeyOrText')" />
                          @if(attr.get('type')?.value === 'color') { 
                            <royal-code-ui-input 
                              [label]="'admin.products.form.colorHexOptional' | translate" 
                              formControlName="colorHex" /> 
                          }
                          <royal-code-ui-input 
                            [label]="'admin.products.form.priceModifierOptional' | translate" 
                            formControlName="priceModifier" 
                            type="number" />
                        </div>
                      } @else {
                        <div [class.hidden]="!val.get('predefinedValue')?.value">
                          <royal-code-ui-input 
                            [label]="'admin.products.form.displayName' | translate" 
                            formControlName="displayNameKeyOrText" 
                            [readonly]="true" 
                            extraClasses="mt-2" />
                        </div>
                      }
                    </div>
                  }
                </div>
                <royal-code-ui-button type="outline" sizeVariant="xs" (clicked)="addAttributeValue(attr)" extraClasses="mt-3">
                  {{ 'admin.products.form.addValue' | translate }}
                </royal-code-ui-button>
              </div>
            }
          }
        </div>
        @if (variantAttributes.controls.length > 0) {
          <div class="pt-4 border-t border-border flex justify-end">
            <royal-code-ui-button type="outline" sizeVariant="sm" (clicked)="addVariantAttribute()">
              <royal-code-ui-icon [icon]="AppIcon.Plus" extraClass="mr-2" />
              {{ 'admin.products.form.addAttribute' | translate }}
            </royal-code-ui-button>
          </div>
        }
      </div>

      <!-- Combinations Matrix -->
      <div class="p-6 bg-card border border-border rounded-xs">
        <h3 class="text-lg font-medium mb-4">{{ 'admin.products.form.combinations' | translate }}</h3>
        @if(variantCombinations.controls.length > 0) {
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="text-left text-secondary border-b border-border">
                <tr>
                  @for (attr of variantAttributes.controls; track trackByTempId($index, attr)) {
                    @if (getAttributeValues(attr).controls.length > 0 && attr.value.nameKeyOrText) { 
                      <th class="p-2 font-medium">{{ attr.value.nameKeyOrText | titlecase }}</th> 
                    }
                  }
                  <th class="p-2 font-medium">SKU</th>
                  <th class="p-2 font-medium">Price</th>
                  <th class="p-2 font-medium">Original Price</th>
                  <th class="p-2 font-medium">Stock</th>
                  <th class="p-2 font-medium">Status</th>
                  <th class="p-2 font-medium">Media</th>
                  <th class="p-2 font-medium">Default</th>
                  <th class="p-2 font-medium">Active</th>
                </tr>
              </thead>
              <tbody formArrayName="variantCombinations">
                @for (combo of variantCombinations.controls; track trackByCombination($index, combo); let i = $index) {
                  <tr [formGroupName]="i" class="border-b border-border last:border-b-0" [ngClass]="{ 'opacity-50 bg-surface-alt': !combo.get('isActive')?.value }">
                    @for (mainAttr of variantAttributes.controls; track trackByTempId($index, mainAttr)) {
                      @if (getAttributeValues(mainAttr).controls.length > 0 && mainAttr.value.nameKeyOrText) {
                         <td class="p-2 font-semibold">{{ getAttributeDisplayValueForCombination(combo, mainAttr.value.tempId) }}</td>
                      }
                    }
                    <td class="p-2">
                      <royal-code-ui-input 
                        formControlName="sku" 
                        [required]="true" 
                        extraClasses="!py-1" 
                        [error]="getCombinationError(i, 'sku')" />
                    </td>
                    <td class="p-2">
                      <royal-code-ui-input 
                        formControlName="price" 
                        type="number" 
                        [required]="true" 
                        extraClasses="!py-1" 
                        [error]="getCombinationError(i, 'price')" />
                    </td>
                    <td class="p-2">
                      <royal-code-ui-input 
                        formControlName="originalPrice" 
                        type="number" 
                        extraClasses="!py-1" />
                    </td>
                    <td class="p-2">
                      <royal-code-ui-input 
                        formControlName="stockQuantity" 
                        type="number" 
                        [required]="true" 
                        extraClasses="!py-1" 
                        [error]="getCombinationError(i, 'stockQuantity')" />
                    </td>
                    <td class="p-2">
                      <select formControlName="stockStatus" class="w-full p-1 border border-input rounded-md bg-background text-xs"> 
                        @for(status of stockStatuses; track status) { 
                          <option [value]="status">{{ status | titlecase }}</option> 
                        } 
                      </select>
                    </td>
                    <td class="p-2">
                      <div class="flex items-center gap-2">
                        @if((combo.get('mediaIds')?.value ?? []).length > 0) {
                          <div class="w-8 h-8 rounded-md border border-border bg-muted overflow-hidden">
                            <img [src]="getMediaDisplayUrl(getCombinationPrimaryImage(combo))" [alt]="'Combination image'" class="w-full h-full object-cover">
                          </div>
                        }
                        <royal-code-ui-button type="outline" sizeVariant="icon" (clicked)="manageCombinationMedia(combo)" [title]="'Manage media for this combination'">
                          <royal-code-ui-icon [icon]="AppIcon.Camera" />
                        </royal-code-ui-button>
                      </div>
                    </td>
                    <td class="p-2 text-center">
                      <input type="radio" name="defaultVariant" [value]="i" (change)="setDefaultVariant(i)" [checked]="combo.get('isDefault')?.value" class="h-4 w-4 text-primary focus:ring-primary border-border">
                    </td>
                    <td class="p-2">
                      <royal-code-ui-toggle-button formControlName="isActive" label="" />
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (variantCombinations.errors) {
            <div class="mt-2 text-sm text-destructive space-y-1">
              @if (variantCombinations.errors['duplicateSku']) { 
                <p>{{ 'admin.products.form.duplicateSku' | translate }}</p> 
              }
              @if (variantCombinations.errors['noDefaultVariant']) { 
                <p>{{ 'admin.products.form.noDefaultVariant' | translate }}</p> 
              }
              @if (variantCombinations.errors['noCombinationsGenerated']) { 
                <p>{{ 'admin.products.form.noCombinationsGenerated' | translate }}</p> 
              }
            </div>
          }
        } @else {
          <p class="text-sm text-secondary">{{ 'admin.products.form.addAttributesToGenerate' | translate }}</p>
        }
      </div>

      <!-- Custom Attributes -->
      @if (hasCustomAttributes()) {
        <div class="p-6 bg-card border border-border rounded-xs">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-medium">{{ 'admin.products.form.propertiesAndQualities' | translate }}</h3>
          </div>
          
          <div [formGroupName]="'customAttributes'" class="space-y-6">
            <div class="space-y-4">
              <h4 class="text-base font-medium mb-3 border-b border-border pb-2">Product Qualities</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @for (key of getCustomAttributeKeys(); track key) {
                  @if(productForm.get('customAttributes.' + key)) {
                    <div>
                      <royal-code-ui-slider 
                        [label]="formatCustomAttributeLabel(key)" 
                        [formControlName]="key" 
                        [min]="1" 
                        [max]="10" 
                        [step]="1" 
                        [valueLabel]="productForm.get('customAttributes')?.get(key)?.value?.toString()" />
                    </div>
                  }
                }
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Display Specifications -->
      <div class="p-6 bg-card border border-border rounded-xs">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">{{ 'admin.products.form.displaySpecifications' | translate }}</h3>
          <royal-code-ui-button type="outline" sizeVariant="sm" (clicked)="addDisplaySpecification()">
            <royal-code-ui-icon [icon]="AppIcon.Plus" extraClass="mr-2" />
            {{ 'admin.products.form.addSpec' | translate }}
          </royal-code-ui-button>
        </div>
        <div formArrayName="displaySpecifications" class="space-y-4">
          @for (spec of displaySpecifications.controls; track trackByTempId($index, spec); let i = $index) {
            <div [formGroupName]="i" class="p-4 border border-dashed border-border rounded-md">
              <div class="grid grid-cols-[1fr_auto] gap-2 items-end">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <royal-code-ui-select 
                    [label]="'admin.products.form.specKeyInternal' | translate" 
                    formControlName="specKey" 
                    [options]="specificationOptions()" 
                    [required]="true" 
                    [error]="getSpecError(i, 'specKey')" />
                  <royal-code-ui-input 
                    [label]="'admin.products.form.displayName' | translate" 
                    formControlName="labelKeyOrText" 
                    [readonly]="true" />
                  <royal-code-ui-input 
                    [label]="'admin.products.form.displayValue' | translate" 
                    formControlName="valueKeyOrText" 
                    [required]="true" 
                    [error]="getSpecError(i, 'valueKeyOrText')" />
                  <royal-code-ui-input 
                    [label]="'admin.products.form.groupOptional' | translate" 
                    formControlName="groupKeyOrText" 
                    [readonly]="true" />
                </div>
                <royal-code-ui-button type="transparent" sizeVariant="icon" (clicked)="removeDisplaySpecification(i)">
                  <royal-code-ui-icon [icon]="AppIcon.X" sizeVariant="sm"/>
                </royal-code-ui-button>
              </div>
            </div>
          }
        </div>
        @if (displaySpecifications.controls.length === 0) { 
          <p class="text-sm text-secondary">{{ 'admin.products.form.addSpecsHelp' | translate }}</p> 
        }
      </div>
    </div>

    <!-- === SIDEBAR COLUMN === -->
    <aside class="lg:col-span-1 space-y-6 sticky top-24">
      
      <!-- Organization & Status -->
      <div class="p-6 bg-card border border-border rounded-xs">
        <h3 class="text-lg font-medium mb-4">{{ 'admin.products.form.organizationAndStatus' | translate }}</h3>
        <div class="space-y-4">
          <label class="block text-sm font-medium text-foreground mb-1">{{ 'admin.products.form.status' | translate }}</label>
          <select formControlName="status" class="w-full p-2 border border-input rounded-md bg-background text-sm"> 
            @for(status of productStatuses; track status) { 
              <option [value]="status">{{ status | titlecase }}</option> 
            } 
          </select>
          <royal-code-ui-toggle-button formControlName="isActive" [label]="'admin.products.form.isActive' | translate" />
          <royal-code-ui-toggle-button formControlName="isFeatured" [label]="'admin.products.form.isFeatured' | translate" />
          <royal-code-ui-input 
            [label]="'admin.products.form.currency' | translate" 
            formControlName="currency" 
            [required]="true" 
            [error]="getFieldError('currency')" />
          <royal-code-ui-tag-input 
            [label]="'admin.products.form.tags' | translate" 
            formControlName="tags" />
          <royal-code-ui-category-selector 
            formControlName="categoryIds" 
            [categories]="vm.allCategories" 
            [isLoading]="vm.isLoadingCategories" 
            [label]="'admin.products.form.categories' | translate" />
        </div>
      </div>

      <!-- Physical Product Config -->
      @if (productForm.get('type')?.value === ProductType.PHYSICAL) {
        <div class="p-6 bg-card border border-border rounded-xs" formGroupName="physicalProductConfig">
          <h3 class="text-lg font-medium mb-4">{{ 'admin.products.form.physicalConfig' | translate }}</h3>
          <div formGroupName="pricing" class="space-y-4">
            <royal-code-ui-input 
              [label]="'admin.products.form.price' | translate" 
              formControlName="price" 
              type="number" 
              [required]="variantCombinations.length === 0" 
              [error]="getFieldError('physicalProductConfig.pricing.price')" />
            <royal-code-ui-input 
              [label]="'admin.products.form.originalPriceOptional' | translate" 
              formControlName="originalPrice" 
              type="number" />
            @if (productForm.get('physicalProductConfig.pricing')?.errors?.['priceInvalid'] && productForm.get('physicalProductConfig.pricing')?.touched) { 
              <p class="text-destructive text-sm mt-2">{{ 'admin.products.form.priceCannotBeHigherThanOriginal' | translate }}</p> 
            }
          </div>
          <div class="space-y-4 mt-4 pt-4 border-t border-border">
            <royal-code-ui-input 
              [label]="'admin.products.form.skuOptional' | translate" 
              formControlName="sku" />
            <royal-code-ui-input 
              [label]="'admin.products.form.brandOptional' | translate" 
              formControlName="brand" />
            <royal-code-ui-toggle-button 
              formControlName="manageStock" 
              [label]="'admin.products.form.manageStock' | translate" />
            @if (productForm.get('physicalProductConfig.manageStock')?.value) { 
              <royal-code-ui-input 
                [label]="'admin.products.form.stockQuantity' | translate" 
                formControlName="stockQuantity" 
                type="number" 
                [required]="variantCombinations.length === 0" 
                [error]="getFieldError('physicalProductConfig.stockQuantity')" /> 
            }
            <royal-code-ui-toggle-button 
              formControlName="allowBackorders" 
              [label]="'admin.products.form.allowBackorders' | translate" />
            <royal-code-ui-input 
              [label]="'admin.products.form.lowStockThreshold' | translate" 
              formControlName="lowStockThreshold" 
              type="number" />
          </div>
          <div formGroupName="availabilityRules" class="mt-4 pt-4 border-t border-border">
            <h4 class="text-base font-medium mb-2">Order Rules</h4>
            <div class="space-y-3">
              <royal-code-ui-input label="Min. order quantity" formControlName="minOrderQuantity" type="number" />
              <royal-code-ui-input label="Max. order quantity" formControlName="maxOrderQuantity" type="number" />
              <royal-code-ui-input label="Order in multiples of" formControlName="quantityIncrements" type="number" />
              <royal-code-ui-toggle-button label="Rules Active" formControlName="isActive" />
            </div>
            @if (productForm.get('physicalProductConfig.availabilityRules')?.errors?.['minMaxInvalid']) { 
              <p class="text-destructive text-sm mt-2">Max. quantity must be greater than min. quantity.</p> 
            }
          </div>
          <div formGroupName="ageRestrictions" class="mt-4 pt-4 border-t border-border">
            <h4 class="text-base font-medium mb-2">Age Restrictions</h4>
            <div class="grid grid-cols-2 gap-3">
              <royal-code-ui-input label="Min. age" formControlName="minAge" type="number" />
              <royal-code-ui-input label="Max. age" formControlName="maxAge" type="number" />
            </div>
            @if (productForm.get('physicalProductConfig.ageRestrictions')?.errors?.['minMaxInvalid']) { 
              <p class="text-destructive text-sm mt-2">Max. age must be greater than min. age.</p> 
            }
          </div>
        </div>
      }

      <!-- SEO Section -->
      <div class="p-6 bg-card border border-border rounded-xs" formGroupName="seo">
        <h3 class="text-lg font-medium mb-4">{{ 'admin.products.form.seo' | translate }}</h3>
        <div class="space-y-4">
          <royal-code-ui-input 
            [label]="'admin.products.form.seoTitle' | translate" 
            formControlName="title" />
          <royal-code-ui-textarea 
            [label]="'admin.products.form.seoDescription' | translate" 
            formControlName="description" 
            [rows]="3" />
          <royal-code-ui-input 
            [label]="'admin.products.form.seoKeywordsCommaSeparated' | translate" 
            formControlName="keywords" />
        </div>
      </div>
    </aside>
  </div>
} @else {
  <div class="flex justify-center items-center h-64">
    <royal-code-ui-spinner size="lg" />
  </div>
}
</form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent implements OnInit {
  // === Inputs & Outputs ===
  readonly product = input<Product | undefined>();
  readonly viewModel = input<AdminProductListViewModel>(); // Input is optional, template handles undefined
  readonly saveProduct = output<CreateProductPayload | UpdateProductPayload>();

  // === Dependencies ===
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  protected readonly mediaFacade = inject(MediaFacade);
  private readonly notificationService = inject(NotificationService);
  private readonly translateService = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly validationService = inject(ValidationService);
  private readonly overlayService = inject(DynamicOverlayService);
  private readonly mediaApiService = inject(PlushieMediaApiService);
  private readonly categoryTreeService = inject(CategoryTreeService);
  private categoryKeyMap = new Map<string, string>();
  private readonly categoryParentCache = new Map<string, string[]>();

  // === Form & State ===
  productForm!: FormGroup;
  readonly isEditMode = computed(() => !!this.product());
  readonly isUploading = signal(false);
  readonly isMediaUploading = this.mediaFacade.isSubmitting;
  private hasBeenPatched = false;
  private lastPatchedProductId?: string;
  private customAttributesInitialized = false;
  protected isPatching = false;

  // === Debug Overlay ===
  protected showDebugOverlay = signal(false);

  // === Template Helpers ===
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;
  protected readonly ProductType = ProductType;
  protected readonly productStatuses = Object.values(ProductStatus);
  protected readonly stockStatuses = Object.values(StockStatus);
  protected readonly uploadedMedia = this.mediaFacade.allMedia;
  protected featuredImageIdC = computed(() => this.productForm.get('featuredImageId')?.value);
  protected readonly CUSTOM_ATTRIBUTE_VALUE = CUSTOM_ATTRIBUTE_VALUE;
  protected readonly isAnyUploadPending = computed(() =>
    this.isUploading() || this.mediaFacade.isSubmitting()
  );

  // === Computed Properties ===
  protected readonly rootMedia = computed(() => {
    const allImages = filterImageMedia(this.uploadedMedia());
    const rootMediaIds = this.productForm.get('mediaIds')?.value as string[] || [];
    return rootMediaIds.map(id => allImages.find(img => img.id === id)).filter((img): img is Image => !!img);
  });

  protected readonly customAttributeGroups = computed(() => {
    const vm = this.viewModel();
    if (!vm) return null;
    const definitions = vm.customAttributeDefinitions ?? [];
    if (definitions.length === 0) return null;
    const groupsMap = definitions.reduce((acc, def) => {
      const groupName = this.translateService.instant(def.group || 'admin.products.form.otherGroup');
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(def);
      return acc;
    }, {} as Record<string, CustomAttributeDefinitionDto[]>);
    return Object.entries(groupsMap).map(([name, definitions]) => ({ name, definitions }));
  });

  protected readonly specificationOptions = computed<SelectOption[]>(() => {
    const vm = this.viewModel();
    if (!vm) return [];
    return vm.displaySpecificationDefinitions.map(def => ({ value: def.specKey, label: this.translateService.instant(def.labelKeyOrText) }));
  });

  protected readonly memoizedSpecOptions = computed(() => this.specificationOptions());

  // === Lifecycle ===
  constructor() {
    this.initializeForm();
    this.setupEffects();
    this.setupMediaSync();
  }

  ngOnInit(): void {
    this.setupFormMonitoring();
    this.loadCategoryMapping();
    this.productForm.updateValueAndValidity();
  }

  // === Form Accessors ===
  get variantAttributes(): FormArray { return this.productForm.get('variantAttributes') as FormArray; }
  get variantCombinations(): FormArray { return this.productForm.get('variantCombinations') as FormArray; }
  get displaySpecifications(): FormArray { return this.productForm.get('displaySpecifications') as FormArray; }
  getAttributeValues(attr: AbstractControl): FormArray { return (attr as FormGroup).get('values') as FormArray; }

  getAttributeDisplayValueForCombination(combo: AbstractControl, formAttributeTempId: string): string {
    const attrsInCombo = combo.get('attributes')?.value as { attributeId: string, attributeNameKeyOrText: string, attributeValueId: string, attributeValueNameKeyOrText: string, colorHex: string | null }[];
    if (!attrsInCombo || attrsInCombo.length === 0) return 'N/A';

    const formAttrControl = this.variantAttributes.controls.find(c => c.get('tempId')?.value === formAttributeTempId);
    if (!formAttrControl) {
      return 'Fout';
    }
    const formAttributeName = formAttrControl.get('nameKeyOrText')?.value;

    const relevantComboAttribute = attrsInCombo.find(a => a.attributeNameKeyOrText === formAttributeName);

    return relevantComboAttribute?.attributeValueNameKeyOrText ?? 'N/A';
  }

  // === Debug Overlay Methods ===
  protected toggleDebugOverlay(): void {
    this.showDebugOverlay.set(!this.showDebugOverlay());
  }

  protected closeDebugOverlay(): void {
    this.showDebugOverlay.set(false);
  }

  // === Public Methods ===
  onSave(): void {
    if (this.isAnyUploadPending()) {
      this.notificationService.showWarning('Please wait for media uploads to complete');
      return;
    }

    this.productForm.markAllAsTouched();
    if (this.productForm.invalid) { this.showValidationErrors(); return; }
    const payload = this.mapFormToPayload();

    console.log('%c[ProductFormComponent] FINAL PAYLOAD TO BE SENT:', 'color: #4CAF50; font-weight: bold; font-size: 14px;', structuredClone(payload));

    this.saveProduct.emit(payload);
  }

  handleFileUploads(files: File[]): void {
    this.isUploading.set(true);
    this.processFilesSequentially(files);
  }

  private processFilesSequentially(files: File[]): void {
    from(files).pipe(
      concatMap(file =>
        this.mediaApiService.createMedia({
          altText: file.name.split('.').slice(0, -1).join('.'),
          type: 'image'
        }, file).pipe(
          tap(media => {
            this.store.dispatch(MediaActions.mediaLoadedFromSource({ media: [media] }));
          }),
          catchError(error => {
            console.error('Upload failed for', file.name, error);
            return EMPTY;
          })
        )
      ),
      finalize(() => {
        this.isUploading.set(false);
        this.notificationService.showSuccess('All uploads completed');
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  // === Variant Management ===
  addVariantAttribute(): void {
    this.variantAttributes.push(this.createVariantAttribute({}));
  }
  removeVariantAttribute(index: number): void {
    this.variantAttributes.removeAt(index);
    this.generateCombinations();
  }
  addAttributeValue(attrCtrl: AbstractControl): void {
    this.getAttributeValues(attrCtrl).push(this.createAttributeValue({}));
    setTimeout(() => this.generateCombinations(), 0);
  }
  removeAttributeValue(attrCtrl: AbstractControl, valueIndex: number): void {
    this.getAttributeValues(attrCtrl).removeAt(valueIndex);
    this.generateCombinations();
  }
  onAttributeNameChange(attrCtrl: AbstractControl): void {
    const name = attrCtrl.get('nameKeyOrText')?.value;
    attrCtrl.patchValue({ type: this.inferAttributeType(name) }, { emitEvent: false });
    this.getAttributeValues(attrCtrl).clear();
    this.generateCombinations();
  }

  // === Display Specifications ===
  addDisplaySpecification(): void { this.displaySpecifications.push(this.createDisplaySpecification()); }
  removeDisplaySpecification(index: number): void { this.displaySpecifications.removeAt(index); }

  // === MEDIA MANAGEMENT SECTION ===
  setFeaturedImage(mediaId: string | null): void {
    this.productForm.get('featuredImageId')?.setValue(mediaId);
  }

  manageRootMedia(): void {
    const rootMediaControl = this.productForm.get('mediaIds');
    if (!rootMediaControl) return;

    const dialogRef = this.overlayService.open<string[]>({
      component: VariantImageManagerComponent,
      data: {
        allProductImages: filterImageMedia(this.uploadedMedia()),
        linkedMediaIds: rootMediaControl.value || [],
        variantDisplayName: 'General Product Images'
      },
      backdropType: 'dark', closeOnClickOutside: false, maxWidth: '800px', height: '70vh'
    });

    dialogRef.afterClosed$.pipe(take(1)).subscribe(result => {
      if (result) {
        rootMediaControl.setValue(result);
        rootMediaControl.markAsDirty();
        const currentFeaturedId = this.featuredImageIdC();
        if ((currentFeaturedId && !result.includes(currentFeaturedId)) || (!currentFeaturedId && result.length > 0)) {
          this.setFeaturedImage(result[0] || null);
        }
      }
    });
  }

  manageCombinationMedia(combinationControl: AbstractControl): void {
    const dialogRef = this.overlayService.open<string[]>({
      component: VariantImageManagerComponent,
      data: {
        allProductImages: filterImageMedia(this.uploadedMedia()),
        linkedMediaIds: combinationControl.get('mediaIds')?.value || [],
        variantDisplayName: `Combination: ${combinationControl.get('sku')?.value || 'New'}`
      },
      backdropType: 'dark', closeOnClickOutside: false, maxWidth: '800px', height: '70vh'
    });
    dialogRef.afterClosed$.pipe(take(1)).subscribe(result => {
      if (result) {
        combinationControl.get('mediaIds')?.setValue(result);
        combinationControl.markAsDirty();
      }
    });
  }

  removeMedia(id: string): void {
    if (!confirm('Are you sure you want to permanently delete this media item? It will be removed from all assignments.')) {
      return;
    }
    this.mediaFacade.deleteMedia(id);
    if (this.featuredImageIdC() === id) {
      this.setFeaturedImage(null);
    }
    const rootMediaControl = this.productForm.get('mediaIds');
    if (rootMediaControl) {
      const currentRootMediaIds = (rootMediaControl.value as string[]).filter(mediaId => mediaId !== id);
      if (currentRootMediaIds.length !== (rootMediaControl.value as string[]).length) {
        rootMediaControl.setValue(currentRootMediaIds, { emitEvent: false });
        rootMediaControl.markAsDirty();
      }
    }
    this.variantCombinations.controls.forEach(comboControl => {
      const mediaIdsControl = comboControl.get('mediaIds');
      if (mediaIdsControl) {
        const currentIds = (mediaIdsControl.value as string[]).filter(mediaId => mediaId !== id);
        if (currentIds.length !== (mediaIdsControl.value as string[]).length) {
          mediaIdsControl.setValue(currentIds, { emitEvent: false });
          mediaIdsControl.markAsDirty();
        }
      }
    });
    this.notificationService.showSuccess('Media item successfully deleted and removed from assignments.');
  }

  private loadProductMediaIntoState(product: Product): void {
    if (!product.media || product.media.length === 0) {
        return;
    }

    console.log('[ProductFormComponent] Loading product media into MediaFacade state:', product.media);
    
    this.store.dispatch(MediaActions.mediaLoadedFromSource({ 
        media: [...product.media] 
    }));
  }

  // === Combinations ===
  setDefaultVariant(selectedIndex: number): void { this.variantCombinations.controls.forEach((c, i) => c.get('isDefault')?.setValue(i === selectedIndex, { emitEvent: false })); }

  // === Helper Methods ===
  getPredefinedValues(attrName?: string | null): PredefinedAttributeValueDto[] | undefined { 
    const titleCaseName = attrName ? (attrName.split('.').pop() || '').charAt(0).toUpperCase() + (attrName.split('.').pop() || '').slice(1) : '';
    return this.viewModel()?.predefinedAttributes?.[titleCaseName]; 
  }

  getCombinationPrimaryImage(comboCtrl: AbstractControl): Image | undefined { const ids = comboCtrl.get('mediaIds')?.value as string[] | null; return ids?.length ? filterImageMedia(this.uploadedMedia()).find(img => img.id === ids[0]) : undefined; }
  getValidationRule(def: CustomAttributeDefinitionDto, rule: 'min' | 'max'): number { try { return (JSON.parse(def.validationRulesJson || '{}'))[rule] ?? (rule === 'min' ? 0 : 100); } catch { return rule === 'min' ? 0 : 100; } }
  comparePredefinedValues(o1: any, o2: any): boolean {
    if (o1 === CUSTOM_ATTRIBUTE_VALUE || o2 === CUSTOM_ATTRIBUTE_VALUE) return o1 === o2;
    return (typeof o1 === 'object' && o1 && typeof o2 === 'object' && o2) ? o1.id === o2.id : o1 === o2;
  }

  // === CONSOLIDATED TRACKBY FUNCTIONS ===
  protected trackByTempId = (index: number, control: AbstractControl) => control.get('tempId')?.value ?? index;
  protected trackByCombination = (index: number, control: AbstractControl) => { 
    const attrs = control.get('attributes')?.value as { attributeId: string, attributeValueId: string }[]; 
    return attrs ? attrs.map(a => a.attributeValueId).sort().join('-') : index; 
  };

  // === CONSOLIDATED ERROR HANDLING ===
  protected getErrorMessage(control: AbstractControl | null): string {
    if (!control || !control.touched || control.valid) return '';
    
    if (control.hasError('required')) {
      return this.translateService.instant('common.errors.validation.requiredField');
    }
    if (control.hasError('duplicate')) {
      return this.translateService.instant('admin.products.form.duplicateSku');
    }
    return this.translateService.instant('common.errors.validation.invalidField');
  }

  protected getFieldError(path: string): string {
    return this.getErrorMessage(this.productForm.get(path));
  }

  protected getArrayError(arrayControl: AbstractControl, index: number, fieldName: string): string {
    const control = (arrayControl.get('values') as FormArray)?.at(index)?.get(fieldName);
    return this.getErrorMessage(control);
  }

  protected getCombinationError(index: number, fieldName: string): string {
    const control = this.variantCombinations?.at(index)?.get(fieldName);
    return this.getErrorMessage(control);
  }

  protected getSpecError(index: number, fieldName: string): string {
    const control = this.displaySpecifications?.at(index)?.get(fieldName);
    return this.getErrorMessage(control);
  }

  // === SIMPLIFIED MEDIA UTILITIES ===
  protected getMediaDisplayUrl(media?: Media): string {
    if (!media) return '';
    
    return media.type === MediaType.IMAGE 
      ? (media as Image).variants?.[0]?.url || ''
      : (media as any)?.url || '';
  }

  protected getMediaDisplayText(media: Media): string {
    return media.type === MediaType.IMAGE 
      ? (media as Image).altText || 'Image'
      : (media as any).title || 'Media';
  }

  // Backwards compatibility aliases
  getMediaUrl = this.getMediaDisplayUrl;
  getMediaAltText = this.getMediaDisplayText;

  // === Template Helper Methods ===
  protected hasCustomAttributes(): boolean {
    const customAttrs = this.productForm.get('customAttributes')?.value;
    return customAttrs && Object.keys(customAttrs).length > 0;
  }

  protected getCustomAttributeKeys(): string[] {
    const customAttrs = this.productForm.get('customAttributes')?.value;
    return customAttrs ? Object.keys(customAttrs) : [];
  }

  protected formatCustomAttributeLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  protected reloadProductMedia(): void {
    const product = this.product();
    if (product) {
      this.loadProductMediaIntoState(product);
      this.notificationService.showInfo('Media reloaded into state');
    }
  }

  // === CONSOLIDATED DEBUG SYSTEM ===
  private debugState(section: 'variant' | 'media' | 'category' | 'attribute', action?: string): void {
    console.group(`%c[DEBUG] ${section.toUpperCase()} ${action || 'State'}`, 'color: #9C27B0; font-weight: bold;');
    
    switch (section) {
      case 'variant':
        try {
          const rawValue = this.productForm.getRawValue();
          console.log('%c--- RAW FORM VALUE (CLONED) ---', 'color: #03A9F4; font-weight: bold;', structuredClone(rawValue));
          const payload = this.mapFormToPayload();
          console.log('%c--- MAPPED PAYLOAD PREVIEW (CLONED) ---', 'color: #4CAF50; font-weight: bold;', structuredClone(payload));
        } catch (e) {
          console.error("Error during debug state creation:", e);
        }
        break;
        
      case 'media':
        console.log('All media from facade:', this.uploadedMedia());
        console.log('Root media IDs from form:', this.productForm.get('mediaIds')?.value as string[] || []);
        console.log('Root media computed:', this.rootMedia());
        console.log('Featured image ID:', this.featuredImageIdC());
        this.variantCombinations.controls.forEach((combo, i) => {
          const mediaIds = combo.get('mediaIds')?.value as string[] || [];
          console.log(`Combination ${i} media IDs:`, mediaIds);
        });
        break;
        
      case 'category':
        const selectedIds = this.productForm.get('categoryIds')?.value || [];
        console.log('Selected category IDs:', selectedIds);
        console.log('Category key map size:', this.categoryKeyMap.size);
        const vm = this.viewModel();
        console.log('Available categories count:', vm?.allCategories?.length);
        if (action === 'tree') {
          this.categoryTreeService.getCategoryTreeAsync().then(categories => {
            console.log('Full category tree:', categories);
            const logTreeStructure = (items: any[], level = 0) => {
              items.forEach(item => {
                const indent = '  '.repeat(level);
                console.log(`${indent}${item.name || item.key} (ID: ${item.id})`);
                if (item.children && item.children.length > 0) {
                  logTreeStructure(item.children, level + 1);
                }
              });
            };
            console.log('\n=== Tree Structure ===');
            logTreeStructure(categories);
            if (selectedIds.length > 0) {
              console.log('\n=== Testing Current Selection ===');
              selectedIds.forEach((id: string) => {
                const parents = this.findCategoryParentChain(categories, id);
                console.log(`Category ${id} has parents:`, parents);
              });
            }
          }).catch(error => {
            console.error('Error loading category tree:', error);
          });
        }
        break;
        
      case 'attribute':
        const vmAttr = this.viewModel();
        console.log('Available attribute names:', vmAttr?.attributeNames);
        this.variantAttributes.controls.forEach((attr, i) => {
          const nameKeyOrText = attr.get('nameKeyOrText')?.value;
          console.log(`Attribute ${i} nameKeyOrText:`, nameKeyOrText);
          console.log(`Is in attributeNames:`, vmAttr?.attributeNames?.includes(nameKeyOrText));
        });
        break;
    }
    
    console.groupEnd();
  }

  protected debugVariantState = () => this.debugState('variant');
  protected debugMediaState = () => this.debugState('media');
  protected debugCategoryState = () => this.debugState('category');
  protected debugCategoryTree = () => this.debugState('category', 'tree');
  protected debugAttributeState = () => this.debugState('attribute');

  protected async testCategoryParents(): Promise<void> {
    const selectedIds = this.productForm.get('categoryIds')?.value || [];
    if (selectedIds.length === 0) {
      console.log('No categories selected to test');
      return;
    }

    console.log('Testing parent selection for:', selectedIds);
    const withParents = await this.ensureCategoryParentsSelected(selectedIds);
    console.log('Result with parents:', withParents);

    this.productForm.get('categoryIds')?.setValue(withParents);
  }

  // === Form Creation Helpers ===
private createFormControl<T>(value: T, validators: ValidatorFn[] = []) {
  return this.fb.control(value, validators);
}

private createRequiredControl<T>(value: T, additionalValidators: ValidatorFn[] = []) {
  return this.fb.control(value, [Validators.required, ...additionalValidators]);
}


  // === Private Methods ===
  private initializeForm(): void {
    this.productForm = this.fb.group({
      type: [ProductType.PHYSICAL, Validators.required], name: ['', Validators.required], description: [''], shortDescription: [null],
      status: [ProductStatus.DRAFT, Validators.required], isActive: [true], isFeatured: [false], currency: ['EUR', Validators.required],
      appScope: ['plushie-paradise'], tags: [[]], categoryIds: [[]], mediaIds: this.fb.control([]), featuredImageId: [null],
      variantAttributes: this.fb.array([]), variantCombinations: this.fb.array([], { validators: [this.combinationsValidator()] }),
      customAttributes: this.fb.group({}), displaySpecifications: this.fb.array([]),
      physicalProductConfig: this.fb.group({
        pricing: this.fb.group({ price: [null], originalPrice: [null] }, { validators: this.priceValidator() }),
        sku: [null], brand: [null], manageStock: [true], stockQuantity: [null], allowBackorders: [false], lowStockThreshold: [null],
        availabilityRules: this.fb.group({ minOrderQuantity: [null], maxOrderQuantity: [null], quantityIncrements: [null], isActive: [true] }, { validators: this.createMinMaxValidator('minOrderQuantity', 'maxOrderQuantity') }),
        ageRestrictions: this.fb.group({ minAge: [null], maxAge: [null] }, { validators: this.createMinMaxValidator('minAge', 'maxAge') })
      }, { validators: this.physicalProductConfigValidator() }),
      seo: this.fb.group({ title: [null], description: [null], keywords: [null], imageUrl: [null] })
    });
  }

  private setupEffects(): void {
    effect(() => {
      const productToEdit = this.product();
      const vm = this.viewModel();
      if (productToEdit && this.productForm && vm?.predefinedAttributes) {
        if (!this.hasBeenPatched || this.lastPatchedProductId !== productToEdit.id) {
          this.patchFormForEdit(productToEdit);
          this.hasBeenPatched = true;
          this.lastPatchedProductId = productToEdit.id;
        }
      }
    });

    effect(() => {
      const vm = this.viewModel();
      if (vm?.customAttributeDefinitions && this.productForm && !this.customAttributesInitialized) {
        const productToEdit = this.product();
        if (productToEdit?.customAttributes) {
          this.initializeCustomAttributes(productToEdit.customAttributes);
        } this.customAttributesInitialized = true;
      }
    });
  }

  private async loadCategoryMapping(): Promise<void> {
    try {
      const categories = await this.categoryTreeService.getCategoryTreeAsync();
      this.buildCategoryKeyMap(categories);
    } catch (error) {
      console.warn('Could not load category mapping:', error);
    }
  }

  private buildCategoryKeyMap(categories: any[]): void {
    const processCategory = (cat: any) => {
      this.categoryKeyMap.set(cat.id, cat.key);
      if (cat.children) {
        cat.children.forEach(processCategory);
      }
    };
    categories.forEach(processCategory);
  }

  private setupMediaSync(): void {
    this.mediaFacade.allMedia$.pipe(startWith([] as readonly Media[]), pairwise(), takeUntilDestroyed(this.destroyRef)).subscribe(([prev, curr]) => {
      const idMap = new Map<string, string>();
      const newFinalMedia = curr.filter(c => !c.id.startsWith('temp_') && !prev.some(p => p.id === c.id));
      newFinalMedia.forEach(final => {
        const tempMatch = prev.find(p => p.id.startsWith('temp_') && p.title === final.title);
        if (tempMatch) idMap.set(tempMatch.id, final.id);
      });
      if (idMap.size > 0) this.syncMediaIdsInForm(idMap);
    });
  }

  private setupFormMonitoring(): void {
    this.variantAttributes.valueChanges.pipe(
        auditTime(0),
        filter(() => this.isVariantInputComplete()),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
        if (!this.isPatching) {
            this.generateCombinations();
        }
    });

    this.displaySpecifications.controls.forEach(c => this.monitorSpecificationKey(c as FormGroup));

    this.productForm.get('physicalProductConfig.manageStock')?.valueChanges.pipe(
        takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.productForm.get('physicalProductConfig')?.updateValueAndValidity());

    this.productForm.get('name')?.valueChanges.pipe(
        debounceTime(500), 
        distinctUntilChanged(), 
        takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => { 
        if (this.variantCombinations.length > 0) {
            this.regenerateSkus(); 
        }
    });

    this.productForm.get('categoryIds')?.valueChanges.pipe(
        debounceTime(100),
        distinctUntilChanged((prev: string[], curr: string[]) => {
            if (!prev && !curr) return true;
            if (!prev || !curr) return false;
            if (prev.length !== curr.length) return false;
            return prev.every((id: string, index: number) => id === curr[index]);
        }),
        filter((selectedIds: string[]) => {
            return !this.isPatching && selectedIds && selectedIds.length > 0;
        }),
        takeUntilDestroyed(this.destroyRef)
    ).subscribe(async (selectedIds: string[]) => {
        console.log('[ProductFormComponent] Category change detected (non-patch):', selectedIds);
        await this.handleCategoryChange(selectedIds);
    });
  }

  private async handleCategoryChange(selectedIds: string[]): Promise<void> {
    console.log('[ProductFormComponent] Handling category change:', selectedIds);
    
    try {
        const categories = await this.categoryTreeService.getCategoryTreeAsync();
        const allRequiredIds = new Set<string>();
        let hasNewParents = false;
        
        for (const categoryId of selectedIds) {
            console.log(`Processing category: ${categoryId}`);
            
            const parents = this.findCategoryParentChain(categories, categoryId);
            console.log(`Found parents for ${categoryId}:`, parents);
            
            for (const parentId of parents) {
                if (!selectedIds.includes(parentId)) {
                    hasNewParents = true;
                    console.log(`New parent found: ${parentId}`);
                }
                allRequiredIds.add(parentId);
            }
            
            allRequiredIds.add(categoryId);
        }
        
        const result = Array.from(allRequiredIds);
        console.log('Final result:', result);
        console.log('Has new parents:', hasNewParents);
        
        if (hasNewParents) {
            console.log('Updating form with new parents');
            this.productForm.get('categoryIds')?.setValue(result, { emitEvent: false });
            this.notificationService.showInfo(`Auto-selected ${result.length - selectedIds.length} parent categories`);
        } else {
            console.log('No new parents to add');
        }
        
    } catch (error) {
        console.error('Error in category change handling:', error);
    }
  }

  private isVariantInputComplete(): boolean {
    const attrs = this.variantAttributes.value as AttributeFormValue[];
    if (!attrs.length) return true;
    return attrs.every(attr => !!attr.nameKeyOrText && Array.isArray(attr.values) && attr.values.length > 0 && attr.values.every(val => (val.predefinedValue === CUSTOM_ATTRIBUTE_VALUE && !!val.displayNameKeyOrText?.trim()) || (typeof val.predefinedValue === 'object' && val.predefinedValue !== null)));
  }

  private monitorSpecificationKey(group: FormGroup): void {
    group.get('specKey')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(key => {
      const def = this.viewModel()?.displaySpecificationDefinitions.find(d => d.specKey === key);
      if (def) group.patchValue({ labelKeyOrText: def.labelKeyOrText, groupKeyOrText: def.groupKeyOrText }, { emitEvent: false });
    });
  }

  private syncMediaIdsInForm(idMap: Map<string, string>): void {
    const syncIds = (currentIds: string[]): { changed: boolean; ids: string[] } => {
      let changed = false;
      const newIds = currentIds.map(id => {
        if (idMap.has(id)) {
          changed = true;
          return idMap.get(id)!;
        }
        return id;
      });
      return { changed, ids: newIds };
    };

    const rootMediaControl = this.productForm.get('mediaIds');
    if (rootMediaControl) {
      const { changed, ids } = syncIds(rootMediaControl.value || []);
      if (changed) rootMediaControl.setValue(ids, { emitEvent: false });
    }

    this.variantCombinations.controls.forEach(combo => {
      const c = combo.get('mediaIds');
      if (c) {
        const { changed, ids } = syncIds(c.value || []);
        if (changed) c.setValue(ids, { emitEvent: false });
      }
    });
  }

  private initializeCustomAttributes(customAttributes: Record<string, any>): void {
    const group = this.productForm.get('customAttributes') as FormGroup;

    Object.keys(group.controls).forEach(key => group.removeControl(key));

    if (customAttributes) {
      Object.entries(customAttributes).forEach(([key, value]) => {
        const numericValue = typeof value === 'number' ?
          Math.max(1, Math.min(10, value)) : 5;

        group.addControl(key, this.fb.control(numericValue, [
          Validators.required,
          Validators.min(1),
          Validators.max(10)
        ]));
      });
    }
  }

  private patchFormForEdit(product: Product): void {
    console.log('%c[ProductFormComponent] STARTING PATCH PROCESS FOR PRODUCT:', 'color: #03A9F4; font-weight: bold; font-size: 14px;', structuredClone(product));
    
    this.loadProductMediaIntoState(product);
    
    this.isPatching = true;
    const vm = this.viewModel();
    if (!vm?.predefinedAttributes) {
        console.error('[ProductFormComponent] Patch aborted: Predefined attributes map is not available in the ViewModel.');
        this.isPatching = false;
        return;
    }

    const allPredefinedValues = new Map<string, PredefinedAttributeValueDto>();
    Object.values(vm.predefinedAttributes).forEach(valueArray => 
        valueArray.forEach(value => allPredefinedValues.set(value.id, value))
    );
    console.log('[ProductFormComponent] Created lookup map with', allPredefinedValues.size, 'predefined values.');

    this.productForm.patchValue({
        type: product.type, 
        name: product.name, 
        description: product.description,
        shortDescription: product.shortDescription, 
        status: product.status,
        isActive: product.isActive, 
        isFeatured: product.isFeatured,
        currency: product.currency, 
        appScope: product.appScope,
        tags: product.tags ? [...product.tags] : [],
        categoryIds: product.categoryIds ? [...product.categoryIds] : [],
        mediaIds: (product.media?.map(m => m.id)) ?? [],
        featuredImageId: product.media?.find(m => m.id === (product as any).featuredImage?.id)?.id ?? null,
        seo: {
            title: product.metaTitle,
            description: product.metaDescription,
            keywords: product.metaKeywords?.join(', ') ?? ''
        },
    }, { emitEvent: false });

    if (isPhysicalProduct(product)) {
        this.productForm.get('physicalProductConfig')?.patchValue({
            pricing: { price: product.price, originalPrice: product.originalPrice },
            sku: product.sku, 
            brand: product.brand, 
            manageStock: product.manageStock ?? true,
            stockQuantity: product.stockQuantity, 
            allowBackorders: product.allowBackorders,
            lowStockThreshold: product.lowStockThreshold,
            availabilityRules: product.availabilityRules ?? {},
            ageRestrictions: (product as any).ageRestrictions ?? {}
        }, { emitEvent: false });
        
        if (product.customAttributes) {
            this.initializeCustomAttributes(product.customAttributes);
        }
    }

    if (product.categoryIds && product.categoryIds.length > 0) {
        setTimeout(async () => {
            try {
                const idsWithParents = await this.ensureCategoryParentsSelected(product.categoryIds!);
                if (idsWithParents.length > product.categoryIds!.length) {
                    console.log('[ProductFormComponent] Auto-selecting parents during patch:', {
                        original: product.categoryIds,
                        withParents: idsWithParents
                    });
                    this.productForm.get('categoryIds')?.setValue(idsWithParents, { emitEvent: false });
                }
            } catch (error) {
                console.warn('[ProductFormComponent] Could not auto-select parents during patch:', error);
            }
        }, 0);
    }

    const usedAttributeIds = new Set<string>();
    product.variantCombinations?.forEach(combo => {
        combo.attributes.forEach(attrSelection => usedAttributeIds.add(attrSelection.attributeId));
    });
    console.log('[ProductFormComponent] Identified used attribute IDs:', Array.from(usedAttributeIds));

    const relevantAttributes = (product.variantAttributes ?? []).filter(attr => usedAttributeIds.has(attr.id));
    console.log(`[ProductFormComponent] Filtered down to ${relevantAttributes.length} relevant attributes.`);

    this.variantAttributes.clear({ emitEvent: false });
    relevantAttributes.forEach(attr => {
        const valuesFormGroups = (attr.values ?? []).map(val => {
            const predefinedValueObject = allPredefinedValues.get(val.id);
            return this.createAttributeValue(val, predefinedValueObject ?? null);
        });
        
        const normalizedNameKeyOrText = this.normalizeAttributeName(attr.nameKeyOrText || attr.name);
        const attrFormGroup = this.createVariantAttribute({
            ...attr,
            nameKeyOrText: normalizedNameKeyOrText
        }, valuesFormGroups);
        this.variantAttributes.push(attrFormGroup, { emitEvent: false });
    });
    console.log(`[ProductFormComponent] Patched ${this.variantAttributes.length} variant attributes into FormArray.`);

    this.variantCombinations.clear({ emitEvent: false });
    product.variantCombinations?.forEach(combo => {
        this.variantCombinations.push(this.createVariantCombination(combo), { emitEvent: false });
    });
    console.log(`[ProductFormComponent] Patched ${this.variantCombinations.length} variant combinations.`);

    this.displaySpecifications.clear({ emitEvent: false });
    if (isPhysicalProduct(product)) {
        product.displaySpecifications?.forEach(spec => {
            this.displaySpecifications.push(this.createDisplaySpecification(spec), { emitEvent: false });
        });
    }

    this.productForm.markAsPristine();
    this.productForm.updateValueAndValidity({ emitEvent: false });
    this.isPatching = false;
    console.log('%c[ProductFormComponent] PATCH PROCESS COMPLETED.', 'color: #4CAF50; font-weight: bold;');
  }

  private normalizeAttributeName(name: string | undefined): string {
    if (!name) return '';

    const vm = this.viewModel();
    if (!vm?.attributeNames) return name;

    if (vm.attributeNames.includes(name)) {
      return name;
    }

    const variations: string[] = [
      name.toLowerCase(),
      name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
      name.replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    ];

    const lastPart = name.split('.').pop();
    if (lastPart) {
      variations.push(lastPart.charAt(0).toUpperCase() + lastPart.slice(1).toLowerCase());
    }

    for (const variation of variations.filter(Boolean)) {
      if (vm.attributeNames.includes(variation)) {
        console.log(`[ProductFormComponent] Normalized "${name}" to "${variation}"`);
        return variation;
      }
    }

    console.warn(`[ProductFormComponent] Could not normalize attribute name: "${name}". Available: `, vm.attributeNames);
    return name;
  }

  private async ensureCategoryParentsSelected(selectedCategoryIds: string[]): Promise<string[]> {
    if (!selectedCategoryIds || selectedCategoryIds.length === 0) {
      return [];
    }

    try {
      const categories = await this.categoryTreeService.getCategoryTreeAsync();
      const allRequiredIds = new Set<string>();

      for (const categoryId of selectedCategoryIds) {
        const parentChain = this.findCategoryParentChain(categories, categoryId);
        parentChain.forEach(parentId => allRequiredIds.add(parentId));
        allRequiredIds.add(categoryId);
      }

      const result = Array.from(allRequiredIds);

      if (result.length > selectedCategoryIds.length) {
        console.log('[ProductFormComponent] Auto-selected category parents:', {
          original: selectedCategoryIds,
          withParents: result,
          addedParents: result.filter(id => !selectedCategoryIds.includes(id))
        });
      }

      return result;
    } catch (error) {
      console.warn('[ProductFormComponent] Could not auto-select category parents:', error);
      return selectedCategoryIds;
    }
  }

  private findCategoryParentChain(categories: any[], targetCategoryId: string): string[] {
    if (this.categoryParentCache.has(targetCategoryId)) {
      return this.categoryParentCache.get(targetCategoryId)!;
    }

    const findInTree = (items: any[], targetId: string, currentPath: string[] = []): string[] | null => {
      for (const item of items) {
        const newPath = [...currentPath, item.id];

        if (item.id === targetId) {
          return currentPath;
        }

        if (item.children && Array.isArray(item.children) && item.children.length > 0) {
          const found = findInTree(item.children, targetId, newPath);
          if (found !== null) {
            return found;
          }
        }
      }
      return null;
    };

    const parentChain = findInTree(categories, targetCategoryId) || [];
    this.categoryParentCache.set(targetCategoryId, parentChain);
    return parentChain;
  }

  private createVariantAttribute(attr: Partial<VariantAttribute>, values: FormGroup[] = []): FormGroup {
    const arr = values.length ? this.fb.array(values) : this.fb.array((attr.values ?? []).map(v => this.createAttributeValue(v)));
    return this.fb.group({ 
      tempId: [attr.id ?? uuidv4()], 
      nameKeyOrText: [attr.nameKeyOrText ?? attr.name, Validators.required], 
      type: [attr.type ?? VariantAttributeType.CUSTOM, Validators.required], 
      displayType: [attr.displayType], 
      isRequired: [attr.isRequired ?? true], 
      values: arr 
    });
  }

  private createAttributeValue(val: Partial<VariantAttributeValue>, initialPredefinedValue: PredefinedAttributeValueDto | null = null): FormGroup {
    const initialDisplayName = val.displayName ?? initialPredefinedValue?.displayName ?? '';

    const group = this.fb.group({
      tempId: [val.id ?? uuidv4()],
      predefinedValue: [initialPredefinedValue],
      displayNameKeyOrText: [initialDisplayName],
      colorHex: [val.colorHex ?? initialPredefinedValue?.colorHex ?? null],
      priceModifier: [val.priceModifier ?? initialPredefinedValue?.priceModifier ?? null],
      isAvailable: [val.isAvailable ?? true]
    });

    group.get('predefinedValue')?.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
      distinctUntilChanged()
    ).subscribe(v => {
      if (v && typeof v === 'object' && v !== null) {
        group.patchValue({
          displayNameKeyOrText: v.displayName || v.name || '',
          colorHex: v.colorHex ?? null,
          priceModifier: v.priceModifier ?? null
        });
      } else if (v === CUSTOM_ATTRIBUTE_VALUE) {
        group.get('displayNameKeyOrText')?.enable();
        group.patchValue({ displayNameKeyOrText: '' });
      }
    });
    return group;
  }

  private createVariantCombination(combo?: Partial<ProductVariantCombination>): FormGroup {
    return this.fb.group({
      sku: this.createRequiredControl(combo?.sku ?? ''),
      price: this.createRequiredControl(combo?.price),
      originalPrice: this.createFormControl(combo?.originalPrice),
      stockQuantity: this.createRequiredControl(combo?.stockQuantity),
      stockStatus: this.createRequiredControl(combo?.stockStatus ?? StockStatus.IN_STOCK),
      isActive: this.createRequiredControl(combo?.isActive ?? true),
      isDefault: this.createFormControl(combo?.isDefault ?? false),
      attributes: this.fb.array((combo?.attributes ?? []).map(a => this.fb.group(a))),
      mediaIds: this.createFormControl(combo?.mediaIds ?? [])
    });
  }

  private createDisplaySpecification(spec?: Partial<ProductDisplaySpecification>): FormGroup {
    return this.fb.group({ 
      tempId: [uuidv4()], 
      specKey: [spec?.specKey ?? '', Validators.required], 
      labelKeyOrText: [{ value: spec?.labelKeyOrText ?? '', disabled: true }], 
      valueKeyOrText: [spec?.valueKeyOrText ?? '', Validators.required], 
      groupKeyOrText: [{ value: spec?.groupKeyOrText ?? '', disabled: true }] 
    });
  }

  private generateCombinations(): void {
    const formValues = this.variantAttributes.getRawValue() as AttributeFormValue[];
    const combinations = this.variantCombinations;
    if (formValues.length === 0 || !this.viewModel()?.predefinedAttributes) {
      combinations.clear();
      combinations.updateValueAndValidity();
      return;
    }

    const attributeDataForGeneration = formValues.map(attr => ({
      attributeId: attr.tempId,
      attributeName: attr.nameKeyOrText,
      values: attr.values.map(val => {
        if (val.predefinedValue === CUSTOM_ATTRIBUTE_VALUE) {
          return {
            valueId: val.tempId,
            displayName: val.displayNameKeyOrText,
            priceModifier: val.priceModifier ?? 0
          };
        }
        if (typeof val.predefinedValue === 'object' && val.predefinedValue !== null) {
          return {
            valueId: val.predefinedValue.id,
            displayName: val.predefinedValue.displayName,
            priceModifier: val.predefinedValue.priceModifier ?? 0
          };
        }
        return null;
      }).filter((v): v is { valueId: string; displayName: string; priceModifier: number; } => v !== null)
    })).filter(attr => attr.values.length > 0);

    const valueArrays = attributeDataForGeneration.map(attr =>
      attr.values.map(val => ({
        attributeId: attr.attributeId,
        ...val
      }))
    );

    const newCombinations = this.cartesianProduct(valueArrays);
    const existingCombos = new Map(combinations.controls.map(c => [this.getCombinationKey(c.get('attributes')?.value), c.getRawValue()]));

    combinations.clear();
    const prodName = this.sanitizeForSku(this.productForm.get('name')?.value || 'PRODUCT');
    const basePrice = Number(this.productForm.get('physicalProductConfig.pricing.price')?.value) || 0;

    newCombinations.forEach((comboParts: any[], i: number) => {
      const attributesForCombo = comboParts.map(p => ({ attributeId: p.attributeId, attributeValueId: p.valueId }));
      const key = this.getCombinationKey(attributesForCombo);
      const prev = existingCombos.get(key);

      const skuParts = attributeDataForGeneration.map(attr => {
        const part = comboParts.find(p => p.attributeId === attr.attributeId);
        return this.sanitizeForSku(part?.displayName ?? '');
      }).filter(p => p);

      const genSku = `SKU-${prodName}${skuParts.length ? '-' + skuParts.join('-') : ''}`;
      const finalSku = prev?.sku ?? genSku;
      const priceModifierSum = comboParts.reduce((sum, part) => sum + (part.priceModifier || 0), 0);
      const calculatedPrice = basePrice + priceModifierSum;
      const finalPrice = prev?.price ?? (calculatedPrice > 0 ? calculatedPrice : 0.01);

      combinations.push(this.createVariantCombination({
        sku: finalSku, price: finalPrice, originalPrice: prev?.originalPrice,
        stockQuantity: prev?.stockQuantity ?? 10, stockStatus: prev?.stockStatus ?? StockStatus.IN_STOCK,
        isActive: prev?.isActive ?? true, isDefault: prev?.isDefault ?? i === 0,
        attributes: attributesForCombo, mediaIds: prev?.mediaIds ?? []
      }), { emitEvent: false });
    });

    if (combinations.length > 0 && !combinations.controls.some(c => c.get('isDefault')?.value)) {
      combinations.controls[0].get('isDefault')?.setValue(true, { emitEvent: false });
    }
    combinations.updateValueAndValidity();
  }

  private getDisplayNameFromValueControl(valueControl: AbstractControl | AttributeValueFormValue): string {
    const raw = 'getRawValue' in valueControl ? valueControl.getRawValue() : valueControl;
    const dn = raw.displayNameKeyOrText;
    if (dn) return dn;
    const pv = raw.predefinedValue;
    return (pv && typeof pv === 'object') ? (pv.displayName || pv.name || 'Unknown') : 'Unknown';
  }

  private sanitizeForSku(text: string): string {
    if (!text) return 'UNKNOWN';
    const noDiacritics = text.normalize('NFD').replace(/\p{Diacritic}/gu, '');
    return noDiacritics.toUpperCase().replace(/[^A-Z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').substring(0, 15);
  }

  private getCombinationKey(attrs: any[]): string { return attrs ? attrs.map(a => a.attributeValueId).sort().join('|') : ''; }

  regenerateSkus(): void {
    const prodName = this.sanitizeForSku(this.productForm.get('name')?.value || 'PRODUCT');
    this.variantCombinations.controls.forEach((combo, i) => {
      const attrs = (combo.get('attributes') as FormArray).getRawValue();
      const parts: string[] = [];
      attrs.forEach((attr: any) => {
        const attrCtrl = this.variantAttributes.controls.find(c => c.get('tempId')?.value === attr.attributeId);
        if (attrCtrl) {
          const valCtrl = (attrCtrl.get('values') as FormArray).controls.find(v => v.get('tempId')?.value === attr.attributeValueId);
          if (valCtrl) parts.push(this.sanitizeForSku(this.getDisplayNameFromValueControl(valCtrl)));
        }
      });
      combo.get('sku')?.setValue(`SKU-${prodName}${parts.length > 0 ? '-' + parts.join('-') : `-V${i + 1}`}`, { emitEvent: false });
    });
    this.variantCombinations.updateValueAndValidity();
    this.notificationService.showInfo('All SKUs have been regenerated');
  }

  private mapFormToPayload(): CreateProductPayload | UpdateProductPayload {
    const formValue = this.productForm.getRawValue();

    const safeNullableArray = (arr?: any[]): any[] | null => Array.isArray(arr) && arr.length > 0 ? arr : null;

    const seo = (formValue.seo?.title || formValue.seo?.description || formValue.seo?.keywords) ? {
      title: formValue.seo.title || null,
      description: formValue.seo.description || null,
      keywords: formValue.seo.keywords ? formValue.seo.keywords.split(',').map((k: string) => k.trim()).filter(Boolean) : null,
      imageUrl: formValue.seo.imageUrl || null
    } : null;

    const variantAttributes = safeNullableArray(formValue.variantAttributes)?.map((attr: any) => ({
      tempId: attr.tempId,
      nameKeyOrText: attr.nameKeyOrText,
      type: attr.type,
      displayType: attr.displayType,
      isRequired: attr.isRequired,
      values: (attr.values || []).map((val: any) => {
        const isCustom = val.predefinedValue === CUSTOM_ATTRIBUTE_VALUE;
        return {
          tempId: val.tempId,
          value: isCustom ? val.displayNameKeyOrText.toLowerCase().replace(/\s+/g, '-') : (val.predefinedValue?.value ?? ''),
          displayNameKeyOrText: isCustom ? val.displayNameKeyOrText : (val.predefinedValue?.displayName ?? ''),
          colorHex: val.colorHex,
          priceModifier: val.priceModifier,
          isAvailable: val.isAvailable,
          predefinedValue: isCustom || !val.predefinedValue ? null : val.predefinedValue
        };
      })
    }));

    const variantOverrides = safeNullableArray(formValue.variantCombinations)?.map((combo: any) => ({
      tempAttributeValueIds: (combo.attributes || []).map((a: any) => a.attributeValueId),
      price: Number(combo.price),
      originalPrice: combo.originalPrice ? Number(combo.originalPrice) : null,
      stockQuantity: Number(combo.stockQuantity),
      sku: combo.sku,
      isDefault: combo.isDefault,
      isActive: combo.isActive,
      mediaIds: safeNullableArray(combo.mediaIds),
      stockStatus: combo.stockStatus
    }));

    const basePayload = {
      ...formValue,
      seo,
      variantAttributes,
      variantOverrides,
      tags: safeNullableArray(formValue.tags),
      categoryIds: safeNullableArray(formValue.categoryIds),
      mediaIds: safeNullableArray(formValue.mediaIds)
    };

    if (formValue.type === ProductType.PHYSICAL && formValue.physicalProductConfig) {
      basePayload.physicalProductConfig = {
        ...formValue.physicalProductConfig,
        pricing: {
          price: Number(formValue.physicalProductConfig.pricing.price) || null,
          originalPrice: Number(formValue.physicalProductConfig.pricing.originalPrice) || null
        },
        stockQuantity: formValue.physicalProductConfig.stockQuantity ?? null,
        displaySpecifications: safeNullableArray(formValue.displaySpecifications?.map((s: any) => ({
          ...s,
          icon: null,
          displayOrder: 0
        }))),
        ageRestrictions: (formValue.physicalProductConfig.ageRestrictions?.minAge || formValue.physicalProductConfig.ageRestrictions?.maxAge)
          ? formValue.physicalProductConfig.ageRestrictions
          : null
      };
    }

    basePayload.customAttributes = Object.keys(formValue.customAttributes || {}).length > 0
      ? formValue.customAttributes
      : null;

    delete (basePayload as any).variantCombinations;

    return this.isEditMode() ? basePayload as UpdateProductPayload : { ...basePayload, type: formValue.type } as CreateProductPayload;
  }

  protected cartesianProduct<T>(arrays: T[][]): T[][] { return arrays.reduce<T[][]>((a, b) => a.flatMap(x => b.map(y => [...x, y])), [[]]); }

  private showValidationErrors(): void {
    const controlLabelMap: Record<string, string> = { 
      'name': 'admin.products.form.productName', 
      'physicalProductConfig.pricing.price': 'admin.products.form.price', 
      'currency': 'admin.products.form.currency', 
      'physicalProductConfig.stockQuantity': 'admin.products.form.stockQuantity', 
      'variantCombinations.*.sku': 'admin.products.form.tableHeaders.SKU', 
      'variantCombinations.*.price': 'admin.products.form.tableHeaders.Price', 
      'variantCombinations.*.stockQuantity': 'admin.products.form.tableHeaders.Stock', 
      'displaySpecifications.*.valueKeyOrText': 'admin.products.form.displayValue', 
      'displaySpecifications.*.specKey': 'admin.products.form.specKeyInternal', 
      'variantAttributes.*.values.*.displayNameKeyOrText': 'admin.products.form.displayNameNew' 
    };
    this.overlayService.open({ 
      component: ValidationSummaryDialogComponent, 
      data: { 
        errors: this.validationService.getFormErrors(this.productForm, controlLabelMap), 
        fullFormData: this.productForm.getRawValue() 
      }, 
      backdropType: 'dark' 
    });
  }

  private inferAttributeType(name: string): VariantAttributeType { 
    const map: Record<string, VariantAttributeType> = { 
      'Color': VariantAttributeType.COLOR, 
      'Size': VariantAttributeType.SIZE, 
      'Material': VariantAttributeType.MATERIAL, 
      'Style': VariantAttributeType.STYLE 
    }; 
    return map[name] ?? VariantAttributeType.CUSTOM; 
  }

  // === CONSOLIDATED VALIDATORS ===
  private createMinMaxValidator(minField: string, maxField: string, errorKey = 'minMaxInvalid'): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      if (!(group instanceof FormGroup)) return null;
      
      const min = group.get(minField)?.value;
      const max = group.get(maxField)?.value;
      
      return (min !== null && max !== null && min > max) 
        ? { [errorKey]: true } 
        : null;
    };
  }

  private priceValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      if (!(group instanceof FormGroup) || !group.parent) return null;
      const priceControl = group.get('price');
      const originalPriceControl = group.get('originalPrice');
      const price = priceControl?.value;
      const originalPrice = originalPriceControl?.value;
      const rootForm = group.root as FormGroup;
      const variantCombinations = (rootForm.get('variantCombinations') as FormArray);
      priceControl?.setErrors(null);
      if ((!variantCombinations || variantCombinations.length === 0) && (price === null || price === undefined || price < 0)) {
        priceControl?.setErrors({ required: true });
      }
      if (price !== null && originalPrice !== null && price > originalPrice) {
        priceControl?.setErrors({ ...(priceControl.errors || {}), priceInvalid: true });
      }
      return priceControl?.errors ? { ...priceControl.errors } : null;
    };
  }

  private physicalProductConfigValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      if (!(group instanceof FormGroup) || !group.parent) return null;
      const manageStockControl = group.get('manageStock');
      const stockQuantityControl = group.get('stockQuantity');
      const rootForm = group.root as FormGroup;
      const variantCombinations = (rootForm.get('variantCombinations') as FormArray);
      if (stockQuantityControl) {
        stockQuantityControl.setErrors(null);
      }
      if (manageStockControl?.value && (!variantCombinations || variantCombinations.length === 0)) {
        if (stockQuantityControl?.value === null || stockQuantityControl?.value === undefined || stockQuantityControl.value < 0) {
          const error = { required: true, stockQuantityRequired: true };
          if (stockQuantityControl) {
            stockQuantityControl.setErrors(error);
          }
          return error;
        }
      }
      return null;
    };
  }

  private combinationsValidator(): ValidatorFn {
    return (formArray: AbstractControl): ValidationErrors | null => {
      if (!(formArray instanceof FormArray)) return null;
      const controls = formArray.controls;
      if (controls.length === 0 && (formArray.parent?.get('variantAttributes') as FormArray)?.length > 0) {
        return { noCombinationsGenerated: true };
      }
      const skuMap = new Map<string, AbstractControl[]>();
      let hasDefault = false;
      controls.forEach(c => c.get('sku')?.setErrors(null));
      for (const control of controls) {
        const sku = control.get('sku')?.value;
        if (sku) {
          if (!skuMap.has(sku)) skuMap.set(sku, []);
          skuMap.get(sku)!.push(control);
        }
        if (control.get('isDefault')?.value) hasDefault = true;
      }
      let hasDuplicateSku = false;
      skuMap.forEach(ctrls => {
        if (ctrls.length > 1) {
          hasDuplicateSku = true;
          ctrls.forEach(c => c.get('sku')?.setErrors({ duplicate: true }));
        }
      });
      const errors: ValidationErrors = {};
      if (hasDuplicateSku) errors['duplicateSku'] = true;
      if (controls.length > 0 && !hasDefault) errors['noDefaultVariant'] = true;
      return Object.keys(errors).length > 0 ? errors : null;
    };
  }
}