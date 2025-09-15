/**
 * @file libs/ui/products/src/lib/filter-sidebar/category-tree-node.component.ts
 * @Version 1.1.0 (Fixed Types & Imports)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-07
 * @Description
 *   Recursive component for rendering category tree nodes with expand/collapse functionality.
 *   FIXED: All import paths and type issues.
 */
import { 
  Component, 
  ChangeDetectionStrategy, 
  input, 
  output, 
  computed 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon, CategorySelectionEvent, CategoryToggleEvent, CategoryTreeNode } from '@royal-code/shared/domain';



@Component({
  selector: 'royal-code-ui-category-tree-node',
  standalone: true,
  imports: [CommonModule, TranslateModule, UiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Current Node -->
    <div class="category-node flex items-center" 
         [style.margin-left.rem]="indentLevel()">
      
      <!-- Expand/Collapse Button -->
      @if (hasChildren()) {
        <button
          type="button"
          class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-hover transition-colors"
          (click)="onToggleExpanded()"
          [attr.aria-label]="node().isExpanded ? 'Inklappen' : 'Uitklappen'"
          [attr.aria-expanded]="node().isExpanded">
          <royal-code-ui-icon 
            [icon]="AppIcon.ChevronRight" 
            sizeVariant="xs"
            [ngClass]="{ 'rotate-90': node().isExpanded }"
            extraClass="transition-transform duration-200" />
        </button>
      } @else {
        <!-- Spacer voor alignment -->
        <div class="w-6 h-6 flex-shrink-0"></div>
      }

      <!-- Category Checkbox & Label -->
      <label class="flex items-center flex-grow min-w-0 py-1 px-2 rounded cursor-pointer hover:bg-hover transition-colors group"
             [ngClass]="{
               'bg-primary/10 border-l-2 border-primary': node().isSelected,
               'text-muted-foreground': (node().count || 0) === 0
             }">
        
        <!-- Checkbox -->
        <input
          type="checkbox"
          class="flex-shrink-0 w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2 focus:ring-offset-0"
          [checked]="node().isSelected"
          [disabled]="(node().count || 0) === 0"
          (change)="onSelectionChange($event)"
          [attr.aria-describedby]="node().id + '-count'" />
        
        <!-- Category Name -->
        <span class="ml-2 text-sm font-medium flex-grow truncate group-hover:text-foreground transition-colors"
              [ngClass]="{
                'text-primary font-semibold': node().isSelected,
                'text-muted-foreground': (node().count || 0) === 0
              }">
          {{ node().name }}
        </span>
        
        <!-- Product Count Badge -->
        @if ((node().count || 0) > 0) {
          <span 
            class="ml-2 flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full"
            [ngClass]="{
              'bg-primary text-primary-on': node().isSelected,
              'bg-surface-alt text-muted-foreground group-hover:bg-accent group-hover:text-accent-on': !node().isSelected
            }"
            [id]="node().id + '-count'">
            {{ node().count }}
          </span>
        } @else {
          <span 
            class="ml-2 flex-shrink-0 px-2 py-0.5 text-xs font-medium text-muted-foreground"
            [id]="node().id + '-count'">
            (0)
          </span>
        }
      </label>
    </div>

    <!-- Children Nodes (Recursive) -->
    @if (node().isExpanded && hasChildren()) {
      <div class="children-container" 
           role="group" 
           [attr.aria-labelledby]="node().id">
        @for (child of node().children; track child.id) {
          <royal-code-ui-category-tree-node
            [node]="child"
            [maxDepth]="maxDepth()"
            [baseIndent]="baseIndent()"
            (categorySelected)="onChildSelected($event)"
            (categoryToggled)="onChildToggled($event)" />
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .category-node {
      min-height: 2rem;
    }
    
    .children-container {
      border-left: 1px solid var(--border);
      margin-left: 0.75rem;
      padding-left: 0.25rem;
    }
    
    /* Smooth expand/collapse animation */
    .children-container {
      animation: fadeInDown 0.2s ease-out;
    }
    
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Hover effects */
    label:hover .group-hover\\:bg-accent {
      background-color: var(--accent);
    }
    
    label:hover .group-hover\\:text-accent-on {
      color: var(--accent-on);
    }
    
    /* Focus styles */
    input:focus {
      outline: none;
    }
    
    /* Disabled state */
    input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    label:has(input:disabled) {
      cursor: not-allowed;
    }
    
    label:has(input:disabled):hover {
      background-color: transparent;
    }
  `]
})
export class CategoryTreeNodeComponent {
  readonly node = input.required<CategoryTreeNode>();
  readonly maxDepth = input<number>(10);
  readonly baseIndent = input<number>(0);
  
  readonly categorySelected = output<CategorySelectionEvent>();
  readonly categoryToggled = output<CategoryToggleEvent>();
  
  protected readonly AppIcon = AppIcon;
  
  readonly hasChildren = computed(() => 
    this.node().children && this.node().children.length > 0
  );
  
  readonly indentLevel = computed(() => 
    this.baseIndent() + (this.node().level * 0.75)
  );

  onSelectionChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const node = this.node();
    
    this.categorySelected.emit({
      categoryId: node.id,
      isSelected: target.checked,
      node: node
    });
  }

  onToggleExpanded(): void {
    const node = this.node();
    
    this.categoryToggled.emit({
      categoryId: node.id,
      isExpanded: !node.isExpanded
    });
  }

  onChildSelected(event: CategorySelectionEvent): void {
    // Bubble up the event
    this.categorySelected.emit(event);
  }

  onChildToggled(event: CategoryToggleEvent): void {
    // Bubble up the event
    this.categoryToggled.emit(event);
  }
}