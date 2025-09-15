/**
 * @file admin-review-list.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Dumb component to display a paginated list of admin reviews.
 */
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminReview } from '@royal-code/features/admin-reviews/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiButtonComponent } from '@royal-code/ui/button';
import { AppIcon } from '@royal-code/shared/domain';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { UiRatingComponent } from '@royal-code/ui/rating';
import { TranslateModule } from '@ngx-translate/core';
import { UiDropdownComponent } from '@royal-code/ui/dropdown';

@Component({
  selector: 'admin-review-list',
  standalone: true,
  imports: [
    CommonModule, DatePipe, TitleCasePipe, RouterModule, TranslateModule,
    UiIconComponent, UiButtonComponent, UiBadgeComponent, UiRatingComponent, UiDropdownComponent
  ],
  template: `
    <div class="bg-card border border-border rounded-xs overflow-x-auto">
      <table class="w-full text-sm text-left text-secondary whitespace-nowrap">
        <thead class="text-xs text-muted uppercase bg-surface-alt">
          <tr>
            <th scope="col" class="p-4">{{ 'admin.reviews.list.author' | translate }}</th>
            <th scope="col" class="p-4">{{ 'admin.reviews.list.rating' | translate }}</th>
            <th scope="col" class="p-4">{{ 'admin.reviews.list.title' | translate }}</th>
            <th scope="col" class="p-4">{{ 'admin.reviews.list.status' | translate }}</th>
            <th scope="col" class="p-4">{{ 'admin.reviews.list.date' | translate }}</th>
            <th scope="col" class="p-4 text-right">{{ 'admin.reviews.list.actions' | translate }}</th>
          </tr>
        </thead>
        <tbody>
          @for (review of reviews(); track review.id) {
            <tr class="border-b border-border hover:bg-hover">
              <td class="p-4 font-medium text-foreground">
                <div class="flex items-center gap-2">
                    @if (review.profile.avatar; as avatar) {
                        <!-- Assuming UiProfileImageComponent or similar to render avatar -->
                        <img [src]="avatar.variants[0].url" [alt]="review.profile.displayName" class="w-8 h-8 rounded-full object-cover">
                    } @else {
                        <royal-code-ui-icon [icon]="AppIcon.UserCircle" sizeVariant="md" extraClass="text-muted" />
                    }
                    {{ review.profile.displayName || 'N/A' }}
                </div>
              </td>
              <td class="p-4">
                <royal-code-ui-rating [rating]="review.rating * 2" [readonly]="true" size="sm" />
              </td>
              <td class="p-4">{{ review.title || ('admin.reviews.list.noTitle' | translate) }}</td>
              <td class="p-4">
                <royal-code-ui-badge [color]="getReviewStatusColor(review.status)">{{ review.status | titlecase }}</royal-code-ui-badge>
              </td>
              <td class="p-4">{{ review.createdAt?.iso | date:'short' }}</td>
              <td class="p-4 text-right">
                <royal-code-ui-dropdown alignment="right">
                  <royal-code-ui-button dropdown-trigger type="transparent" sizeVariant="icon" extraClasses="h-8 w-8 text-secondary">
                    <royal-code-ui-icon [icon]="AppIcon.MoreVertical" sizeVariant="sm" />
                  </royal-code-ui-button>
                  <div dropdown class="bg-card border border-border rounded-xs shadow-lg py-1 w-40 z-dropdown">
                    <a [routerLink]="['/reviews', review.id]" class="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 hover:bg-hover text-foreground">
                      <royal-code-ui-icon [icon]="AppIcon.Edit" sizeVariant="xs" />
                      <span>{{ 'common.buttons.edit' | translate }}</span>
                    </a>
                    <button (click)="deleteClicked.emit(review.id)" class="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 hover:bg-hover text-error">
                      <royal-code-ui-icon [icon]="AppIcon.Trash2" sizeVariant="xs" />
                      <span>{{ 'common.buttons.delete' | translate }}</span>
                    </button>
                  </div>
                </royal-code-ui-dropdown>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="6" class="p-8 text-center">{{ 'admin.reviews.list.noReviewsFound' | translate }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReviewListComponent {
  reviews = input.required<readonly AdminReview[]>();
  deleteClicked = output<string>();

  protected readonly AppIcon = AppIcon;

  getReviewStatusColor(status: string): 'warning' | 'success' | 'error' | 'muted' {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'flagged': return 'error';
      default: return 'muted';
    }
  }
}