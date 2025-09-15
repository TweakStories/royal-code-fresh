/**
 * @file contact-page.component.ts (CV App)
 * @version 3.0.0 (Formspree Integration - Production Ready)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-21
 * @Description
 *   De definitieve, productieklare contactpagina met Formspree-integratie.
 *   Deze versie is geoptimaliseerd voor security (honeypot), accessibility (fieldset/legend),
 *   en een robuuste gebruikerservaring met loading-states en auto-dismissing alerts.
 *   Verzending van e-mails wordt nu afgehandeld door de gratis Formspree service.
 */
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiTextareaComponent } from '@royal-code/ui/textarea';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Importeer HttpHeaders

@Component({
  selector: 'app-cv-contact-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, TranslateModule, UiTitleComponent, UiParagraphComponent,
    UiInputComponent, UiTextareaComponent, UiButtonComponent, UiIconComponent
  ],
  template: `
    <section class="contact-section container-max py-16 md:py-24">
      <royal-code-ui-title 
        [level]="TitleTypeEnum.H2" 
        [text]="'cv.contact.pageTitle' | translate" 
        [center]="true" 
        extraClasses="!text-3xl sm:!text-4xl font-bold mb-4" 
      />
      <royal-code-ui-paragraph 
        [text]="'cv.contact.intro' | translate" 
        [centered]="true" 
        size="lg" 
        color="muted"
        extraClasses="max-w-3xl mx-auto mb-12"
      />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <!-- Linkerkolom: Direct Contact & Links -->
        <div class="space-y-8">
          <div>
            <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.contact.directContactTitle' | translate" extraClasses="!text-xl !font-semibold mb-4" />
            <div class="space-y-4">
              <a href="mailto:royvandewetering@gmail.com" class="flex items-center gap-3 text-secondary hover:text-primary transition-colors">
                <royal-code-ui-icon [icon]="AppIcon.Mail" sizeVariant="md" />
                <span>royvandewetering@gmail.com</span>
              </a>
              <a href="tel:+31612345678" class="flex items-center gap-3 text-secondary hover:text-primary transition-colors">
                <royal-code-ui-icon [icon]="AppIcon.Phone" sizeVariant="md" />
                <span>+31 6 4072 1378</span>
              </a>
              <a href="https://www.linkedin.com/in/rvdwp/" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 text-secondary hover:text-primary transition-colors">
                <royal-code-ui-icon [icon]="AppIcon.Linkedin" sizeVariant="md" />
                <span>LinkedIn Profiel</span>
              </a>
              <a href="https://github.com/TweakStories" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 text-secondary hover:text-primary transition-colors">
                <royal-code-ui-icon [icon]="AppIcon.Github" sizeVariant="md" />
                <span>GitHub Profiel</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Rechterkolom: Contactformulier -->
        <div>
          <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.contact.formTitle' | translate" extraClasses="!text-xl !font-semibold mb-4" />
           <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-4">
            
            <royal-code-ui-input [label]="'cv.contact.form.nameLabel' | translate" formControlName="name" [required]="true" [error]="getErrorMessage('name')" />
            <royal-code-ui-input [label]="'cv.contact.form.emailLabel' | translate" formControlName="email" type="email" [required]="true" [error]="getErrorMessage('email')" />

            <fieldset class="border-none p-0 m-0">
              <legend class="block text-sm font-medium text-secondary mb-1.5 flex items-center">
                {{ 'cv.contact.form.challengeLabel' | translate }} 
                <span class="text-xs text-muted-foreground ml-2">({{ 'cv.contact.form.optional' | translate }})</span>
              </legend>
              <div class="grid grid-cols-2 gap-2">
                @for (challenge of challenges; track challenge.key) {
                  <label class="flex items-center gap-2 p-2 border border-border rounded-md hover:bg-hover cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                    <input type="checkbox" [formControlName]="challenge.key" class="accent-primary"/>
                    <span class="text-sm">{{ challenge.labelKey | translate }}</span>
                  </label>
                }
              </div>
            </fieldset>

            <royal-code-ui-textarea [label]="'cv.contact.form.messageLabel' | translate" formControlName="message" [required]="true" [rows]="4" [error]="getErrorMessage('message')" />
            
            <!-- Honeypot field for bot protection -->
            <input type="text" formControlName="verifyme" class="sr-only" aria-hidden="true" tabindex="-1" autocomplete="off" class="mb-4">

            <royal-code-ui-button type="primary" htmlType="submit" [disabled]="contactForm.invalid || isSubmitting()" [loading]="isSubmitting()" extraClasses="w-full">
              {{ 'cv.contact.form.submitButton' | translate }}
            </royal-code-ui-button>
          </form>

          @if (formSubmitted() && !formError()) {
            <div class="mt-4 p-3 bg-success/10 border border-success/20 rounded-md text-sm text-success flex items-center gap-2">
              <royal-code-ui-icon [icon]="AppIcon.CheckCircle" />
              <span>{{ 'cv.contact.form.successMessage' | translate }}</span>
            </div>
          } @else if (formSubmitted() && formError()) {
             <div class="mt-4 p-3 bg-error/10 border border-error/20 rounded-md text-sm text-error flex items-center gap-2">
              <royal-code-ui-icon [icon]="AppIcon.AlertTriangle" />
              <span>{{ 'cv.contact.form.errorMessage' | translate }}</span>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPageComponent {
  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;

  readonly challenges = [
    { key: 'challengeSlowDev', labelKey: 'cv.contact.form.challenges.slowDev' },
    { key: 'challengeLegacy', labelKey: 'cv.contact.form.challenges.legacy' },
    { key: 'challengeScaling', labelKey: 'cv.contact.form.challenges.scaling' },
    { key: 'challengeAI', labelKey: 'cv.contact.form.challenges.ai' },
  ] as const;

  contactForm: FormGroup;

  readonly isSubmitting = signal(false);
  readonly formSubmitted = signal(false);
  readonly formError = signal(false);
  private alertTimeout?: number;

  constructor(private http: HttpClient) {
    const formControls: { [key: string]: FormControl } = {
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      message: new FormControl('', [Validators.required, Validators.maxLength(2000)]),
      verifyme: new FormControl(''), 
    };
    this.challenges.forEach(challenge => {
      formControls[challenge.key] = new FormControl(false);
    });
    this.contactForm = new FormGroup(formControls);
  }

  async onSubmit(): Promise<void> {
    this.formSubmitted.set(false);
    this.formError.set(false);
    clearTimeout(this.alertTimeout);

    if (this.contactForm.invalid || this.contactForm.value.verifyme) {
      this.contactForm.markAllAsTouched();
      if (this.contactForm.value.verifyme) {
        console.warn('Honeypot field was filled. Submission blocked.');
      }
      return;
    }

    this.isSubmitting.set(true);

    const formspreeEndpoint = 'https://formspree.io/f/xblkvqll'; // Uw Formspree URL
    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });
    
    const formData = {
      name: this.contactForm.value.name,
      email: this.contactForm.value.email,
      message: this.contactForm.value.message,
      // Voeg de challenge-data toe voor context in uw e-mail
      challenges: this.challenges
        .filter(c => this.contactForm.value[c.key])
        .map(c => c.labelKey)
        .join(', ')
    };

    try {
      await this.http.post(formspreeEndpoint, formData, { headers }).toPromise();
      
      this.trackAnalytics('contact_form_submit_formspree', {
        challenges: formData.challenges
      });

      this.formSubmitted.set(true);
      this.contactForm.reset();
    } catch (e) {
      console.error('Formspree submission failed:', e);
      this.formError.set(true);
      this.formSubmitted.set(true);
    } finally {
      this.isSubmitting.set(false);
      this.alertTimeout = window.setTimeout(() => this.formSubmitted.set(false), 6000);
    }
  }
  
  trackAnalytics(eventName: string, data: any): void {
    if (!environment.production) {
      console.debug(`[ANALYTICS] Event: ${eventName}`, data);
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.contactForm.get(controlName);
    if (control?.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) return 'common.forms.errors.requiredField';
      if (control.errors?.['email']) return 'common.forms.errors.invalidEmail';
    }
    return '';
  }
}