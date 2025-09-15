/**
 * @file ui-search-suggestions-panel.component.ts
 * @Version 2.0.0 (Definitive Card Layout)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-09
 * @Description
 *   A presentational component to display grouped search suggestions. This definitive
 *   version implements a robust and visually appealing card-based layout, fixing
 *   all previous styling and flexbox issues.
 */
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SearchSuggestion } from '@royal-code/features/products/domain';
import { UiImageComponent } from '@royal-code/ui/media';
import { AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';

@Component({
  selector: 'royal-code-ui-search-suggestions-panel',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    UiImageComponent,
    UiIconComponent
  ],
  template: `
    <div [class]="'absolute top-full left-0 right-0 mt-2 bg-background border-2 border-black shadow-lg z-50 animate-fade-in-down max-h-[60vh] overflow-y-auto'"
         role="listbox">
      @if (groupedSuggestions().size > 0) {
        @for (group of groupedSuggestions().entries(); track group[0]) {
          <div class="p-4 border-b border-border last:border-b-0">
            <h3 class="text-xs font-semibold uppercase text-secondary mb-3 px-2">{{ group[0] }}</h3>
            <ul class="space-y-1">
              @for (suggestion of group[1]; track suggestion.text) {
                <li>
                  <!-- DE FIX: De <a> tag is nu een flex-container met duidelijke verhoudingen -->
                  <a [routerLink]="suggestion.route" (click)="suggestionSelected.emit(suggestion)"
                     class="flex items-center gap-4 p-2 rounded-none text-foreground hover:bg-hover hover:text-primary transition-colors w-full text-left">
                    
                    <!-- Afbeelding container: Vaste breedte, krimpt niet -->
                    <div class="flex-shrink-0 w-12 h-12">
                      @if (suggestion.imageUrl) {
                        <royal-code-ui-image [src]="suggestion.imageUrl" [alt]="suggestion.text" objectFit="cover" extraClasses="w-full h-full" [rounding]="'xs'" />
                      } @else {
                        <div class="w-full h-full bg-surface-alt flex items-center justify-center rounded-xs border border-border">
                          <royal-code-ui-icon [icon]="getIconForType(suggestion.type)" sizeVariant="md" extraClass="text-secondary" />
                        </div>
                      }
                    </div>

                    <!-- Tekst container: Neemt alle resterende ruimte in beslag -->
                    <div class="flex-grow min-w-0">
                      <p class="text-sm font-semibold truncate">{{ suggestion.text }}</p>
                      <p class="text-xs text-secondary capitalize">{{ suggestion.type }}</p>
                    </div>
                  </a>
                </li>
              }
            </ul>
          </div>
        }
      } @else {
        <p class="p-4 text-sm text-center text-secondary">{{ 'search.noSuggestions' | translate }}</p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiSearchSuggestionsPanelComponent {
  readonly suggestions = input.required<SearchSuggestion[]>();
  readonly suggestionSelected = output<SearchSuggestion>();

  protected readonly AppIcon = AppIcon;

  protected groupedSuggestions = computed(() => {
    const groups = new Map<string, SearchSuggestion[]>();
    for (const suggestion of this.suggestions()) {
      const type = suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1) + 's';
      if (!groups.has(type)) {
        groups.set(type, []);
      }
      groups.get(type)!.push(suggestion);
    }
    return groups;
  });

  getIconForType(type: string): AppIcon {
    switch (type) {
      case 'product': return AppIcon.Package;
      case 'brand': return AppIcon.Bookmark;
      case 'category': return AppIcon.Folder;
      case 'guide': return AppIcon.BookOpen;
      default: return AppIcon.Search;
    }
  }
}