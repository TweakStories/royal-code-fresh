/**
 * @file settings-marketing.component.ts
 * @Version 1.0.0
 * @Description Component for managing marketing and SEO settings.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { SettingsDataService, MarketingSettings } from '../../services/settings-data.service';
import { UiCardComponent } from '@royal-code/ui/cards/card';
import { SettingsFieldComponent } from '../settings-field/settings-field.component';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiToggleButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';


@Component({
  selector: 'admin-settings-marketing',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, UiCardComponent, SettingsFieldComponent,
    UiInputComponent, UiButtonComponent, UiToggleButtonComponent,
    UiIconComponent
  ],
  template: `
    <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
      <div class="space-y-6">
        <!-- Card 1: Tracking & Analyse -->
        <royal-code-ui-card title="Tracking & Analyse" description="Integratie met externe tracking- en analysehulpmiddelen.">
          <admin-settings-field label="Google Analytics Tracking ID" helpText="Voor Google Universal Analytics (UA-XXXXX-Y).">
            <royal-code-ui-input formControlName="googleAnalyticsId" />
          </admin-settings-field>
          <admin-settings-field label="Google Tag Manager Container ID" helpText="Voor Google Tag Manager (GTM-XXXXXX).">
            <royal-code-ui-input formControlName="googleTagManagerId" />
          </admin-settings-field>
          <div footer>
            <royal-code-ui-button type="primary" [disabled]="settingsForm.pristine || settingsForm.invalid">Opslaan</royal-code-ui-button>
          </div>
        </royal-code-ui-card>

        <!-- Card 2: SEO Standaarden -->
        <royal-code-ui-card title="SEO Standaarden" description="Standaard meta-informatie voor zoekmachines.">
          <admin-settings-field label="Standaard Meta Titel" helpText="De titel voor pagina's zonder specifieke SEO-titel.">
            <royal-code-ui-input formControlName="defaultMetaTitle" />
          </admin-settings-field>
          <admin-settings-field label="Standaard Meta Beschrijving" helpText="De beschrijving voor pagina's zonder specifieke SEO-beschrijving.">
            <royal-code-ui-input formControlName="defaultMetaDescription" />
          </admin-settings-field>
          <admin-settings-field label="Globale Meta Trefwoorden" helpText="Komma-gescheiden lijst van trefwoorden.">
            <royal-code-ui-input formControlName="globalMetaKeywords" />
          </admin-settings-field>
          <admin-settings-field label="Sitemap Automatisch Genereren" forInputId="sitemap-auto-generate-toggle" helpText="Schakel het automatisch genereren van een sitemap in.">
            <royal-code-ui-toggle-button formControlName="sitemapAutoGenerate" label="Inschakelen" id="sitemap-auto-generate-toggle" />
          </admin-settings-field>
          <div footer>
            <royal-code-ui-button type="primary" [disabled]="settingsForm.pristine || settingsForm.invalid">Opslaan</royal-code-ui-button>
          </div>
        </royal-code-ui-card>

        <!-- Card 3: Social Media Links -->
        <royal-code-ui-card title="Social Media Links" description="Links naar uw sociale media profielen.">
          <div formArrayName="socialMediaLinks" class="space-y-3">
            @for (link of socialMediaLinks.controls; track link.get('platform')?.value; let i = $index) {
              <div [formGroupName]="i" class="flex items-center gap-2">
                <royal-code-ui-input [label]="link.get('platform')?.value + ' URL'" formControlName="url" class="flex-grow" />
                <royal-code-ui-button type="fire" sizeVariant="icon" (clicked)="removeSocialMediaLink(i)">
                  <royal-code-ui-icon [icon]="AppIcon.Trash2" />
                </royal-code-ui-button>
              </div>
            }
          </div>
          <royal-code-ui-button type="outline" sizeVariant="sm" (clicked)="addSocialMediaLink()" class="mt-4">
            <royal-code-ui-icon [icon]="AppIcon.Plus" class="mr-2" /> Link Toevoegen
          </royal-code-ui-button>
          <div footer>
            <royal-code-ui-button type="primary" [disabled]="settingsForm.pristine || settingsForm.invalid">Opslaan</royal-code-ui-button>
          </div>
        </royal-code-ui-card>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsMarketingComponent implements OnInit {
  protected readonly AppIcon = AppIcon;
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsDataService);

  settingsForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
  }

  initializeForm(): void {
    this.settingsForm = this.fb.group({
      googleAnalyticsId: [''],
      googleTagManagerId: [''],
      defaultMetaTitle: [''],
      defaultMetaDescription: [''],
      globalMetaKeywords: [''],
      sitemapAutoGenerate: [true],
      socialMediaLinks: this.fb.array([]),
    });
  }

  get socialMediaLinks() {
    return this.settingsForm.get('socialMediaLinks') as FormArray;
  }

  loadData(): void {
    this.settingsService.getMarketingSettings().subscribe(data => {
      this.settingsForm.patchValue(data);
      this.socialMediaLinks.clear();
      data.socialMediaLinks.forEach(link => this.socialMediaLinks.push(this.fb.group(link)));
    });
  }

  addSocialMediaLink(): void {
    this.socialMediaLinks.push(this.fb.group({ platform: ['New Platform', Validators.required], url: ['', Validators.required] }));
  }

  removeSocialMediaLink(index: number): void {
    this.socialMediaLinks.removeAt(index);
  }

  saveSettings(): void {
    if (this.settingsForm.valid) {
      console.log('Dummy Save Marketing Settings:', this.settingsForm.value);
      this.settingsForm.markAsPristine();
      // Toon notificatie in echte implementatie
    }
  }
}