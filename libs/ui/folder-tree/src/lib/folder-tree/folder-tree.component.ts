/**
 * @file folder-tree.component.ts (Shared UI)
 * @version 1.1.0 (i18n Support)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-08-07
 * @description Presentational component for displaying hierarchical folder/file structures.
 *              Now supports i18n translation for node descriptions.
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { TranslateModule } from '@ngx-translate/core'; // <-- TOEGEVOEGD

export interface TreeNode {
  name: string;
  icon?: AppIcon;
  colorClass?: string;
  description?: string; // Kan een vertaalsleutel of directe string zijn
  children?: TreeNode[];
}

@Component({
  selector: 'royal-ui-folder-tree',
  standalone: true,
  imports: [CommonModule, UiIconComponent, TranslateModule], // <-- TranslateModule TOEGEVOEGD
  template: `
    <ul class="folder-tree space-y-1">
      @for (node of data(); track node.name) {
        <li>
          <div class="flex items-center gap-2">
            @if (node.icon) {
              <royal-code-ui-icon [icon]="node.icon" sizeVariant="sm" [colorClass]="node.colorClass" />
            }
            <span class="font-medium text-foreground">{{ node.name }}</span>
            @if (node.description) {
              <span class="text-xs text-muted font-normal ml-2">
                <!-- DE FIX: Toepassen van translate pipe, indien het een vertaalsleutel is -->
                ({{ node.description | translate }})
              </span>
            }
          </div>
          @if (node.children && node.children.length > 0) {
            <ul class="ml-6 mt-1 space-y-1">
              <royal-ui-folder-tree [data]="node.children" />
            </ul>
          }
        </li>
      }
    </ul>
  `,
  styles: [`
    .folder-tree {
      @apply font-mono text-sm;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FolderTreeComponent {
  data = input.required<TreeNode[]>();
}