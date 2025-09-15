/**
 * @file admin-review-form.component.ts
 * @Version 1.1.0 (Added Full Review JSON Debug Output)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Form for editing admin reviews, now includes full JSON debug output for validation.
 */
import { Component, ChangeDetectionStrategy, input, output, OnInit, effect } from '@angular/core';
import { CommonModule, TitleCasePipe, JsonPipe } from '@angular/common'; // <<< JsonPipe toegevoegd
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminReview, UpdateAdminReviewPayload, UpdateAdminReviewStatusPayload } from '@royal-code/features/admin-reviews/domain';
import { ReviewStatus } from '@royal-code/features/reviews/domain';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiTextareaComponent } from '@royal-code/ui/textarea';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { UiRatingComponent } from '@royal-code/ui/rating';
import { TranslateModule } from '@ngx-translate/core';
import { AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';

@Component({
  selector: 'admin-review-form',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule, TitleCasePipe, TranslateModule, JsonPipe, // <<< JsonPipe hier
    UiTitleComponent, UiButtonComponent, UiInputComponent, UiTextareaComponent,
    UiSpinnerComponent, UiRatingComponent, UiIconComponent
  ],
  template: `
    <form [formGroup]="reviewForm" (ngSubmit)="onSave()">
      <div class="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-4 border-b border-border px-4">
        <div class="flex justify-between items-center">
          <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="'admin.reviews.editTitle' | translate: { reviewId: review().id }" />
          <div class="flex items-center gap-3">
            <royal-code-ui-button type="outline" routerLink="/reviews">{{ 'common.buttons.back' | translate }}</royal-code-ui-button>
            <royal-code-ui-button type="primary" htmlType="submit" [disabled]="reviewForm.invalid || isSubmitting()">
              @if (isSubmitting()) { <royal-code-ui-spinner size="sm" extraClass="mr-2" /><span>{{ 'common.buttons.saving' | translate }}</span> }
              @else { <span>{{ 'common.buttons.save' | translate }}</span> }
            </royal-code-ui-button>
          </div>
        </div>
      </div>

      <!-- DEBUG: Volledige review JSON output -->
      <div class="p-2 md:p-4 bg-info/10 border border-info-on/20 rounded-md text-sm mb-4">
        <strong>DEBUG: Full Review Object (AdminReviewFormComponent input):</strong>
        <pre class="whitespace-pre-wrap text-xs">{{ review() | json }}</pre>
      </div>

      <div class="p-2 md:p-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Review Content -->
          <div class="p-6 bg-card border border-border rounded-xs">
            <h3 class="text-lg font-medium mb-4">{{ 'admin.reviews.form.reviewContent' | translate }}</h3>
            <div class="space-y-4">
              <div class="flex items-center gap-4">
                <label class="block text-sm font-medium text-foreground">{{ 'admin.reviews.form.rating' | translate }}</label>
                <royal-code-ui-rating formControlName="rating" />
              </div>
              <royal-code-ui-input [label]="'admin.reviews.form.title' | translate" formControlName="title" />
              <royal-code-ui-textarea [label]="'admin.reviews.form.reviewText' | translate" formControlName="reviewText" [rows]="6" />
              <div class="flex items-center gap-2 text-sm text-secondary">
                <royal-code-ui-icon [icon]="review().isVerifiedPurchase ? AppIcon.CheckCircle : AppIcon.XCircle" sizeVariant="sm" />
                <span>{{ review().isVerifiedPurchase ? ('admin.reviews.form.verifiedPurchase' | translate) : ('admin.reviews.form.notVerifiedPurchase' | translate) }}</span>
              </div>
            </div>
          </div>
        </div>
        <!-- Sidebar -->
        <aside class="lg:col-span-1 space-y-6 sticky top-24">
          <!-- Author Info -->
          @if (review(); as r) {
            <div class="p-6 bg-card border border-border rounded-xs">
              <h3 class="text-lg font-medium mb-4">{{ 'admin.reviews.form.authorInfo' | translate }}</h3>
              <div class="space-y-3">
                <p><strong>{{ 'admin.reviews.form.author' | translate }}:</strong> {{ r.profile.displayName || 'N/A' }}</p>
                <p><strong>{{ 'admin.reviews.form.authorId' | translate }}:</strong> <span class="font-mono text-xs">{{ r.authorId }}</span></p>
                <p><strong>{{ 'admin.reviews.form.submittedOn' | translate }}:</strong> {{ r.createdAt?.iso | date:'medium' }}</p>
              </div>
            </div>
          }
          <!-- Moderation Actions -->
          <div class="p-6 bg-card border border-border rounded-xs">
            <h3 class="text-lg font-medium mb-4">{{ 'admin.reviews.form.moderation' | translate }}</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-foreground mb-1">{{ 'admin.reviews.form.status' | translate }}</label>
                <select formControlName="status" class="w-full p-2 border border-input rounded-md bg-background text-sm">
                  @for (status of reviewStatuses; track status) {
                    <option [value]="status">{{ status | titlecase }}</option>
                  }
                </select>
              </div>
              <royal-code-ui-textarea [label]="'admin.reviews.form.moderatorNoteOptional' | translate" formControlName="moderatorNote" [rows]="3" />
              <div class="flex flex-col gap-2 pt-4 border-t border-border">
                <royal-code-ui-button type="primary" (clicked)="onUpdateStatus()" [disabled]="reviewForm.get('status')?.pristine || isSubmitting()">
                  {{ 'admin.reviews.form.updateStatus' | translate }}
                </royal-code-ui-button>
                <royal-code-ui-button type="fire" (clicked)="onDeleteReview()" [disabled]="isSubmitting()">
                  {{ 'admin.reviews.form.deleteReview' | translate }}
                </royal-code-ui-button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReviewFormComponent implements OnInit {
  review = input.required<AdminReview>();
  isSubmitting = input.required<boolean>();
  
  saveReview = output<UpdateAdminReviewPayload>();
  updateStatus = output<UpdateAdminReviewStatusPayload>();
  deleteReview = output<void>();

  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;
  protected readonly reviewStatuses = Object.values(ReviewStatus);

  reviewForm: FormGroup;

constructor(private fb: FormBuilder) {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1)]],
      title: ['', [Validators.maxLength(100)]],
      reviewText: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      status: ['', Validators.required],
      moderatorNote: [''],
    });

    effect(() => {
      const currentReview = this.review();
      if (currentReview) {
        console.log('[AdminReviewFormComponent] Effect triggered. Patching form with review:', currentReview);
        
        this.reviewForm.patchValue({
          rating: currentReview.rating * 2,
          title: currentReview.title,
          reviewText: currentReview.reviewText,
          status: currentReview.status,
        }, { emitEvent: false }); 
        this.reviewForm.markAsPristine();
      }
    });
  }


  ngOnInit(): void {
    // Initialisatielogica indien nodig
  }

  onSave(): void {
    this.reviewForm.markAllAsTouched();
    if (this.reviewForm.invalid) return;

    const formValue = this.reviewForm.getRawValue();
    const payload: UpdateAdminReviewPayload = {
      rating: formValue.rating / 2, // <<< HIER DELEN WE WEER DOOR 2 VOOR DE BACKEND
      title: formValue.title,
      reviewText: formValue.reviewText,
      mediaIds: [], // Media management niet in deze stap
    };
    this.saveReview.emit(payload);
  }

  onUpdateStatus(): void {
    const statusControl = this.reviewForm.get('status');
    const noteControl = this.reviewForm.get('moderatorNote');

    if (statusControl?.dirty && statusControl.valid) {
      const payload: UpdateAdminReviewStatusPayload = {
        newStatus: statusControl.value as ReviewStatus,
        moderatorNote: noteControl?.value || undefined,
      };
      this.updateStatus.emit(payload);
    }
  }

  onDeleteReview(): void {
    this.deleteReview.emit();
  }
}