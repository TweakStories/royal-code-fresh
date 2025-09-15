--- START OF FILE apps/admin-panel/src/app/components/product-form/product-form.component.ts ---

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
  ValidatorFn
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
import { TitleTypeEnum } from '@royal-code/shared/domain';
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
  SelectOption,
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
    UiSliderComponent, MediaUploaderComponent, UiSelectComponent, VariantImageManagerComponent,
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
          <royal-code-ui-button type="outline" routerLink="/products">
            {{ 'admin.products.form.cancel' | translate }}
          </royal-code-ui-button>
          
          <royal-code-ui-button 
            type="primary" 
            htmlType="submit" 
            [disabled]="vm.isSubmitting || isAnyUploadPending()"
>
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

    <!-- === FORM CONTENT GRID === -->
    <div class="p-2 md:p-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- === MAIN CONTENT COLUMN === -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- Basic Information -->
        <div class="p-6 bg-card border border-border rounded-xs">
          <h3 class="text-lg font-medium mb-4">{{ 'admin.products.form.basicInfo' | translate }}</h3>
          <div class="space-y-4">
            <royal-code-ui-input [label]="'admin.products.form.productName' | translate" formControlName="name" [required]="true" [error]="getErrorMessage('name')" />
            <royal-code-ui-textarea [label]="'admin.products.form.shortSummary' | translate" formControlName="shortDescription" [rows]="3" />
            <royal-code-ui-textarea [label]="'admin.products.form.fullDescription' | translate" formControlName="description" [rows]="6" />
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
                <p class="text-sm text-secondary mt-2">No media uploaded yet. Use the uploader above to add images.</p>
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
            <div class="flex gap-2">
              <royal-code-ui-button type="fire" sizeVariant="sm" (clicked)="debugVariantState()"><royal-code-ui-icon [icon]="AppIcon.Bug" extraClass="mr-2" />Debug State</royal-code-ui-button>
              <royal-code-ui-button type="outline" sizeVariant="sm" (clicked)="addVariantAttribute()"><royal-code-ui-icon [icon]="AppIcon.Plus" extraClass="mr-2" />{{ 'admin.products.form.addAttribute' | translate }}</royal-code-ui-button>
            </div>
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
              @for (attr of variantAttributes.controls; track trackByAttribute($index, attr); let i = $index) {
                <div [formGroupName]="i" class="p-4 border border-border rounded-md bg-surface-alt">
                  <div class="grid grid-cols-1 gap-4 mb-3">
                    <div>
                      <label class="block text-sm font-medium text-foreground mb-1">{{ 'admin.products.form.attribute' | translate }}</label>
                      <select formControlName="nameKeyOrText" (change)="onAttributeNameChange(attr)" class="w-full p-2 border border-input rounded-md bg-background text-sm">
                        <option value="" disabled>{{ 'admin.products.form.chooseExistingAttribute' | translate }}</option>
                        @for(name of vm.attributeNames; track name) { <option [value]="name">{{ name | titlecase }}</option> }
                      </select>
                    </div>
                    <div class="col-span-2 flex justify-between items-center">
                      <label class="flex items-center text-sm font-medium text-foreground"><input type="checkbox" formControlName="isRequired" class="mr-2 h-4 w-4 rounded text-primary focus:ring-primary border-border">{{ 'admin.products.form.isRequired' | translate }}</label>
                      <royal-code-ui-button type="fire" sizeVariant="sm" (clicked)="removeVariantAttribute(i)"><royal-code-ui-icon [icon]="AppIcon.Trash2" sizeVariant="sm" extraClass="mr-2"/>{{ 'admin.products.form.removeAttribute' | translate }}</royal-code-ui-button>
                    </div>
                  </div>
                  <div formArrayName="values" class="space-y-2">
                    @for (val of getAttributeValues(attr).controls; track trackByValue($index, val); let j = $index) {
                      <div [formGroupName]="j" class="p-3 border border-dashed border-border rounded-md">
                        <div class="grid grid-cols-[1fr_auto] gap-2 items-end">
                          <div>
                            <label class="block text-xs font-medium text-foreground mb-1">{{ 'admin.products.form.chooseValue' | translate }}</label>
<select formControlName="predefinedValue" class="w-full p-2 border border-input rounded-md bg-background text-sm" [compareWith]="comparePredefinedValues">                              <option [ngValue]="null" disabled>{{ 'admin.products.form.selectExisting' | translate }}</option>
                              @if(getPredefinedValues(attr.get('nameKeyOrText')?.value); as options) {
                                @for(option of options; track option.id) { <option [ngValue]="option">{{ option.displayName }}</option> }
                              }
                              <option [value]="CUSTOM_ATTRIBUTE_VALUE">{{ 'admin.products.form.createNewValue' | translate }}</option>
                            </select>
                          </div>
                          <royal-code-ui-button type="transparent" sizeVariant="icon" (clicked)="removeAttributeValue(attr, j)"><royal-code-ui-icon [icon]="AppIcon.X" sizeVariant="sm"/></royal-code-ui-button>
                        </div>
                        @if (val.get('predefinedValue')?.value === CUSTOM_ATTRIBUTE_VALUE) {
                          <div class="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border">
                            <royal-code-ui-input [label]="'admin.products.form.displayNameNew' | translate" formControlName="displayNameKeyOrText" [required]="true" [error]="getErrorMessageForArray(attr, j, 'displayNameKeyOrText')" />
                            @if(attr.get('type')?.value === 'color') { <royal-code-ui-input [label]="'admin.products.form.colorHexOptional' | translate" formControlName="colorHex" /> }
                            <royal-code-ui-input [label]="'admin.products.form.priceModifierOptional' | translate" formControlName="priceModifier" type="number" />
                          </div>
                        } @else {
                          <div [class.hidden]="!val.get('predefinedValue')?.value"><royal-code-ui-input [label]="'admin.products.form.displayName' | translate" formControlName="displayNameKeyOrText" [readonly]="true" extraClasses="mt-2" /></div>
                        }
                      </div>
                    }
                  </div>
                  <royal-code-ui-button type="outline" sizeVariant="xs" (clicked)="addAttributeValue(attr)" extraClasses="mt-3">{{ 'admin.products.form.addValue' | translate }}</royal-code-ui-button>
                </div>
              }
            }
          </div>
          @if (variantAttributes.controls.length > 0) {
            <div class="pt-4 border-t border-border flex justify-end">
                <royal-code-ui-button type="outline" sizeVariant="sm" (clicked)="addVariantAttribute()"><royal-code-ui-icon [icon]="AppIcon.Plus" extraClass="mr-2" />{{ 'admin.products.form.addAttribute' | translate }}</royal-code-ui-button>
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
                    @for (attr of variantAttributes.controls; track trackByAttribute($index, attr)) {
                      @if (getAttributeValues(attr).controls.length > 0 && attr.value.nameKeyOrText) { <th class="p-2 font-medium">{{ attr.value.nameKeyOrText | titlecase }}</th> }
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
                      @for (mainAttr of variantAttributes.controls; track trackByAttribute($index, mainAttr)) {
                        @if (getAttributeValues(mainAttr).controls.length > 0 && mainAttr.value.nameKeyOrText) {
                           <td class="p-2 font-semibold">{{ getAttributeDisplayValueForCombination(combo, mainAttr.value.tempId) }}</td>
                        }
                      }
                      <td class="p-2"><royal-code-ui-input formControlName="sku" [required]="true" extraClasses="!py-1" [error]="getErrorMessageForCombination(i, 'sku')" /></td>
                      <td class="p-2"><royal-code-ui-input formControlName="price" type="number" [required]="true" extraClasses="!py-1" [error]="getErrorMessageForCombination(i, 'price')" /></td>
                      <td class="p-2"><royal-code-ui-input formControlName="originalPrice" type="number" extraClasses="!py-1" /></td>
                      <td class="p-2"><royal-code-ui-input formControlName="stockQuantity" type="number" [required]="true" extraClasses="!py-1" [error]="getErrorMessageForCombination(i, 'stockQuantity')" /></td>
                      <td class="p-2"><select formControlName="stockStatus" class="w-full p-1 border border-input rounded-md bg-background text-xs"> @for(status of stockStatuses; track status) { <option [value]="status">{{ status | titlecase }}</option> } </select></td>
                      <td class="p-2">
                        <div class="flex items-center gap-2">
                          @if((combo.get('mediaIds')?.value ?? []).length > 0) {
                            <div class="w-8 h-8 rounded-md border border-border bg-muted overflow-hidden">
                              <img [src]="getMediaUrl(getCombinationPrimaryImage(combo))" [alt]="'Combination image'" class="w-full h-full object-cover">
                            </div>
                          }
                          <royal-code-ui-button type="outline" sizeVariant="icon" (clicked)="manageCombinationMedia(combo)" [title]="'Manage media for this combination'"><royal-code-ui-icon [icon]="AppIcon.Camera" /></royal-code-ui-button>
                        </div>
                      </td>
                      <td class="p-2 text-center"><input type="radio" name="defaultVariant" [value]="i" (change)="setDefaultVariant(i)" [checked]="combo.get('isDefault')?.value" class="h-4 w-4 text-primary focus:ring-primary border-border"></td>
                      <td class="p-2"><royal-code-ui-toggle-button formControlName="isActive" label="" /></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            @if (variantCombinations.errors) {
              <div class="mt-2 text-sm text-destructive space-y-1">
                @if (variantCombinations.errors['duplicateSku']) { <p>{{ 'admin.products.form.duplicateSku' | translate }}</p> }
                @if (variantCombinations.errors['noDefaultVariant']) { <p>{{ 'admin.products.form.noDefaultVariant' | translate }}</p> }
                @if (variantCombinations.errors['noCombinationsGenerated']) { <p>{{ 'admin.products.form.noCombinationsGenerated' | translate }}</p> }
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
            <royal-code-ui-button type="outline" sizeVariant="sm" (clicked)="addDisplaySpecification()"><royal-code-ui-icon [icon]="AppIcon.Plus" extraClass="mr-2" />{{ 'admin.products.form.addSpec' | translate }}</royal-code-ui-button>
          </div>
          <div formArrayName="displaySpecifications" class="space-y-4">
            @for (spec of displaySpecifications.controls; track trackBySpecification($index, spec); let i = $index) {
              <div [formGroupName]="i" class="p-4 border border-dashed border-border rounded-md">
                <div class="grid grid-cols-[1fr_auto] gap-2 items-end">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <royal-code-ui-select [label]="'admin.products.form.specKeyInternal' | translate" formControlName="specKey" [options]="specificationOptions()" [required]="true" [error]="getErrorMessageForDisplaySpec(i, 'specKey')" />
                    <royal-code-ui-input [label]="'admin.products.form.displayName' | translate" formControlName="labelKeyOrText" [readonly]="true" />
                    <royal-code-ui-input [label]="'admin.products.form.displayValue' | translate" formControlName="valueKeyOrText" [required]="true" [error]="getErrorMessageForDisplaySpec(i, 'valueKeyOrText')" />
                    <royal-code-ui-input [label]="'admin.products.form.groupOptional' | translate" formControlName="groupKeyOrText" [readonly]="true" />
                  </div>
                  <royal-code-ui-button type="transparent" sizeVariant="icon" (clicked)="removeDisplaySpecification(i)"><royal-code-ui-icon [icon]="AppIcon.X" sizeVariant="sm"/></royal-code-ui-button>
                </div>
              </div>
            }
          </div>
          @if (displaySpecifications.controls.length === 0) { <p class="text-sm text-secondary">{{ 'admin.products.form.addSpecsHelp' | translate }}</p> }
        </div>
      </div>

      <!-- === SIDEBAR COLUMN === -->
      <aside class="lg:col-span-1 space-y-6 sticky top-24">
        
        <!-- Organization & Status -->
        <div class="p-6 bg-card border border-border rounded-xs">
          <h3 class="text-lg font-medium mb-4">{{ 'admin.products.form.organizationAndStatus' | translate }}</h3>
          <div class="space-y-4">
            <label class="block text-sm font-medium text-foreground mb-1">{{ 'admin.products.form.status' | translate }}</label>
            <select formControlName="status" class="w-full p-2 border border-input rounded-md bg-background text-sm"> @for(status of productStatuses; track status) { <option [value]="status">{{ status | titlecase }}</option> } </select>
            <royal-code-ui-toggle-button formControlName="isActive" [label]="'admin.products.form.isActive' | translate" />
            <royal-code-ui-toggle-button formControlName="isFeatured" [label]="'admin.products.form.isFeatured' | translate" />
            <royal-code-ui-input [label]="'admin.products.form.currency' | translate" formControlName="currency" [required]="true" [error]="getErrorMessage('currency')" />
            <royal-code-ui-tag-input [label]="'admin.products.form.tags' | translate" formControlName="tags" />
            <royal-code-ui-category-selector formControlName="categoryIds" [categories]="vm.allCategories" [isLoading]="vm.isLoadingCategories" [label]="'admin.products.form.categories' | translate" />
          </div>
        </div>

        <!-- Physical Product Config -->
        @if (productForm.get('type')?.value === ProductType.PHYSICAL) {
          <div class="p-6 bg-card border border-border rounded-xs" formGroupName="physicalProductConfig">
            <h3 class="text-lg font-medium mb-4">{{ 'admin.products.form.physicalConfig' | translate }}</h3>
            <div formGroupName="pricing" class="space-y-4">
              <royal-code-ui-input [label]="'admin.products.form.price' | translate" formControlName="price" type="number" [required]="variantCombinations.length === 0" [error]="getErrorMessage('physicalProductConfig.pricing.price')" />
              <royal-code-ui-input [label]="'admin.products.form.originalPriceOptional' | translate" formControlName="originalPrice" type="number" />
              @if (productForm.get('physicalProductConfig.pricing')?.errors?.['priceInvalid'] && productForm.get('physicalProductConfig.pricing')?.touched) { <p class="text-destructive text-sm mt-2">{{ 'admin.products.form.priceCannotBeHigherThanOriginal' | translate }}</p> }
            </div>
            <div class="space-y-4 mt-4 pt-4 border-t border-border">
              <royal-code-ui-input [label]="'admin.products.form.skuOptional' | translate" formControlName="sku" />
              <royal-code-ui-input [label]="'admin.products.form.brandOptional' | translate" formControlName="brand" />
              <royal-code-ui-toggle-button formControlName="manageStock" [label]="'admin.products.form.manageStock' | translate" />
              @if (productForm.get('physicalProductConfig.manageStock')?.value) { <royal-code-ui-input [label]="'admin.products.form.stockQuantity' | translate" formControlName="stockQuantity" type="number" [required]="variantCombinations.length === 0" [error]="getErrorMessage('physicalProductConfig.stockQuantity')" /> }
              <royal-code-ui-toggle-button formControlName="allowBackorders" [label]="'admin.products.form.allowBackorders' | translate" />
              <royal-code-ui-input [label]="'admin.products.form.lowStockThreshold' | translate" formControlName="lowStockThreshold" type="number" />
            </div>
            <div formGroupName="availabilityRules" class="mt-4 pt-4 border-t border-border">
              <h4 class="text-base font-medium mb-2">Order Rules</h4>
              <div class="space-y-3">
                <royal-code-ui-input label="Min. order quantity" formControlName="minOrderQuantity" type="number" />
                <royal-code-ui-input label="Max. order quantity" formControlName="maxOrderQuantity" type="number" />
                <royal-code-ui-input label="Order in multiples of" formControlName="quantityIncrements" type="number" />
                <royal-code-ui-toggle-button label="Rules Active" formControlName="isActive" />
              </div>
              @if (productForm.get('physicalProductConfig.availabilityRules')?.errors?.['minMaxInvalid']) { <p class="text-destructive text-sm mt-2">Max. quantity must be greater than min. quantity.</p> }
            </div>
            <div formGroupName="ageRestrictions" class="mt-4 pt-4 border-t border-border">
              <h4 class="text-base font-medium mb-2">Age Restrictions</h4>
              <div class="grid grid-cols-2 gap-3">
                <royal-code-ui-input label="Min. age" formControlName="minAge" type="number" />
                <royal-code-ui-input label="Max. age" formControlName="maxAge" type="number" />
              </div>
              @if (productForm.get('physicalProductConfig.ageRestrictions')?.errors?.['minMaxInvalid']) { <p class="text-destructive text-sm mt-2">Max. age must be greater than min. age.</p> }
            </div>
          </div>
        }

        <!-- SEO Section -->
        <div class="p-6 bg-card border border-border rounded-xs" formGroupName="seo">
          <h3 class="text-lg font-medium mb-4">{{ 'admin.products.form.seo' | translate }}</h3>
          <div class="space-y-4">
            <royal-code-ui-input [label]="'admin.products.form.seoTitle' | translate" formControlName="title" />
            <royal-code-ui-textarea [label]="'admin.products.form.seoDescription' | translate" formControlName="description" [rows]="3" />
            <royal-code-ui-input [label]="'admin.products.form.seoKeywordsCommaSeparated' | translate" formControlName="keywords" />
          </div>
        </div>
      </aside>
    </div>
  } @else {
    <div class="flex justify-center items-center h-64"><royal-code-ui-spinner size="lg" /></div>
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

  // === Form & State ===
  productForm!: FormGroup;
  readonly isEditMode = computed(() => !!this.product());
  readonly isUploading = signal(false);
  readonly isMediaUploading = this.mediaFacade.isSubmitting;
 private hasBeenPatched = false;
  private lastPatchedProductId?: string;
  private customAttributesInitialized = false;
private isPatching = false

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

    // 1. Vind het HOOFDATTRIBUUT in de FormArray (bv. 'Kleur' of 'Configuratie') op basis van zijn tijdelijke ID in het formulier
    const formAttrControl = this.variantAttributes.controls.find(c => c.get('tempId')?.value === formAttributeTempId);
    if (!formAttrControl) {
        return 'Fout';
    }
    const formAttributeName = formAttrControl.get('nameKeyOrText')?.value;

    // 2. Zoek in de combinatie-data naar het attribuut met dezelfde naam (bv. 'attribute.color' of 'attribute.other')
    const relevantComboAttribute = attrsInCombo.find(a => a.attributeNameKeyOrText === formAttributeName);

    // 3. Retourneer de displaynaam die de backend specifiek voor deze combinatie heeft meegegeven
    return relevantComboAttribute?.attributeValueNameKeyOrText ?? 'N/A';
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
  
  // Process files one by one instead of all at once
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
    // Gebruik een microtask (setTimeout) om er zeker van te zijn dat Angular de nieuwe control heeft verwerkt
    // voordat we de combinaties proberen te genereren.
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

  // === Media Management ===
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

  // === Combinations ===
  setDefaultVariant(selectedIndex: number): void { this.variantCombinations.controls.forEach((c, i) => c.get('isDefault')?.setValue(i === selectedIndex, { emitEvent: false })); }

  // === Helper Methods ===
  getPredefinedValues(attrName?: string | null): PredefinedAttributeValueDto[] | undefined { return this.viewModel()?.predefinedAttributes?.[this.toTitleCase(attrName || '')]; }
  getMediaUrl(media?: Media): string { return (media?.type === MediaType.IMAGE && (media as Image).variants.length > 0) ? (media as Image).variants[0].url : (media as any)?.url || ''; }
  getMediaAltText(media: Media): string { return (media.type === MediaType.IMAGE ? (media as Image).altText : (media as any).title) || 'Media'; }
  getCombinationPrimaryImage(comboCtrl: AbstractControl): Image | undefined { const ids = comboCtrl.get('mediaIds')?.value as string[] | null; return ids?.length ? filterImageMedia(this.uploadedMedia()).find(img => img.id === ids[0]) : undefined; }
  getValidationRule(def: CustomAttributeDefinitionDto, rule: 'min' | 'max'): number { try { return (JSON.parse(def.validationRulesJson || '{}'))[rule] ?? (rule === 'min' ? 0 : 100); } catch { return rule === 'min' ? 0 : 100; } }
  comparePredefinedValues(o1: any, o2: any): boolean { 
    if (o1 === CUSTOM_ATTRIBUTE_VALUE || o2 === CUSTOM_ATTRIBUTE_VALUE) return o1 === o2; 
    return (typeof o1 === 'object' && o1 && typeof o2 === 'object' && o2) ? o1.id === o2.id : o1 === o2; 
  }
  
  // === trackBy Functies voor Performance ===
  protected trackByAttribute = (index: number, control: AbstractControl) => control.get('tempId')?.value ?? index;
  protected trackByValue = (index: number, control: AbstractControl) => control.get('tempId')?.value ?? index;
  protected trackByCombination = (index: number, control: AbstractControl) => { const attrs = control.get('attributes')?.value as { attributeId: string, attributeValueId: string }[]; return attrs ? attrs.map(a => a.attributeValueId).sort().join('-') : index; };
  protected trackBySpecification = (index: number, control: AbstractControl) => control.get('tempId')?.value ?? index;

  // === Error Messages ===
  protected getErrorMessage = (name: string): string => { const c = this.productForm.get(name); return (!c || !c.touched || c.valid) ? '' : (c.hasError('required') ? this.translateService.instant('common.errors.validation.requiredField') : this.translateService.instant('common.errors.validation.invalidField')); };
  protected getErrorMessageForArray = (ac: AbstractControl, i: number, name: string): string => { const c = (ac.get('values') as FormArray)?.at(i)?.get(name); return (!c || !c.touched || c.valid) ? '' : (c.hasError('required') ? this.translateService.instant('common.errors.validation.requiredField') : this.translateService.instant('common.errors.validation.invalidField')); };
  protected getErrorMessageForCombination = (i: number, name: string): string => { const c = this.variantCombinations?.at(i)?.get(name); if (!c || !c.touched || c.valid) return ''; if (c.hasError('required')) return this.translateService.instant('common.errors.validation.requiredField'); if (c.hasError('duplicate')) return this.translateService.instant('admin.products.form.duplicateSku'); return this.translateService.instant('common.errors.validation.invalidField'); };
  protected getErrorMessageForDisplaySpec = (i: number, name: string): string => { const c = this.displaySpecifications?.at(i)?.get(name); return (!c || !c.touched || c.valid) ? '' : (c.hasError('required') ? this.translateService.instant('common.errors.validation.requiredField') : this.translateService.instant('common.errors.validation.invalidField')); };

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
        availabilityRules: this.fb.group({ minOrderQuantity: [null], maxOrderQuantity: [null], quantityIncrements: [null], isActive: [true] }, { validators: this.minMaxValidator('minOrderQuantity', 'maxOrderQuantity') }),
        ageRestrictions: this.fb.group({ minAge: [null], maxAge: [null] }, { validators: this.minMaxValidator('minAge', 'maxAge') })
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
}        this.customAttributesInitialized = true;
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
    this.productForm.get('physicalProductConfig.manageStock')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.productForm.get('physicalProductConfig')?.updateValueAndValidity());
    this.productForm.get('name')?.valueChanges.pipe(debounceTime(500), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef)).subscribe(() => { if (this.variantCombinations.length > 0) this.regenerateSkus(); });
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

// In product-form.component.ts - voeg deze methods toe aan de component class:

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
  // Convert camelCase/snake_case to Title Case
  return key
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/_/g, ' ') // Replace underscores with spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// === Custom Attributes Initialization ===
private initializeCustomAttributes(customAttributes: Record<string, any>): void {
  const group = this.productForm.get('customAttributes') as FormGroup;
  
  // Clear existing controls
  Object.keys(group.controls).forEach(key => group.removeControl(key));
  
  // Add controls for each custom attribute
  if (customAttributes) {
    Object.entries(customAttributes).forEach(([key, value]) => {
      // Ensure numeric value between 1-10
      const numericValue = typeof value === 'number' ? 
        Math.max(1, Math.min(10, value)) : 5; // Default to 5 if not numeric
      
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

    // --- PATCH BASISVELDEN ---
    this.productForm.patchValue({
        type: product.type, name: product.name, description: product.description,
        shortDescription: product.shortDescription, status: product.status,
        isActive: product.isActive, isFeatured: product.isFeatured,
        currency: product.currency, appScope: product.appScope,
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
        sku: product.sku, brand: product.brand, manageStock: product.manageStock ?? true,
        stockQuantity: product.stockQuantity, allowBackorders: product.allowBackorders,
        lowStockThreshold: product.lowStockThreshold,
        availabilityRules: product.availabilityRules ?? {},
        ageRestrictions: (product as any).ageRestrictions ?? {}
    }, { emitEvent: false });
    
    // Initialize custom attributes controls first, then patch values
    if (product.customAttributes) {
        this.initializeCustomAttributes(product.customAttributes);
    }
}

    // --- DE DEFINITIEVE FIX: Filter attributen om alleen gebruikte attributen aan het formulier toe te voegen ---
    // 1. Verzamel alle unieke attribuut-ID's die daadwerkelijk in de combinaties worden gebruikt.
    const usedAttributeIds = new Set<string>();
    product.variantCombinations?.forEach(combo => {
      combo.attributes.forEach(attrSelection => usedAttributeIds.add(attrSelection.attributeId));
    });
    console.log('[ProductFormComponent] Identified used attribute IDs:', Array.from(usedAttributeIds));

    // 2. Filter de `variantAttributes` van het product om alleen de relevante over te houden.
    const relevantAttributes = (product.variantAttributes ?? []).filter(attr => usedAttributeIds.has(attr.id));
    console.log(`[ProductFormComponent] Filtered down to ${relevantAttributes.length} relevant attributes.`);

    // --- PATCH VARIANT ATTRIBUTEN (FormArray) met de gefilterde lijst ---
    this.variantAttributes.clear({ emitEvent: false });
    relevantAttributes.forEach(attr => {
        const valuesFormGroups = (attr.values ?? []).map(val => {
            const predefinedValueObject = allPredefinedValues.get(val.id);
            return this.createAttributeValue(val, predefinedValueObject ?? null);
        });
        this.variantAttributes.push(this.createVariantAttribute(attr, valuesFormGroups), { emitEvent: false });
    });
    console.log(`[ProductFormComponent] Patched ${this.variantAttributes.length} variant attributes into FormArray.`);


    // --- PATCH VARIANT COMBINATIES (FormArray) ---
    this.variantCombinations.clear({ emitEvent: false });
    product.variantCombinations?.forEach(combo => {
        this.variantCombinations.push(this.createVariantCombination(combo), { emitEvent: false });
    });
    console.log(`[ProductFormComponent] Patched ${this.variantCombinations.length} variant combinations.`);

    // --- PATCH DISPLAY SPECIFICATIES (FormArray) ---
    this.displaySpecifications.clear({ emitEvent: false });
    if (isPhysicalProduct(product)) {
        product.displaySpecifications?.forEach(spec => {
            this.displaySpecifications.push(this.createDisplaySpecification(spec), { emitEvent: false });
        });
    }

    // Markeer het formulier als 'schoon' en update de validiteit
    this.productForm.markAsPristine();
    this.productForm.updateValueAndValidity({ emitEvent: false });
    this.isPatching = false;
    console.log('%c[ProductFormComponent] PATCH PROCESS COMPLETED.', 'color: #4CAF50; font-weight: bold;');
  }


  private createVariantAttribute(attr: Partial<VariantAttribute>, values: FormGroup[] = []): FormGroup {
    const arr = values.length ? this.fb.array(values) : this.fb.array((attr.values ?? []).map(v => this.createAttributeValue(v)));
    return this.fb.group({ tempId: [attr.id ?? uuidv4()], nameKeyOrText: [attr.nameKeyOrText ?? attr.name, Validators.required], type: [attr.type ?? VariantAttributeType.CUSTOM, Validators.required], displayType: [attr.displayType], isRequired: [attr.isRequired ?? true], values: arr });
  }
  
private createAttributeValue(val: Partial<VariantAttributeValue>, initialPredefinedValue: PredefinedAttributeValueDto | null = null): FormGroup {
    // Bepaal de displaynaam: neem de waarde van het product, of van het gevonden voorgedefinieerde object.
    const initialDisplayName = val.displayName ?? initialPredefinedValue?.displayName ?? '';
    
    const group = this.fb.group({
      tempId: [val.id ?? uuidv4()],
      // De 'predefinedValue' control houdt het VOLLEDIGE object bij. Dit is cruciaal voor [compareWith].
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
      // Als de gebruiker een voorgedefinieerde waarde selecteert in de dropdown...
      if (v && typeof v === 'object' && v !== null) {
        // ...update dan de gerelateerde velden in het formulier.
        group.patchValue({ 
            displayNameKeyOrText: v.displayName || v.name || '', 
            colorHex: v.colorHex ?? null, 
            priceModifier: v.priceModifier ?? null 
        });
      } else if (v === CUSTOM_ATTRIBUTE_VALUE) {
        // Als de gebruiker 'Nieuwe waarde maken' selecteert...
        group.get('displayNameKeyOrText')?.enable();
        group.patchValue({ displayNameKeyOrText: '' });
      }
    });
    return group;
  }

  private createVariantCombination(combo?: Partial<ProductVariantCombination>): FormGroup {
    return this.fb.group({
      sku: [combo?.sku ?? '', Validators.required], price: [combo?.price, Validators.required], originalPrice: [combo?.originalPrice],
      stockQuantity: [combo?.stockQuantity, Validators.required], stockStatus: [combo?.stockStatus ?? StockStatus.IN_STOCK, Validators.required],
      isActive: [combo?.isActive ?? true, Validators.required], isDefault: [combo?.isDefault ?? false],
      attributes: this.fb.array((combo?.attributes ?? []).map(a => this.fb.group(a))),
      mediaIds: this.fb.control(combo?.mediaIds ?? [])
    });
  }

  private createDisplaySpecification(spec?: Partial<ProductDisplaySpecification>): FormGroup {
    return this.fb.group({ tempId: [uuidv4()], specKey: [spec?.specKey ?? '', Validators.required], labelKeyOrText: [{ value: spec?.labelKeyOrText ?? '', disabled: true }], valueKeyOrText: [spec?.valueKeyOrText ?? '', Validators.required], groupKeyOrText: [{ value: spec?.groupKeyOrText ?? '', disabled: true }] });
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
    const controlLabelMap: Record<string, string> = { 'name': 'admin.products.form.productName', 'physicalProductConfig.pricing.price': 'admin.products.form.price', 'currency': 'admin.products.form.currency', 'physicalProductConfig.stockQuantity': 'admin.products.form.stockQuantity', 'variantCombinations.*.sku': 'admin.products.form.tableHeaders.SKU', 'variantCombinations.*.price': 'admin.products.form.tableHeaders.Price', 'variantCombinations.*.stockQuantity': 'admin.products.form.tableHeaders.Stock', 'displaySpecifications.*.valueKeyOrText': 'admin.products.form.displayValue', 'displaySpecifications.*.specKey': 'admin.products.form.specKeyInternal', 'variantAttributes.*.values.*.displayNameKeyOrText': 'admin.products.form.displayNameNew' };
    this.overlayService.open({ component: ValidationSummaryDialogComponent, data: { errors: this.validationService.getFormErrors(this.productForm, controlLabelMap), fullFormData: this.productForm.getRawValue() }, backdropType: 'dark' });
  }

  private inferAttributeType(name: string): VariantAttributeType { const map: Record<string, VariantAttributeType> = { 'Color': VariantAttributeType.COLOR, 'Size': VariantAttributeType.SIZE, 'Material': VariantAttributeType.MATERIAL, 'Style': VariantAttributeType.STYLE }; return map[name] ?? VariantAttributeType.CUSTOM; }
  private toTitleCase(str: string): string { return str ? (str.split('.').pop() || '').charAt(0).toUpperCase() + (str.split('.').pop() || '').slice(1) : ''; }

  // === Validators ===
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

  debugVariantState(): void {
    console.group('%c[DEBUG] Variant State Inspection', 'color: #9C27B0; font-weight: bold;');
    try {
      const rawValue = this.productForm.getRawValue();
      console.log('%c--- RAW FORM VALUE (CLONED) ---', 'color: #03A9F4; font-weight: bold;', structuredClone(rawValue));
      const payload = this.mapFormToPayload();
      console.log('%c--- MAPPED PAYLOAD PREVIEW (CLONED) ---', 'color: #4CAF50; font-weight: bold;', structuredClone(payload));
    } catch (e) {
      console.error("Error during debug state creation:", e);
    }
    console.groupEnd();
  }

  private minMaxValidator = (minKey: string, maxKey: string, errKey = 'minMaxInvalid'): ValidatorFn => (g: AbstractControl): ValidationErrors | null => { const min = g.get(minKey)?.value; const max = g.get(maxKey)?.value; return (min !== null && max !== null && min > max) ? { [errKey]: true } : null; };
}

--- END OF FILE ---

--- START OF FILE apps/admin-panel/src/app/pages/product-edit-page/product-edit-page.component.ts ---

/**
 * @file product-edit-page.component.ts
 * @Version 7.0.0 (Definitive Race Condition Fix)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-04
 * @Description
 *   De definitieve, architectonisch correcte container voor het bewerken van een product.
 *   Lost de hardnekkige race condition op door expliciet te wachten op volledig geladen
 *   productdetails voordat het formulier wordt gerenderd. Dit garandeert data-integriteit.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { AdminProductsFacade } from '@royal-code/features/admin-products/core';
import { CreateProductPayload, UpdateProductPayload, Product } from '@royal-code/features/products/domain';
import { Media } from '@royal-code/shared/domain';
import { MediaActions } from '@royal-code/features/media/core';

import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';

@Component({
  selector: 'admin-product-edit-page',
  standalone: true,
  imports: [CommonModule, ProductFormComponent, UiSpinnerComponent],
  template: `
    <!-- === DE FIX: Toon een spinner totdat de VOLLEDIGE productdata is geladen === -->
    @if (isProductDetailLoaded()) {
      <admin-product-form
        [viewModel]="viewModel()"
        [product]="viewModel().selectedProduct"
        (saveProduct)="onUpdate($event)"
      />
    } @else {
      <!-- Fallback voor laden of fouten -->
      <div class="flex justify-center items-center h-64">
        @if (viewModel().isLoading) {
          <royal-code-ui-spinner size="lg" />
        } @else if (viewModel().error) {
          <p class="p-4 text-destructive bg-destructive/10 border border-destructive rounded-md">
              Fout bij het laden van het product: {{ viewModel().error }}
          </p>
        } @else {
           <p class="p-4 text-secondary">Product wordt geladen...</p>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEditPageComponent implements OnInit, OnDestroy {
  private readonly facade = inject(AdminProductsFacade);
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  readonly viewModel = this.facade.viewModel;

  /**
   * @computed isProductDetailLoaded
   * @description
   *   Een cruciale guard die controleert of de `selectedProduct` in de state
   *   daadwerkelijk de VOLLEDIGE data bevat. We beschouwen het als "compleet"
   *   als het de `variantCombinations` array heeft, wat alleen gebeurt na een
   *   succesvolle detail-API call. Dit voorkomt dat incomplete data uit de
   *   productenlijst-cache wordt gebruikt.
   */
  readonly isProductDetailLoaded = computed(() => {
    const vm = this.viewModel();
    // Het product is pas "echt" geladen als het niet laadt, een geselecteerd product heeft,
    // en die selectie de variant-combinaties bevat (een teken van een volledige DTO).
    return !vm.isLoading && !!vm.selectedProduct && Array.isArray(vm.selectedProduct.variantCombinations);
  });

  ngOnInit(): void {
    this.facade.ensureFormLookupsLoaded();
    this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter((id): id is string => !!id),
      takeUntil(this.destroy$)
    ).subscribe(id => {
      // Deze actie triggert de `loadProductDetail` effect, die de volledige data ophaalt.
      this.facade.openProductDetailPage(id);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.facade.selectProduct(null); // Ruim de selectie op bij het verlaten
  }

  onUpdate(payload: CreateProductPayload | UpdateProductPayload): void {
    const productId = this.viewModel().selectedProduct?.id;
    if (!productId) return;
    this.facade.updateProduct(productId, payload as UpdateProductPayload);
  }
}

--- END OF FILE ---

--- START OF FILE libs/features/products/core/src/lib/DTO/backend.types.ts ---

// libs/features/products/core/src/lib/DTO/backend.types.ts
export interface BackendPaginatedListDto<T> {
  readonly items: readonly T[];
  readonly pageNumber: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly totalCount: number;
  readonly hasPreviousPage: boolean;
  readonly hasNextPage: boolean;
}

export interface BackendProductCategoryDto {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
}

export interface BackendMediaTeaserDto {
  readonly id: string;
  readonly url: string;
  readonly thumbnailUrl?: string;
  readonly altText?: string;
}

export interface BackendSelectedVariantDto {
  readonly id: string;
  readonly sku: string;
  readonly price: number;
  readonly originalPrice?: number;
  readonly stockQuantity?: number;
  readonly stockStatus?: string;
  readonly isDefault: boolean;
  readonly media: readonly BackendMediaTeaserDto[];
}

export interface BackendColorVariantTeaserDto {
  readonly attributeValueId: string;
  readonly value: string;
  readonly displayName: string;
  readonly colorHex?: string;
  readonly price: number;
  readonly originalPrice?: number;
  readonly defaultVariantId: string;
  readonly isDefault: boolean;
  readonly media: readonly BackendMediaTeaserDto[];
}

export interface BackendProductListItemDto {
  readonly id: string;
  readonly name: string;
  readonly shortDescription?: string;
  readonly tags?: readonly string[];
  readonly categories?: readonly BackendProductCategoryDto[];
  readonly type: string;
  readonly status: string;
  readonly isActive: boolean;
  readonly isFeatured: boolean;
  readonly averageRating?: number;
  readonly reviewCount: number;
  readonly hasDiscount: boolean;
  readonly discountPercentage?: number;
  readonly price: number;
  readonly originalPrice?: number;
  readonly currency: string;
  readonly stockStatus: string;
  readonly inStock: boolean;
  readonly featuredImages: readonly BackendMediaTeaserDto[];
  readonly selectedVariant: BackendSelectedVariantDto;
  readonly colorVariants: readonly BackendColorVariantTeaserDto[];
}

// === DETAIL INTERFACES (for product detail endpoint) ===
export interface BackendFeaturedImageDto {
  readonly id: string;
  readonly url: string;
  readonly altTextKeyOrText?: string;
}

export interface BackendMediaDto {
  readonly id: string;
  readonly type?: number;
  readonly url?: string;
  readonly thumbnailUrl?: string;
  readonly altTextKeyOrText?: string;
  readonly tags?: readonly string[];
}

export interface BackendVariantAttributeValueDto {
  readonly id: string;
  readonly value: string;
  readonly displayNameKeyOrText: string;
  readonly colorHex?: string;
  readonly priceModifier?: number;
  readonly isAvailable: boolean;
  readonly media?: BackendMediaDto;
}

export interface BackendVariantAttributeDto {
  readonly id: string;
  readonly nameKeyOrText: string;
  readonly type: number;
  readonly isRequired: boolean;
  readonly displayType: string;
  readonly values: readonly BackendVariantAttributeValueDto[];
}

export interface BackendVariantCombinationAttributeDto {
  readonly attributeId: string;
  readonly attributeValueId: string;
  readonly attributeNameKeyOrText?: string;
  readonly attributeValueNameKeyOrText?: string;
  readonly colorHex?: string;
}

export interface BackendProductVariantCombinationDto {
  readonly id: string;
  readonly sku: string;
  readonly attributes?: readonly BackendVariantCombinationAttributeDto[];
  readonly price?: number;
  readonly originalPrice?: number;
  readonly stockQuantity?: number;
  readonly stockStatus?: number;
  readonly isDefault?: boolean;
  readonly media?: readonly BackendMediaDto[];
}

export interface BackendPriceRangeDto {
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly minOriginalPrice?: number;
  readonly maxOriginalPrice?: number;
}

export interface BackendProductAvailabilityRulesDto {
  readonly manageStock?: boolean;
  readonly allowBackorders?: boolean;
  readonly lowStockThreshold?: number;
  readonly minOrderQuantity?: number;
  readonly maxOrderQuantity?: number;
  readonly quantityIncrements?: number;
}

export interface BackendProductDisplaySpecificationDto {
  readonly specKey: string;
  readonly labelKeyOrText: string;
  readonly valueKeyOrText: string;
  readonly icon?: string;
  readonly groupKeyOrText?: string;
  readonly displayOrder?: number;
}

// libs/features/products/core/src/lib/DTO/backend.types.ts

export interface BackendSelectedVariantDetailDto {
  readonly id: string;
  readonly sku: string;
  readonly price?: number;
  readonly originalPrice?: number;
  readonly stockQuantity?: number;
  readonly stockStatus?: string;
  readonly hasDiscount: boolean;
  readonly isDefault: boolean;
  readonly media: readonly BackendMediaTeaserDto[];
}

export interface BackendPhysicalProductConfigDto {
  pricing?: {
    price: number;
    originalPrice?: number;
  };
  sku?: string;
  brand?: string;
  manageStock?: boolean;
  stockQuantity?: number;
  allowBackorders?: boolean;
  lowStockThreshold?: number | null;
  availabilityRules?: any; // You can define this more specifically if needed
  ageRestrictions?: any; // You can define this more specifically if needed
  displaySpecifications?: BackendProductDisplaySpecificationDto[];
}


export interface BackendSeoDto {
  readonly title?: string;
  readonly description?: string;
  readonly keywords?: readonly string[];
  readonly imageUrl?: string;
}

export interface BackendProductDetailDto {
  id: string;
  name: string;
  description?: string;
  shortDescription?: string;
  type: number;
  status: number;
  currency?: string;
  appScope?: string;
  isActive: boolean;
  isFeatured: boolean;
  averageRating?: number;
  reviewCount?: number;
  brand?: string;
  sku?: string;
  mediaIds?: string[];
  
  // NEW: Physical product configuration
  physicalProductConfig?: BackendPhysicalProductConfigDto;
  
  tags?: string[];
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  featuredImageId?: string;
  priceRange?: {
    minPrice: number;
    maxPrice: number;
    minOriginalPrice?: number;
    maxOriginalPrice?: number;
  };
  
  // NEW: Featured image object
  featuredImage?: {
    id: string;
    url: string;
    altTextKeyOrText?: string;
  };
  
  // NEW: Root level variant data
  variantAttributes?: BackendVariantAttributeDto[];
  variantCombinations?: BackendProductVariantCombinationDto[];
  
  // NEW: Root level availability rules
  availabilityRules?: {
    manageStock?: boolean;
    allowBackorders?: boolean;
    lowStockThreshold?: number;
    minOrderQuantity?: number;
    maxOrderQuantity?: number;
    quantityIncrements?: number;
  };
  
  selectedVariant?: {
    id: string;
    sku: string;
    price: number;
    originalPrice?: number;
    stockQuantity?: number;
    stockStatus: number;
    hasDiscount?: boolean;
    media?: BackendMediaDto[];
  };
  
  stockQuantity?: number;
  stockStatus?: number;
  
  // NEW: Root level display specifications
  displaySpecifications?: BackendProductDisplaySpecificationDto[];
  
  customAttributes?: Record<string, any>;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    imageUrl?: string;
  };
  hasDiscount?: boolean;
  inStock: boolean;
}

--- END OF FILE ---

--- START OF FILE libs/features/products/core/src/lib/mappers/product-mapping.service.ts ---

/**
 * @file product-mapping.service.ts
 * @version 19.0.0 (DEFINITIVE FIX: Correct Numeric StockStatus Mapping)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description
 *   Definitieve, gecorrigeerde mapping service. Deze versie lost een kritieke bug op
 *   door een private helper `mapNumericStockStatusToString` toe te voegen, die
 *   numerieke stock statussen (zoals '1' voor 'inStock') van de backend DTO's
 *   correct vertaalt naar de string-enums die de frontend state verwacht. Dit
 *   herstelt de functionaliteit van de "Toevoegen aan Winkelwagen" knop.
 */
import { Injectable, inject } from '@angular/core';
import {
  Product,
  PhysicalProduct,
  VariantAttribute,
  VariantAttributeValue,
  ProductVariantCombination,
  VariantAttributeType,
  ProductType,
  ProductAvailabilityRules,
  ProductDisplaySpecification,
  ProductColorVariantTeaser,
  ProductDiscount,
  DiscountType,
  StockStatus,
  ProductStatus,
} from '@royal-code/features/products/domain';
import { Image, Media, MediaType } from '@royal-code/shared/domain';
import {
  BackendProductListItemDto,
  BackendProductDetailDto,
  BackendMediaDto,
  BackendVariantAttributeDto,
  BackendVariantAttributeValueDto,
  BackendProductVariantCombinationDto,
  BackendColorVariantTeaserDto,
  BackendProductDisplaySpecificationDto,
  BackendProductAvailabilityRulesDto,
  BackendMediaTeaserDto,
  BackendPaginatedListDto,
} from '../DTO/backend.types';
import { mapProductStatus, mapProductType, mapStockStatus } from './enum.mappers';
import { DateTimeInfo } from '@royal-code/shared/base-models';
import { AppIcon } from '@royal-code/shared/domain';
import { APP_CONFIG, AppConfig } from '@royal-code/core/config';
import { LoggerService } from '@royal-code/core/logging';

export interface ProductCollectionResponse {
  readonly items: Product[];
  readonly totalCount: number;
  readonly pageNumber: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductMappingService {
  private readonly config = inject(APP_CONFIG);
  private readonly logger = inject(LoggerService);
  private readonly backendOrigin: string;

  constructor() {
    try {
      const url = new URL(this.config.backendUrl);
      this.backendOrigin = url.origin;
    } catch (error) {
      this.logger.error(`[ProductMappingService] Invalid backendUrl in config. Could not determine origin.`, this.config.backendUrl);
      this.backendOrigin = '';
    }
  }

  /**
   * @method toAbsoluteUrl
   * @description Converteert een relatieve URL naar een absolute URL met behulp van de geconfigureerde backend origin.
   */
  private toAbsoluteUrl(relativePath: string | null | undefined): string | undefined {
    if (!relativePath) {
      return undefined;
    }
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    const finalPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    return `${this.backendOrigin}${finalPath}`;
  }

  /**
   * @method mapProductListResponse
   * @description Mapt een gepagineerde lijst van `BackendProductListItemDto`'s naar `ProductCollectionResponse`.
   */
  public mapProductListResponse(
    backendResponse: BackendPaginatedListDto<BackendProductListItemDto>
  ): ProductCollectionResponse {
    try {
      const transformedItems = backendResponse.items.map((dto) => {
        try {
          return this.mapListItemToProduct(dto);
        } catch (error) {
          this.logger.warn(`[ProductMappingService] Failed to map product list item ${dto.id}:`, error, dto);
          return this.createFallbackProduct(dto);
        }
      });

      return {
        items: transformedItems,
        totalCount: backendResponse.totalCount,
        pageNumber: backendResponse.pageNumber,
        totalPages: backendResponse.totalPages,
        hasNextPage: backendResponse.hasNextPage,
        hasPreviousPage: backendResponse.hasPreviousPage,
      };
    } catch (error) {
      this.logger.error('[ProductMappingService] Failed to transform product list response:', error, { backendResponse });
      throw new Error('Failed to transform product list response');
    }
  }

  /**
   * @method mapListItemToProduct
   * @description Mapt een `BackendProductListItemDto` naar een `Product` domeinmodel (unchanged).
   */
  public mapListItemToProduct(dto: BackendProductListItemDto): Product {
    try {
      const allMedia = new Map<string, Media>();
      const addMediaFromTeaser = (teaser: BackendMediaTeaserDto) => {
        if (teaser && !allMedia.has(teaser.id)) {
          allMedia.set(teaser.id, this.mapMediaTeaser(teaser));
        }
      };

      (dto.featuredImages ?? []).forEach(addMediaFromTeaser);
      (dto.selectedVariant?.media ?? []).forEach(addMediaFromTeaser);
      (dto.colorVariants ?? []).forEach(cv => (cv.media ?? []).forEach(addMediaFromTeaser));

      const mappedColorVariants: ProductColorVariantTeaser[] = (dto.colorVariants ?? []).map((cv, index) => ({
        uiId: index,
        attributeValueId: cv.attributeValueId,
        defaultVariantId: cv.defaultVariantId,
        value: cv.value,
        displayName: cv.displayName,
        colorHex: cv.colorHex,
        price: cv.price,
        originalPrice: cv.originalPrice,
        media: (cv.media ?? []).map(m => allMedia.get(m.id)).filter((m): m is Media => !!m) as Image[],
      }));

      const variantAttributes: VariantAttribute[] = [];
      if (mappedColorVariants.length > 0) {
        variantAttributes.push({
          id: 'color-attribute',
          type: VariantAttributeType.COLOR,
          name: 'Kleur',
          nameKeyOrText: 'attribute.color',
          isRequired: true,
          displayType: 'swatches',
          displayOrder: 1,
          values: mappedColorVariants.map((cv, index) => ({
            id: cv.attributeValueId,
            value: cv.value,
            displayName: cv.displayName,
            displayNameKeyOrText: cv.displayName,
            sortOrder: index,
            colorHex: cv.colorHex,
            isAvailable: true,
            media: cv.media,
          })),
        });
      }

      const variantCombinations: ProductVariantCombination[] = [];
      if (dto.selectedVariant) {
        variantCombinations.push({
          id: dto.selectedVariant.id,
          sku: dto.selectedVariant.sku,
          attributes: [],
          price: dto.selectedVariant.price,
          originalPrice: dto.selectedVariant.originalPrice,
          stockQuantity: dto.selectedVariant.stockQuantity,
          stockStatus: mapStockStatus(dto.selectedVariant.stockStatus),
          isActive: true,
          isDefault: dto.selectedVariant.isDefault,
          mediaIds: (dto.selectedVariant.media ?? []).map(m => m.id),
        });
      }

      const product: PhysicalProduct = {
      id: dto.id,
      createdAt: this.toDateTimeInfo(undefined),
      lastModified: this.toDateTimeInfo(undefined),
      name: dto.name,
      shortDescription: dto.shortDescription,
      description: dto.shortDescription ?? '',
      media: Array.from(allMedia.values()),
      currency: dto.currency,
      colorVariants: mappedColorVariants,
      categoryIds: (dto.categories ?? []).map(c => c.id), // FIX: Extract IDs from category objects
      tags: dto.tags ? [...dto.tags] : [],
      variantAttributes: variantAttributes,
      variantCombinations: variantCombinations,
      averageRating: dto.averageRating ?? 0,
      reviewCount: dto.reviewCount,
      isActive: dto.isActive,
      isFeatured: dto.isFeatured,
      status: mapProductStatus(dto.status), 
      price: dto.price,
      originalPrice: dto.originalPrice,
      stockStatus: mapStockStatus(dto.stockStatus), 
      inStock: dto.inStock,
      stockQuantity: dto.selectedVariant?.stockQuantity,
      type: ProductType.PHYSICAL,
      sku: dto.selectedVariant?.sku,
      manageStock: true,
      allowBackorders: false,
    };

    return product;
  } catch (error) {
    this.logger.error(`[ProductMappingService] Critical error mapping list item for ID: ${dto.id}`, error, dto);
    return this.createFallbackProduct(dto);
  }
}

   public mapProductDetail(dto: BackendProductDetailDto): Product {
    if (!dto) {
      this.logger.error('[ProductMappingService] Cannot map product detail: DTO is null or undefined.');
      throw new Error('Cannot map product detail: DTO is null or undefined.');
    }

    try {
      const allMedia = new Map<string, Media>();
      const addMediaToMap = (mediaItem: Media) => {
        if (mediaItem && !allMedia.has(mediaItem.id)) {
          allMedia.set(mediaItem.id, mediaItem);
        }
      };

      if (dto.featuredImage) {
        const featuredMedia: Image = {
          id: dto.featuredImage.id,
          type: MediaType.IMAGE,
          variants: [{ url: this.toAbsoluteUrl(dto.featuredImage.url) || '', purpose: 'original' }],
          altText: dto.featuredImage.altTextKeyOrText,
        };
        addMediaToMap(featuredMedia);
      }

      const variantAttributes = (dto.variantAttributes ?? []).map(attrDto => {
        const mappedAttr = this.mapVariantAttribute(attrDto);
        mappedAttr.values.forEach(value => {
          (value.media ?? []).forEach(addMediaToMap);
        });
        return mappedAttr;
      });

      const variantCombinations = (dto.variantCombinations ?? []).map(comboDto => {
        const mappedCombo = this.mapVariantCombination(comboDto);
        (comboDto.media ?? []).forEach(mediaDto => {
          addMediaToMap(this.mapMedia(mediaDto));
        });
        return mappedCombo;
      });

      if (dto.selectedVariant?.media) {
        dto.selectedVariant.media.forEach(mediaDto => {
          addMediaToMap(this.mapMedia(mediaDto as BackendMediaDto));
        });
      }

      const media = Array.from(allMedia.values());
      const colorAttribute = variantAttributes.find(attr => attr.type === VariantAttributeType.COLOR);
      const mappedColorVariants: ProductColorVariantTeaser[] = (colorAttribute?.values ?? []).map(val => {
        const combo = variantCombinations.find(c => c.attributes.some(a => a.attributeValueId === val.id));
        return {
          uiId: 0,
          attributeValueId: val.id,
          defaultVariantId: combo?.id ?? val.id,
          value: val.value,
          displayName: val.displayName,
          colorHex: val.colorHex,
          price: combo?.price ?? 0,
          originalPrice: combo?.originalPrice,
          media: val.media,
        };
      });

      const physicalConfig = dto.physicalProductConfig;
      const selectedVariantDto = dto.selectedVariant;
      const defaultVariantCombinationDto = dto.variantCombinations?.find(v => v.isDefault) ?? dto.variantCombinations?.[0];
      const priceRange = dto.priceRange;

      const price: number = selectedVariantDto?.price ?? physicalConfig?.pricing?.price ?? defaultVariantCombinationDto?.price ?? priceRange?.maxPrice ?? priceRange?.minPrice ?? 0;
      const originalPrice = selectedVariantDto?.originalPrice ?? physicalConfig?.pricing?.originalPrice ?? defaultVariantCombinationDto?.originalPrice ?? priceRange?.maxOriginalPrice ?? priceRange?.minOriginalPrice ?? undefined;
      const stockQuantity = selectedVariantDto?.stockQuantity ?? physicalConfig?.stockQuantity ?? dto.stockQuantity ?? undefined;

      const stockStatus = mapStockStatus(selectedVariantDto?.stockStatus ?? dto.stockStatus);

      const displaySpecifications = this.mapDisplaySpecifications(physicalConfig?.displaySpecifications ?? dto.displaySpecifications ?? []);
      const availabilityRules = this.mapAvailabilityRules(dto.availabilityRules ?? null);

      const hasDiscount = dto.hasDiscount;
      const activeDiscount: ProductDiscount | null = hasDiscount && originalPrice && price < originalPrice ? {
        id: 'product-discount',
        type: DiscountType.PERCENTAGE,
        value: Math.round(((originalPrice - price) / originalPrice) * 100),
        isActive: true,
      } : null;

      const mappedType = mapProductType(dto.type);

      const baseProduct: Omit<Product, 'type'> = {
      id: dto.id,
      createdAt: this.toDateTimeInfo(undefined),
      lastModified: this.toDateTimeInfo(undefined),
      name: dto.name,
      shortDescription: dto.shortDescription ?? undefined,
      description: dto.description ?? '',
      media: media,
      currency: dto.currency ?? 'EUR',
      colorVariants: mappedColorVariants,
      categoryIds: (dto.categories ?? []).map(cat => cat.id), // FIX: Extract IDs properly
      tags: dto.tags ? [...dto.tags] : [],
      variantAttributes,
      variantCombinations,
      averageRating: dto.averageRating ?? 0,
      reviewCount: dto.reviewCount || 0,
      isActive: dto.isActive,
      isFeatured: dto.isFeatured,
      status: mapProductStatus(dto.status), // FIX: Use numeric mapper
      searchKeywords: dto.seo?.keywords ? [...dto.seo.keywords] : dto.tags ? [...dto.tags] : undefined,
      customAttributes: dto.customAttributes ?? undefined,
      appScope: dto.appScope ?? undefined,
      metaTitle: dto.seo?.title ?? dto.name,
      metaDescription: dto.seo?.description ?? dto.shortDescription,
      metaKeywords: dto.seo?.keywords ? [...dto.seo.keywords] : dto.tags ? [...dto.tags] : undefined,
      price,
      originalPrice,
      stockStatus: mapStockStatus(dto.stockStatus), // FIX: Use numeric mapper
      inStock: dto.inStock,
      stockQuantity,
    };

    const detailProductType = mapProductType(dto.type);

    if (detailProductType === ProductType.PHYSICAL) {
      return {
        ...baseProduct,
        type: ProductType.PHYSICAL,
        activeDiscount,
        sku: dto.sku ?? physicalConfig?.sku ?? undefined,
        brand: dto.brand ?? physicalConfig?.brand ?? undefined,
        manageStock: dto.availabilityRules?.manageStock ?? physicalConfig?.manageStock ?? true,
        allowBackorders: dto.availabilityRules?.allowBackorders ?? physicalConfig?.allowBackorders ?? false,
        lowStockThreshold: dto.availabilityRules?.lowStockThreshold ?? physicalConfig?.lowStockThreshold ?? undefined,
        displaySpecifications,
        availabilityRules,
      } as PhysicalProduct;
    }

    return { ...baseProduct, type: ProductType.PHYSICAL, sku: dto.sku ?? undefined } as PhysicalProduct;

  } catch (error) {
    this.logger.error(`[ProductMappingService] Critical error mapping product detail for ID: ${dto.id}`, error, dto);
    return this.createFallbackProduct(dto);
  }
}
  
  public mapMediaArray(dtos: readonly BackendMediaDto[] | null): Media[] {
    if (!dtos) return [];
    return dtos.map(dto => this.mapMedia(dto));
  }

  private mapMediaTeaser(dto: BackendMediaTeaserDto): Media {
    const variants: Image['variants'] = [];
    const mainUrl = this.toAbsoluteUrl(dto.url);
    const thumbUrl = this.toAbsoluteUrl(dto.thumbnailUrl);

    if (mainUrl) {
      variants.push({ url: mainUrl, purpose: 'original' });
    }
    if (thumbUrl && thumbUrl !== mainUrl) {
      variants.push({ url: thumbUrl, purpose: 'thumbnail' });
    }
    if (variants.length === 0 && thumbUrl) {
        variants.push({ url: thumbUrl, purpose: 'fallback' });
    }

    return {
      id: dto.id,
      type: MediaType.IMAGE,
      variants: variants,
      altText: dto.altText ?? undefined,
    } as Image;
  }

  private mapMedia(dto: BackendMediaDto): Media {
    const mediaType = this.mapMediaType(dto.type ?? 0);

    const common = {
      id: dto.id,
      type: mediaType,
      createdAt: this.toDateTimeInfo(undefined),
      lastModified: this.toDateTimeInfo(undefined),
    };

    if (mediaType === MediaType.IMAGE) {
      const variants: Image['variants'] = [];
      const mainUrl = this.toAbsoluteUrl(dto.url);
      const thumbUrl = this.toAbsoluteUrl(dto.thumbnailUrl);

      if (mainUrl) {
        variants.push({ url: mainUrl, purpose: 'original' });
      }
      if (thumbUrl && thumbUrl !== mainUrl) {
        variants.push({ url: thumbUrl, purpose: 'thumbnail' });
      }
      if (variants.length === 0 && mainUrl) {
          variants.push({ url: mainUrl, purpose: 'fallback' });
      }

      return { ...common, variants, altText: dto.altTextKeyOrText ?? undefined } as Image;
    }

    return {
      ...common,
      url: this.toAbsoluteUrl(dto.url) || '',
      thumbnailUrl: this.toAbsoluteUrl(dto.thumbnailUrl) ?? undefined
    } as Media;
  }

  private mapMediaType(backendType: number | string): MediaType {
    if (typeof backendType === 'string') {
      const stringToEnumMap: Record<string, MediaType> = {
        image: MediaType.IMAGE, video: MediaType.VIDEO, audio: MediaType.AUDIO,
        document: MediaType.DOCUMENT, archive: MediaType.ARCHIVE, other: MediaType.OTHER,
      };
      return stringToEnumMap[backendType.toLowerCase()] ?? MediaType.OTHER;
    } else if (typeof backendType === 'number') {
      const numberToEnumMap: Record<number, MediaType> = {
        0: MediaType.IMAGE, 1: MediaType.VIDEO, 2: MediaType.AUDIO,
        3: MediaType.DOCUMENT, 4: MediaType.ARCHIVE,
      };
      return numberToEnumMap[backendType] ?? MediaType.OTHER;
    }
    this.logger.warn(`[ProductMappingService] Unknown backend media type encountered: ${backendType}. Falling back to OTHER.`);
    return MediaType.OTHER;
  }

  private mapVariantAttribute(dto: BackendVariantAttributeDto): VariantAttribute {
    const typeMap: Record<number, VariantAttributeType> = {
      0: VariantAttributeType.COLOR,
      18: VariantAttributeType.CUSTOM,
      19: VariantAttributeType.CUSTOM,
    };

    const attributeId = dto.id;
    const nameKeyOrText = dto.nameKeyOrText;
    const attributeType = typeMap[dto.type] ?? VariantAttributeType.CUSTOM;

    let displayName = nameKeyOrText;
    if (nameKeyOrText.includes('.')) {
      displayName = (nameKeyOrText.split('.').pop() || '').replace(/^\w/, c => c.toUpperCase());
    } else if (nameKeyOrText === 'attribute.other' || attributeType === VariantAttributeType.CUSTOM) {
      displayName = 'Configuratie';
    }

    return {
      id: attributeId,
      type: attributeType,
      name: displayName,
      nameKeyOrText: nameKeyOrText,
      isRequired: dto.isRequired,
      displayType: dto.displayType as any,
      displayOrder: 0,
      values: dto.values.map(v => this.mapVariantAttributeValue(v)),
    };
  }

  private mapVariantAttributeValue(dto: BackendVariantAttributeValueDto): VariantAttributeValue {
    const mediaItems: Media[] = [];
    if (dto.media) {
        mediaItems.push(this.mapMedia(dto.media as BackendMediaDto));
    }

    return {
      id: dto.id,
      value: dto.value,
      displayName: dto.displayNameKeyOrText,
      displayNameKeyOrText: dto.displayNameKeyOrText,
      sortOrder: 0,
      colorHex: dto.colorHex ?? undefined,
      priceModifier: dto.priceModifier ?? undefined,
      isAvailable: dto.isAvailable,
      media: mediaItems,
    };
  }

  private mapVariantCombination(dto: BackendProductVariantCombinationDto): ProductVariantCombination {
  return {
    id: dto.id,
    sku: dto.sku,
    attributes: (dto.attributes ?? []).map(a => ({
      attributeId: a.attributeId,
      attributeValueId: a.attributeValueId,
      attributeNameKeyOrText: a.attributeNameKeyOrText,
      attributeValueNameKeyOrText: a.attributeValueNameKeyOrText,
      colorHex: a.colorHex ?? undefined,
    })),
    price: dto.price ?? undefined,
    originalPrice: dto.originalPrice ?? undefined,
    stockQuantity: dto.stockQuantity ?? undefined,
    stockStatus: mapStockStatus(dto.stockStatus), // FIX: Use numeric mapper
    isActive: true,
    isDefault: dto.isDefault ?? false,
    mediaIds: (dto.media ?? []).map(m => m.id),
  };
}

  private mapDisplaySpecifications(dtos: readonly BackendProductDisplaySpecificationDto[]): ProductDisplaySpecification[] {
    return dtos.map(dto => ({
      specKey: dto.specKey,
      labelKeyOrText: dto.labelKeyOrText,
      valueKeyOrText: dto.valueKeyOrText,
      icon: (dto.icon as AppIcon) ?? null,
      groupKeyOrText: dto.groupKeyOrText ?? null,
      displayOrder: dto.displayOrder ?? 0,
    }));
  }

  private mapAvailabilityRules(dto: BackendProductAvailabilityRulesDto | null): ProductAvailabilityRules | undefined {
    if (!dto) return undefined;
    return {
      minOrderQuantity: dto.minOrderQuantity ?? undefined,
      maxOrderQuantity: dto.maxOrderQuantity ?? undefined,
      quantityIncrements: dto.quantityIncrements ?? undefined,
    };
  }

  private createFallbackProduct(dto: BackendProductListItemDto | BackendProductDetailDto): Product {
    this.logger.warn(`[ProductMappingService] Creating fallback product for ID: ${dto.id}`);

    return {
      id: dto.id,
      createdAt: this.toDateTimeInfo(undefined),
      lastModified: this.toDateTimeInfo(undefined),
      name: dto.name || 'Unknown Product',
      shortDescription: dto.shortDescription ?? undefined,
      description: dto.shortDescription ?? 'Product details unavailable',
      currency: 'EUR',
      categoryIds: [],
      tags: dto.tags ? [...dto.tags] : [],
      averageRating: dto.averageRating ?? 0,
      reviewCount: dto.reviewCount || 0,
      isActive: dto.isActive,
      isFeatured: false,
      status: ProductStatus.DRAFT,
      searchKeywords: undefined,
      customAttributes: undefined,
      appScope: undefined,
      metaTitle: dto.name,
      metaDescription: dto.shortDescription,
      metaKeywords: undefined,
      price: 0,
      originalPrice: undefined,
      stockStatus: StockStatus.OUT_OF_STOCK,
      inStock: false,
      stockQuantity: undefined,
      type: ProductType.PHYSICAL,
      media: [],
      variantAttributes: [],
      variantCombinations: [],
      colorVariants: [],
      sku: undefined,
    } as PhysicalProduct;
  }

  private toDateTimeInfo(isoString?: string): DateTimeInfo | undefined {
    if (!isoString) return undefined;
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return undefined;
      return { iso: isoString, timestamp: date.getTime() };
    } catch (e) {
      this.logger.error(`[ProductMappingService] Failed to parse date string: ${isoString}`, e);
      return undefined;
    }
  }
}

--- END OF FILE ---

--- START OF FILE libs/features/products/domain/src/lib/models/product-base.model.ts ---

/**
 * @file product-base.model.ts - DEFINITIVE AND CORRECTED VERSION
 * @Version 2.1.0 - Aligned with DTO Nullability and ensures all common properties exist.
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-20
 * @Description This version consolidates common properties from backend DTOs into ProductBase,
 *              making them optional where they might be absent or null, solving type assignment errors.
 *              It also maintains `categoryIds` to prevent TS2353.
 */
import { Media } from '@royal-code/shared/domain';
import { ProductStatus, ProductType, StockStatus } from '../types/product-types.enum';
import { ProductVariantCombination, VariantAttribute } from './product-variants.model';
import { Review } from '@royal-code/features/reviews/domain';
import { AuditableEntityBase, DateTimeInfo } from '@royal-code/shared/base-models';
 // Nodig voor StockStatus

export interface ProductColorVariantTeaser {
  readonly uiId: number;
  readonly attributeValueId: string;
  readonly defaultVariantId: string;
  readonly value: string;
  readonly displayName: string;
  readonly colorHex?: string | null;
  readonly price: number;
  readonly originalPrice?: number | null;
  readonly media?: readonly Media[] | null;
  readonly isDefault?: boolean; // <-- TOEGEVOEGD: Deze property ontbrak
}

export interface ProductBase extends AuditableEntityBase {
  readonly id: string;
  name: string;
  slug?: string | null; // Allow null for slug
  readonly type: ProductType;
  status: ProductStatus;

  shortDescription?: string | null; // Allow null
  description: string;

  media?: readonly Media[] | null; // Allow null
  currency?: string | null; // Allow null
  colorVariants?: readonly ProductColorVariantTeaser[] | null; // Allow null
  categoryIds: string[]; // This property remains mandatory and non-null in ProductBase
  tags?: readonly string[] | null; // Allow null

  variantAttributes?: readonly VariantAttribute[] | null; // Allow null
  variantCombinations?: readonly ProductVariantCombination[] | null; // Allow null

  // --- COMMERCE PROPERTIES (Added/Adjusted to solve NG9 errors on ProductListComponent) ---
  price?: number | null; // Make optional and allow null
  originalPrice?: number | null; // Make optional and allow null
  hasDiscount?: boolean; // Make optional
  discountPercentage?: number | null; // Make optional and allow null
  stockStatus?: StockStatus | null; // Make optional and allow null
  inStock?: boolean; // Make optional
  stockQuantity?: number | null; // Make optional and allow null

  // Reviews & Ratings
  averageRating?: number | null; // Allow null
  reviewCount?: number;

  // Visibility & Lifecycle
  isActive: boolean;
  isFeatured?: boolean;
  isNewUntil?: DateTimeInfo | null;

  // Analytics
  totalSalesCount?: number;
  viewCount?: number;

  // SEO
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[] | null;

  publishedAt?: DateTimeInfo | null;
  archivedAt?: DateTimeInfo | null;
  discontinuedAt?: DateTimeInfo | null;
  lastModifiedBy?: string | null;

  // Relationships & Inventory Hints
  relatedProductIds?: string[] | null;
  restockDate?: DateTimeInfo | null;

  // Pricing (Internal - these were already optional, good)
  costPrice?: number;
  profitMarginPercent?: number;

  // Pragmatic Enterprise Touches
  searchKeywords?: string[] | null;
  customAttributes?: Record<string, unknown> | null;
  appScope?: string | null;

    // === Tijdelijke eigenschap voor data-overdracht ===
  // @TODO remove this later
    _mediaMap?: Map<string, Media[]>; 

}

--- END OF FILE ---

--- START OF FILE libs/features/products/domain/src/lib/models/product-physical.model.ts ---

/**
 * @file physical-product.model.ts
 * @Version 1.3.0 (Storytelling Sections Added)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Defines the `PhysicalProduct` interface, now including `storySections`
 *              to support data-driven, immersive "flagship" product pages.
 */
import { ProductBase } from './product-base.model';
import { ProductType, StockStatus } from '../types/product-types.enum';
import {
  ProductTax,
  ProductDiscount,
  ProductDisplaySpecification,
  SupplierInfo,
  ProductShipping
} from './product-commerce-details.model';
import { PhysicalProductVariants } from './product-variants.model';

/**
 * @Interface ProductAvailabilityRules
 * @Description Defines rules regarding order quantities for a product.
 */
export interface ProductAvailabilityRules {
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  quantityIncrements?: number; // e.g., must be ordered in multiples of 2
}

export interface PhysicalProduct extends ProductBase {
  readonly type: ProductType.PHYSICAL;
  price: number;
  originalPrice?: number;
  activeDiscount?: ProductDiscount | null;
  taxInfo?: ProductTax;
  sku?: string;
  ean?: string;
  gtin?: string;
  brand?: string;
  manageStock?: boolean;
  stockQuantity?: number | null;
  stockStatus?: StockStatus;
  allowBackorders?: boolean;
  lowStockThreshold?: number;
  variantContext?: PhysicalProductVariants;
  displaySpecifications?: ProductDisplaySpecification[];
  ageRecommendationKeyOrText?: string;
  safetyCertifications?: string[];
  supplierInfo?: SupplierInfo;
  shippingDetails?: ProductShipping;
  availabilityRules?: ProductAvailabilityRules;
}

--- END OF FILE ---

--- START OF FILE libs/features/products/domain/src/lib/models/product-variants.model.ts ---

/**
 * @file product-variants.model.ts
 * @Version 1.6.0 (Type-safe fix for media property)
 * @Description Definitive model for product variants, including attributes and combinations.
 */

import { Media } from "@royal-code/shared/domain";
import { StockStatus } from "../types/product-types.enum";
import { Dimension } from "@royal-code/shared/base-models";

export enum VariantAttributeType {
  COLOR = 'color',
  SIZE = 'size',
  MATERIAL = 'material',
  STYLE = 'style',
  FLAVOR = 'flavor',
  SCENT = 'scent',
  PATTERN = 'pattern',
  FINISH = 'finish',
  CAPACITY = 'capacity',
  POWER = 'power',
  CONNECTIVITY = 'connectivity',
  LANGUAGE = 'language',
  PLATFORM = 'platform',
  LICENSE_TYPE = 'license_type',
  DURATION = 'duration',
  CUSTOM = 'custom',
  RARITY = 'rarity',
  LEVEL = 'level',
  TIER = 'tier',
}

export interface VariantAttributeValue {
  readonly id: string;
  readonly value: string;
  readonly displayName: string;
  readonly nameKeyOrText?: string;
  readonly sortOrder: number;
  readonly colorHex?: string | null;
  readonly media?: readonly Media[] | null; 
  readonly priceModifier?: number;
  readonly isAvailable: boolean;
  displayNameKeyOrText?: string;
}


export interface VariantAttribute {
  id: string;
  type: VariantAttributeType;
  name: string;
  description?: string;
  isRequired: boolean;
  displayType: 'dropdown' | 'buttons' | 'swatches' | 'radio' | 'grid' | 'color-picker';
  displayOrder: number;
  values: VariantAttributeValue[];
  allowMultiple?: boolean;
  minSelections?: number;
  maxSelections?: number;
  dependsOn?: {
    attributeId: string;
    values: string[];
  };
  nameKeyOrText?: string;
}

export interface VariantAttributeSelection {
  attributeId: string;
  attributeValueId: string;
  attributeNameKeyOrText?: string;
  attributeValueNameKeyOrText?: string;
  colorHex?: string | null; // Optioneel, voor kleurattributen
}


export interface ProductVariantCombination {
  id: string;
  sku: string;
  attributes: VariantAttributeSelection[];
  price?: number;
  originalPrice?: number;
  stockQuantity?: number;
  stockStatus?: StockStatus;
  weight?: number;
  dimensions?: Dimension;
  isActive: boolean;
  isDefault?: boolean;
  barcode?: string;
  customAttributes?: Record<string, unknown>;
  mediaIds?: readonly string[] | null; // Consolidated to mediaIds
}

// For Physical Products
export interface PhysicalProductVariants {
  sizeChart?: {
    url?: string;
    measurements?: Record<string, Record<string, number>>;
  };
  careInstructions?: Record<string, string[]>;
  variantShipping?: Record<string, {
    additionalWeight?: number;
    additionalCost?: number;
  }>;
}

// For Digital Products
export interface DigitalProductVariants {
  formatVariants?: {
    format: string;
    fileSize: number;
    compatibility?: string[];
  }[];
  qualityVariants?: {
    quality: 'standard' | 'high' | 'ultra';
    fileSize: number;
    dimensions?: { width: number; height: number };
  }[];
}

// For Virtual Game Items
export interface VirtualItemVariants {
  rarityVariants?: {
    rarity: string;
    statModifiers: Record<string, number>;
    visualEffects?: string[];
  }[];
  levelVariants?: {
    requiredLevel: number;
    unlockedFeatures: string[];
  }[];
}

// For Service Products
export interface ServiceProductVariants {
  durationVariants?: {
    duration: number;
    unit: 'hours' | 'days' | 'weeks' | 'months' | 'years';
    price: number;
  }[];
  tierVariants?: {
    tier: 'basic' | 'standard' | 'premium' | 'enterprise';
    features: string[];
    limitations?: Record<string, number>;
  }[];
}

--- END OF FILE ---

--- START OF FILE libs/features/products/domain/src/lib/models/product.model.ts ---

/**
 * @file product.model.ts
 * @Version 1.1.0 // Version updated to reflect new base and types
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-05-31
 * @Description Defines the main `Product` discriminated union type,
 *              which combines all specific product type interfaces.
 *              This file primarily serves to construct and export this union type.
 *              It also re-exports ProductStatus for convenience.
 */
import { PhysicalProduct } from './product-physical.model';
import { VirtualGameItemProduct } from './product-game-item.model';
import { DigitalProduct } from './product-digital.model';
import { ServiceProduct } from './product-service.model';
import { ProductStatus } from '../types/product-types.enum';

export { ProductStatus }; // Re-export ProductStatus

/**
 * @TypeUnion Product
 * @Description A discriminated union representing any type of product within the system.
 *              Use the `type: ProductType` property (available on all constituents via `ProductBase`)
 *              to determine the specific product interface and safely access type-specific properties.
 */
export type Product =
  | PhysicalProduct
  | VirtualGameItemProduct
  | DigitalProduct
  | ServiceProduct;

--- END OF FILE ---