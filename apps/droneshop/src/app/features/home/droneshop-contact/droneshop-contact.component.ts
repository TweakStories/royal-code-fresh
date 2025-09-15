/**
 * @file droneshop-contact.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-09
 * @Description Component for the contact page, including contact details and a form.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiTextareaComponent } from '@royal-code/ui/textarea';
import { UiButtonComponent } from '@royal-code/ui/button';

@Component({
  selector: 'droneshop-contact',
  standalone: true,
  imports: [
    CommonModule, TranslateModule, ReactiveFormsModule,
    UiTitleComponent, UiParagraphComponent, UiIconComponent,
    UiInputComponent, UiTextareaComponent, UiButtonComponent
  ],
  template: `
    <div class="container-max py-12 px-4">
      <header class="text-center mb-12">
        <royal-code-ui-title
          [level]="TitleTypeEnum.H1"
          [text]="'droneshop.contact.title' | translate"
          extraClasses="!text-4xl !font-bold mb-4"
        />
        <royal-code-ui-paragraph color="muted" extraClasses="max-w-2xl mx-auto">
          {{ 'droneshop.contact.subtitle' | translate }}
        </royal-code-ui-paragraph>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <!-- Contact Details -->
        <div class="space-y-6">
          <div class="flex items-start gap-4">
            <royal-code-ui-icon [icon]="AppIcon.MapPin" sizeVariant="lg" extraClass="text-primary mt-1" />
            <div>
              <h3 class="font-semibold text-foreground">{{ 'droneshop.contact.addressTitle' | translate }}</h3>
              <p class="text-secondary">Katwijk aan Zee</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <royal-code-ui-icon [icon]="AppIcon.Mail" sizeVariant="lg" extraClass="text-primary mt-1" />
            <div>
              <h3 class="font-semibold text-foreground">{{ 'droneshop.contact.emailTitle' | translate }}</h3>
              <a href="mailto:info@droneshop.com" class="text-secondary hover:text-primary">roy_wetering@outlook.com</a>
            </div>
          </div>
         <!--  <div class="flex items-start gap-4">
            <royal-code-ui-icon [icon]="AppIcon.Phone" sizeVariant="lg" extraClass="text-primary mt-1" />
            <div>
              <h3 class="font-semibold text-foreground">{{ 'droneshop.contact.phoneTitle' | translate }}</h3>
              <a href="tel:+31612345678" class="text-secondary hover:text-primary">+31 6 12345678</a>
            </div> 
          </div>-->
        </div>

        <!-- Contact Form -->
        <form class="space-y-4 bg-surface-alt p-8 rounded-lg border border-border">
          <royal-code-ui-input
            [label]="'droneshop.contact.form.nameLabel' | translate"
            [placeholder]="'droneshop.contact.form.namePlaceholder' | translate"
            [required]="true"
          />
          <royal-code-ui-input
            type="email"
            [label]="'droneshop.contact.form.emailLabel' | translate"
            [placeholder]="'droneshop.contact.form.emailPlaceholder' | translate"
            [required]="true"
          />
          <royal-code-ui-input
            [label]="'droneshop.contact.form.subjectLabel' | translate"
            [placeholder]="'droneshop.contact.form.subjectPlaceholder' | translate"
            [required]="true"
          />
          <royal-code-ui-textarea
            [label]="'droneshop.contact.form.messageLabel' | translate"
            [placeholder]="'droneshop.contact.form.messagePlaceholder' | translate"
            [rows]="5"
            [required]="true"
          />
          <royal-code-ui-button type="primary" [isFullWidth]="true" htmlType="submit">
            {{ 'droneshop.contact.form.submitButton' | translate }}
          </royal-code-ui-button>
        </form>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DroneshopContactComponent {
  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;
}