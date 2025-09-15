/**
 * @file my-profile-page.component.ts
 * @Version 4.0.0 (Definitive Functional Implementation)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   De definitieve, functionele component voor het beheren van gebruikersprofielgegevens.
 *   Deze component laadt data via de facade, toont een formulier voor bewerking,
 *   en handelt updates af inclusief loading/error states.
 */
import { ChangeDetectionStrategy, Component, inject, OnInit, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum, UpdateUserProfilePayload } from '@royal-code/shared/domain';
import { UiCardComponent } from '@royal-code/ui/cards/card';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { UiIconComponent } from '@royal-code/ui/icon';

import { AccountFacade } from '@royal-code/features/account/core';
import { AppIcon } from '@royal-code/shared/domain';
import { UiTextareaComponent } from '@royal-code/ui/textarea';

@Component({
  selector: 'droneshop-my-profile-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, UiTitleComponent, UiCardComponent, UiButtonComponent, UiInputComponent, UiSpinnerComponent, UiTextareaComponent, UiIconComponent],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Avatar & Display Name Column -->
      <aside class="lg:col-span-1">
        <royal-code-ui-card class="text-center">
          <div class="relative w-32 h-32 mx-auto mb-4">
            <!-- Avatar Placeholder -->
            <div class="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary border border-border">
              <royal-code-ui-icon [icon]="AppIcon.User" sizeVariant="xl" />
            </div>
            <royal-code-ui-button type="primary" sizeVariant="icon" extraClasses="absolute bottom-0 right-0 !rounded-full">
              <royal-code-ui-icon [icon]="AppIcon.Camera" sizeVariant="sm" />
            </royal-code-ui-button>
          </div>
          @if(viewModel().profileDetails; as profile) {
            <h2 class="text-xl font-bold text-foreground">{{ profile.displayName }}</h2>
            <p class="text-sm text-secondary">{{ profile.email }}</p>
          }
        </royal-code-ui-card>
      </aside>

      <!-- Profile Form Column -->
      <main class="lg:col-span-2">
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
          <royal-code-ui-card>
            <div class="border-b border-border pb-4 mb-6">
              <royal-code-ui-title [level]="TitleTypeEnum.H2" [text]="'account.profile.personalData.title' | translate" />
              <p class="text-secondary text-sm mt-1">{{ 'account.profile.personalData.description' | translate }}</p>
            </div>

            @if (viewModel().isLoading) {
              <div class="flex justify-center items-center h-48"><royal-code-ui-spinner /></div>
            } @else {
              <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <royal-code-ui-input [label]="'common.forms.labels.firstName' | translate" formControlName="firstName" />
                  <royal-code-ui-input [label]="'common.forms.labels.lastName' | translate" formControlName="lastName" />
                </div>
                <royal-code-ui-input [label]="'common.forms.labels.middleName' | translate" formControlName="middleName" />
                <royal-code-ui-input [label]="'common.forms.labels.displayName' | translate" formControlName="displayName" [required]="true" />
             <royal-code-ui-textarea 
               [label]="'common.forms.labels.bio' | translate" 
               formControlName="bio" 
               [rows]="4" 
             />
              </div>
            }

            <div class="flex justify-end pt-6 mt-6 border-t border-border">
              <royal-code-ui-button type="primary" htmlType="submit" [disabled]="!canSave()">
                @if (viewModel().isSubmitting) {
                  <royal-code-ui-spinner size="sm" />
                } @else {
                  <span>{{ 'common.buttons.saveChanges' | translate }}</span>
                }
              </royal-code-ui-button>
            </div>
          </royal-code-ui-card>
        </form>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyProfilePageComponent implements OnInit {
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;
  private readonly facade = inject(AccountFacade);

  readonly viewModel = this.facade.viewModel;
  readonly canSave = computed(() => this.profileForm.valid && this.profileForm.dirty && !this.viewModel().isSubmitting);

profileForm = new FormGroup({
    firstName: new FormControl<string | null>(null),
    middleName: new FormControl<string | null>(null),
    lastName: new FormControl<string | null>(null),
    displayName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    bio: new FormControl<string | null>(null),
  });


  constructor() {
    effect(() => {
      const profile = this.viewModel().profileDetails;
      if (profile && this.profileForm.pristine) {
        this.profileForm.patchValue(profile);
      }
    });
  }

  ngOnInit(): void {
    this.facade.loadProfile();
  }

  onSubmit(): void {
    if (!this.canSave()) {
      return;
    }
    const payload: UpdateUserProfilePayload = this.profileForm.getRawValue();
    this.facade.updateProfile(payload);
    this.profileForm.markAsPristine();
  }
}