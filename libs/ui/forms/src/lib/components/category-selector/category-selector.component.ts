/**
 * @file category-selector.component.ts
 * @Version 3.4.0 (Refactored to use UiCheckboxComponent)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-05
 * @Description
 *   A component for selecting product categories from a list. This version is
 *   refactored to use the new, dedicated `UiCheckboxComponent`, resolving previous
 *   binding and CVA conflicts.
 */
import { Component, ChangeDetectionStrategy, forwardRef, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ProductCategory } from '@royal-code/features/products/domain';
import { UiCheckboxComponent } from '@royal-code/ui/input'; 

@Component({
  selector: 'royal-code-ui-category-selector',
  standalone: true,
  imports: [CommonModule, UiCheckboxComponent],
  template: `
    <div>
      <label class="block text-sm font-medium text-foreground mb-1">{{ label() }}</label>
      @if (isLoading()) {
        <p class="text-sm text-secondary">Categorieën laden...</p>
      } @else {
        <div class="max-h-48 overflow-y-auto border border-input rounded-md p-2 space-y-1">
          @for (category of rootCategories(); track category.id) {
            <ng-container [ngTemplateOutlet]="categoryTemplate" [ngTemplateOutletContext]="{$implicit: category, level: 0}"></ng-container>
          }
        </div>
      }
    </div>

    <ng-template #categoryTemplate let-category let-level="level">
      <div [style.padding-left.rem]="level * 1.5">
        <!-- === GEBRUIK NU DE NIEUWE CHECKBOX COMPONENT === -->
        <royal-code-ui-checkbox
          [label]="category.name"
          [checked]="isSelected(category.id)"
          (changed)="toggleSelection(category.id, $event)"
          [explicitId]="'category-' + category.id"
          [labelClasses]="isSelected(category.id) ? 'text-primary font-semibold' : ''" 
        />
      </div>
      @if (category.children && category.children.length > 0) {
        @for(child of category.children; track child.id) {
          <ng-container [ngTemplateOutlet]="categoryTemplate" [ngTemplateOutletContext]="{$implicit: child, level: level + 1}"></ng-container>
        }
      }
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => UiCategorySelectorComponent),
    multi: true
  }]
})
export class UiCategorySelectorComponent implements ControlValueAccessor {
  readonly categories = input.required<readonly ProductCategory[]>();
  readonly label = input<string>('Categorieën');
  readonly isLoading = input<boolean>(false);

  protected selectedIds = signal<Set<string>>(new Set());
  private onChange: (value: string[] | null) => void = () => {};
  private onTouched: () => void = () => {};

  protected categoryMap = computed(() => this.flattenCategories(this.categories()));
  protected rootCategories = computed(() => this.categories().filter(c => !c.parentId));

  writeValue(value: string[] | null): void {
    this.selectedIds.set(new Set(value || []));
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  toggleSelection(id: string, isChecked: boolean): void {
    const newSelectedIds = new Set(this.selectedIds());
    
    this.updateDescendants(newSelectedIds, id, isChecked);
    this.updateAncestors(newSelectedIds, id);

    this.selectedIds.set(newSelectedIds);
    this.onChange(Array.from(newSelectedIds));
    this.onTouched();
  }

  private flattenCategories(categories: readonly ProductCategory[]): Map<string, ProductCategory> {
    const map = new Map<string, ProductCategory>();
    function recurse(cats: readonly ProductCategory[]) {
      for (const cat of cats) {
        map.set(cat.id, cat);
        if (cat.children) {
          recurse(cat.children);
        }
      }
    }
    recurse(categories);
    return map;
  }
  
  private getDescendantIds(startId: string): string[] {
    const descendants: string[] = [];
    const queue: string[] = [startId];
    const map = this.categoryMap();
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const category = map.get(currentId);
      if (category?.children) {
        for (const child of category.children) {
          descendants.push(child.id);
          queue.push(child.id);
        }
      }
    }
    return descendants;
  }

  private updateDescendants(selected: Set<string>, startId: string, shouldBeSelected: boolean): void {
    const idsToUpdate = [startId, ...this.getDescendantIds(startId)];
    if (shouldBeSelected) {
      idsToUpdate.forEach(id => selected.add(id));
    } else {
      idsToUpdate.forEach(id => selected.delete(id));
    }
  }

  private updateAncestors(selected: Set<string>, startId: string): void {
    const map = this.categoryMap();
    let parentId = map.get(startId)?.parentId;

    while (parentId) {
      const parent = map.get(parentId);
      if (!parent || !parent.children) break;

      const allChildrenSelected = parent.children.every(child => selected.has(child.id));
      
      if (allChildrenSelected) {
        selected.add(parent.id);
      } else {
        selected.delete(parent.id);
      }
      
      parentId = parent.parentId;
    }
  }
}