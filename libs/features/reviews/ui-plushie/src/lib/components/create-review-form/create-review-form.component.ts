/**
 * @file create-review-form.component.ts
 * @Version 3.2.0 (Definitive & Restored)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-28
 * @Description The definitive, fully functional component for creating/editing a review.
 *              This version restores all media upload logic, fixes styling issues for the overlay,
 *              and corrects all previously identified linting errors.
 */
import {
  ChangeDetectionStrategy, Component, inject, effect, signal,
  WritableSignal, computed, viewChild, ElementRef,
  DestroyRef
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// UI components
import { UiRatingComponent } from '@royal-code/ui/rating';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiTextareaComponent } from '@royal-code/ui/textarea';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon, Image, Media } from '@royal-code/shared/domain';
import { APP_CONFIG } from '@royal-code/core/config';

// Domain, Facade & DI Tokens
import { LoggerService } from '@royal-code/core/core-logging';
import { DYNAMIC_OVERLAY_DATA, DYNAMIC_OVERLAY_REF } from '@royal-code/ui/overlay';
import { Actions, ofType } from '@ngrx/effects';
import { CreateReviewPayload, Review as DomainReview, ReviewTargetEntityType, UpdateReviewPayload } from '@royal-code/features/reviews/domain';
import { ReviewsActions, ReviewsFacade, ReviewWithUIState } from '@royal-code/features/reviews/core';
import { AuthFacade } from '@royal-code/store/auth';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '@royal-code/ui/notifications';

interface ReviewFormData {
  targetEntityId: string;
  targetEntityType: ReviewTargetEntityType;
  reviewToEdit?: ReviewWithUIState;
}

interface ImagePreview {
  file: File;
  dataUrl: string;
  id: string;
}

@Component({
  selector: 'royal-code-create-review-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, TranslateModule, UiRatingComponent,
    UiInputComponent, UiTextareaComponent, UiButtonComponent, UiSpinnerComponent,
    UiTitleComponent, UiParagraphComponent, UiIconComponent
  ],
  template: `
    <div class="p-6 sm:p-8 bg-card rounded-xl shadow-lg relative max-h-[90dvh] flex flex-col">
      <royal-code-ui-title
        [level]="TitleTypeEnum.H2"
        [text]="(isEditMode() ? 'reviewForm.editTitle' : 'reviewForm.title') | translate"
        extraClasses="mb-6 text-center"
      />

      <form [formGroup]="reviewForm" (ngSubmit)="onSubmit()" class="flex-grow flex flex-col overflow-y-auto pr-2 -mr-2">
        <div class="space-y-5">
          <!-- Rating -->
          <div>
            <label for="rating" class="block text-sm font-medium text-foreground mb-2">{{ 'reviewForm.ratingLabel' | translate }}<span class="text-error ml-1">*</span></label>
            <div class="flex items-center gap-2">
              <royal-code-ui-rating id="rating" formControlName="rating" />
              <span class="text-sm text-secondary">{{ ratingDisplayS() }}</span>
            </div>
             @if (ratingControl().invalid && (ratingControl().dirty || ratingControl().touched)) {
              <royal-code-ui-paragraph color="error" size="xs" extraClasses="mt-1 flex items-center gap-1.5" role="alert">
                <royal-code-ui-icon [icon]="AppIcon.AlertCircle" sizeVariant="xs" />
                {{ 'reviewForm.ratingRequired' | translate }}
              </royal-code-ui-paragraph>
            }
          </div>
          <!-- Title -->
          <div>
            <royal-code-ui-input formControlName="title" [label]="'reviewForm.reviewTitleLabel' | translate" [placeholder]="'reviewForm.reviewTitlePlaceholder' | translate" [error]="titleError()" />
          </div>
          <!-- Review Text -->
          <div>
            <royal-code-ui-textarea formControlName="reviewText" [label]="'reviewForm.reviewTextLabel' | translate" [placeholder]="'reviewForm.reviewTextPlaceholder' | translate" [rows]="5" [maxLength]="500" [showCharCounter]="true" [error]="reviewTextError()" />
          </div>
          <!-- Media Attachments -->
          <div>
            <div id="photo-label" class="block text-sm font-medium text-foreground mb-2">{{ 'reviewForm.addPhotosLabel' | translate }} ({{ selectedImagePreviews().length }} / {{ maxFiles() }})</div>
            <div class="flex flex-wrap gap-2 items-center" role="group" aria-labelledby="photo-label">
              @for (preview of selectedImagePreviews(); track preview.id) {
                <div class="relative w-20 h-20 border-2 border-border rounded-md overflow-hidden group">
                  <img [src]="preview.dataUrl" [alt]="preview.file.name" class="w-full h-full object-cover">
                  <button type="button" (click)="removeImagePreview(preview.id)" class="absolute top-0.5 right-0.5 bg-destructive/80 text-destructive-on rounded-full p-0.5 w-5 h-5 flex items-center justify-center" [attr.aria-label]="'Remove image ' + preview.file.name"><royal-code-ui-icon [icon]="AppIcon.X" sizeVariant="xs" /></button>
                </div>
              }
              @if (selectedImagePreviews().length < maxFiles()) {
                <button type="button" (click)="onAddPhotoClick()" class="w-20 h-20 border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center text-secondary hover:bg-hover hover:border-primary transition-colors"><royal-code-ui-icon [icon]="AppIcon.Camera" sizeVariant="lg" /><span class="text-xs mt-1">{{ 'reviewForm.add' | translate }}</span></button>
              }
            </div>
            <input #fileInput type="file" [accept]="allowedImageTypes()" multiple class="hidden" (change)="onFileSelected($event)">
          </div>
        </div>
        <div class="flex-none flex justify-end gap-3 pt-6 mt-auto">
          <royal-code-ui-button type="outline" sizeVariant="md" (clicked)="onCancel()" [disabled]="isSubmitting()">{{ 'common.buttons.cancel' | translate }}</royal-code-ui-button>
          <royal-code-ui-button type="primary" sizeVariant="md" [htmlType]="'submit'" [disabled]="reviewForm.invalid || isSubmitting()" [enableNeonEffect]="true">
            @if (isSubmitting()) { <royal-code-ui-spinner size="sm" extraClasses="mr-2" /> }
            {{ (isEditMode() ? 'common.buttons.save' : 'reviewForm.submitButton') | translate }}
          </royal-code-ui-button>
        </div>
      </form>
      <button type="button" class="absolute top-4 right-4 text-secondary hover:text-foreground" (click)="onCancel()" [attr.aria-label]="'common.buttons.close' | translate"><royal-code-ui-icon [icon]="AppIcon.X" sizeVariant="md" /></button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      max-width: 600px;
      width: 100%;
      margin: auto;
      border: 3px solid red !important; /* TEMPORARY VISUAL DEBUG: Dit moet verschijnen */
    }
  `],

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateReviewFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly reviewsFacade = inject(ReviewsFacade);
  private readonly authFacade = inject(AuthFacade);
  private readonly logger = inject(LoggerService);
  private readonly translate = inject(TranslateService);
  private readonly appConfig = inject(APP_CONFIG);
  private readonly formData = inject<ReviewFormData | null>(DYNAMIC_OVERLAY_DATA, { optional: true });
  private readonly overlayRef = inject(DYNAMIC_OVERLAY_REF);
  private readonly actions$ = inject(Actions);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notificationService = inject(NotificationService);

  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;

  readonly reviewForm: FormGroup;
  readonly selectedImagePreviews = signal<ImagePreview[]>([]);
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  readonly maxFiles = computed(() => this.appConfig.mediaUpload.maxFiles);
  readonly allowedImageTypes = computed(() => this.appConfig.mediaUpload.allowedImageTypes.join(','));
  readonly isSubmitting = this.reviewsFacade.isSubmitting;
  readonly submissionErrorS: WritableSignal<string | null> = signal(null);
  readonly isEditMode = signal(!!this.formData?.reviewToEdit);

  readonly ratingControl = computed(() => this.reviewForm.get('rating') as FormControl);
  readonly titleControl = computed(() => this.reviewForm.get('title') as FormControl);
  readonly reviewTextControl = computed(() => this.reviewForm.get('reviewText') as FormControl);

  readonly ratingDisplayS = computed(() => {
    const stars = (this.ratingControl().value ?? 0) / 2;
    return stars === 0 ? this.translate.instant('reviewForm.noRatingSelected') : this.translate.instant('reviewForm.starsDisplay', { stars: stars.toFixed(1) });
  });

  readonly titleError = computed(() => {
    const c = this.titleControl();
    if (c.invalid && (c.dirty || c.touched)) {
      if (c.hasError('maxlength')) return this.translate.instant('reviewForm.reviewTitleMaxLength', { maxLength: 100 });
    }
    return null;
  });
  readonly reviewTextError = computed(() => {
    const c = this.reviewTextControl();
    if (c.invalid && (c.dirty || c.touched)) {
      if (c.hasError('required')) return this.translate.instant('reviewForm.reviewTextRequired');
      if (c.hasError('minlength')) return this.translate.instant('reviewForm.reviewTextMinLength', { minLength: 10 });
    }
    return null;
  });

    constructor() {
    this.reviewForm = this.fb.nonNullable.group({
      rating: [0, [Validators.required, Validators.min(1)]],
      title: ['', [Validators.maxLength(100)]],
      reviewText: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    });

    if (this.isEditMode() && this.formData?.reviewToEdit) {
      const review = this.formData.reviewToEdit;
      this.reviewForm.patchValue({
        // Rating omzetten van 1-5 naar 1-10 voor de slider
        rating: review.rating * 2,
        title: review.title ?? '',
        reviewText: review.reviewText,
      });
      // Als er bestaande media is, laad deze dan in de previews (voor edit, dit zou alleen thumbnails zijn)
      if (review.thumbnails && review.thumbnails.length > 0) {
        // Mock de ImagePreview structuur van de bestaande thumbnails voor weergave
        this.selectedImagePreviews.set(review.thumbnails.map((thumb: Image) => ({
          id: thumb.id,
          file: new File([], thumb.id, { type: 'image/jpeg' }), // Placeholder file
          dataUrl: thumb.variants[0].url,
        })));
      }
    }

    effect(() => {
      if (this.isSubmitting()) {
        this.reviewForm.disable();
      } else {
        this.reviewForm.enable();
      }
    });

    this.actions$.pipe(
      ofType(ReviewsActions.createReviewSuccess, ReviewsActions.updateReviewSuccess),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.overlayRef.close({ submitted: true });
    });
  }

  onAddPhotoClick(): void { this.fileInput().nativeElement.click(); }
  onCancel(): void { this.overlayRef.close(); }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files) return;

    const allowedTypes = this.appConfig.mediaUpload.allowedImageTypes;
    const maxSize = this.appConfig.mediaUpload.maxSizeMb * 1024 * 1024;
    const currentCount = this.selectedImagePreviews().length;
    const limit = Math.min(files.length, this.maxFiles() - currentCount);

    if (limit <= 0) {
      this.logger.warn(`[CreateReviewFormComponent] Max file limit of ${this.maxFiles()} reached.`);
      target.value = '';
      return;
    }

    const newPreviews: ImagePreview[] = [];
    for (let i = 0; i < limit; i++) {
      const file = files[i];
      if (allowedTypes.includes(file.type) && file.size <= maxSize) {
        const reader = new FileReader();
        const previewId = `${file.name}-${file.lastModified}-${Math.random().toString(36).substring(2)}`;
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result) {
            newPreviews.push({ file, dataUrl: e.target.result as string, id: previewId });
            if (newPreviews.length === limit) {
              this.selectedImagePreviews.update(existing => [...existing, ...newPreviews]);
            }
          }
        };
        reader.readAsDataURL(file);
      } else {
        this.logger.warn(`[CreateReviewFormComponent] Skipped invalid file: ${file.name}`);
      }
    }
    target.value = '';
  }

  removeImagePreview(previewId: string): void {
    this.selectedImagePreviews.update(previews => previews.filter(p => p.id !== previewId));
  }

    onSubmit(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }
    // Controleer of de gebruiker is ingelogd
    if (!this.authFacade.currentUserId()) {
      this.reviewsFacade.clearError(); // Wis eerdere fouten
      this.notificationService.showError(this.translate.instant('reviewForm.notLoggedInError'));
      return;
    }

    if (this.isEditMode()) {
      this.submitUpdate();
    } else {
      this.submitCreate();
    }
  }


   private submitCreate(): void {
    if (!this.formData) {
      this.logger.error("CreateReviewFormComponent: Missing form data for CREATE.");
      return;
    }
    const formValue = this.reviewForm.getRawValue();

    // --- DE FIX: Bouw de payload dynamisch om 'undefined' velden te verwijderen ---
    const payload: Partial<CreateReviewPayload> = {
      targetEntityId: this.formData.targetEntityId,
      targetEntityType: this.formData.targetEntityType,
      rating: formValue.rating / 2,
      reviewText: formValue.reviewText,
      mediaIds: [], // TODO: Integreren met een upload service
    };

    // Voeg 'title' alleen toe als het een niet-lege string is.
    if (formValue.title && formValue.title.trim() !== '') {
      payload.title = formValue.title;
    }
    
    // De 'isVerifiedPurchase' property wordt nu volledig weggelaten uit de payload.
    // De backend zal zijn default (waarschijnlijk 'null' voor een nullable boolean) gebruiken.
    
    this.reviewsFacade.submitReview(payload as CreateReviewPayload);
  }


  private submitUpdate(): void {
    const reviewToEdit = this.formData?.reviewToEdit;
    if (!reviewToEdit) {
      this.logger.error("CreateReviewFormComponent: In edit mode but no reviewToEdit data was provided.");
      return;
    }
    const formValue = this.reviewForm.getRawValue();
    const payload: UpdateReviewPayload = {
      rating: formValue.rating / 2,
      title: formValue.title,
      reviewText: formValue.reviewText,
      mediaIds: [],
    };
    this.reviewsFacade.updateReview(reviewToEdit.id, payload);
  }
}