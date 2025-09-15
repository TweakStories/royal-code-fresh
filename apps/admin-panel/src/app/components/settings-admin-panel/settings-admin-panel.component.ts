/**
 * @file settings-admin-panel.component.ts
 * @Version 1.0.0
 * @Description Component for managing settings specific to the Admin Panel itself.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsDataService, AdminPanelSettings } from '../../services/settings-data.service';
import { UiCardComponent } from '@royal-code/ui/cards/card';
import { SettingsFieldComponent } from '../settings-field/settings-field.component';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiToggleButtonComponent } from '@royal-code/ui/button';
import { UiSelectComponent } from '@royal-code/ui/forms';
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'admin-settings-admin-panel',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, UiCardComponent, SettingsFieldComponent,
    UiButtonComponent, UiToggleButtonComponent, UiSelectComponent
  ],
  template: `
    <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
      <div class="space-y-6">
        <!-- Card 1: Uiterlijk Admin Panel -->
        <royal-code-ui-card title="Uiterlijk Admin Panel" description="Personaliseer de look en feel van het Admin Panel.">
          <admin-settings-field label="Standaard Thema" helpText="Het standaard kleurschema voor het Admin Panel.">
            <royal-code-ui-select 
              formControlName="defaultTheme" 
              [options]="themeOptions" 
              id="admin-default-theme" />
          </admin-settings-field>
          <admin-settings-field label="Custom Branding Actief" forInputId="custom-branding-toggle" helpText="Schakel uw eigen logo en kleuren in.">
            <royal-code-ui-toggle-button formControlName="customBrandingEnabled" label="Activeren" id="custom-branding-toggle" />
          </admin-settings-field>
          <div footer>
            <royal-code-ui-button type="primary" [disabled]="settingsForm.pristine || settingsForm.invalid">Opslaan</royal-code-ui-button>
          </div>
        </royal-code-ui-card>

        <!-- Card 2: Notificaties Admin Panel -->
        <royal-code-ui-card title="Notificaties Admin Panel" description="Beheer welke meldingen beheerders ontvangen.">
          <div formGroupName="newOrderNotifications">
            <admin-settings-field label="Nieuwe Order Notificaties (E-mail)" forInputId="new-order-email-toggle">
              <royal-code-ui-toggle-button formControlName="email" label="E-mail" id="new-order-email-toggle" />
            </admin-settings-field>
            <admin-settings-field label="Nieuwe Order Notificaties (In-app)" forInputId="new-order-inapp-toggle">
              <royal-code-ui-toggle-button formControlName="inApp" label="In-app" id="new-order-inapp-toggle" />
            </admin-settings-field>
          </div>
          <div formGroupName="lowStockNotifications">
            <admin-settings-field label="Lage Voorraad Notificaties (E-mail)" forInputId="low-stock-email-toggle">
              <royal-code-ui-toggle-button formControlName="email" label="E-mail" id="low-stock-email-toggle" />
            </admin-settings-field>
            <admin-settings-field label="Lage Voorraad Notificaties (In-app)" forInputId="low-stock-inapp-toggle">
              <royal-code-ui-toggle-button formControlName="inApp" label="In-app" id="low-stock-inapp-toggle" />
            </admin-settings-field>
          </div>
          <div formGroupName="newReviewNotifications">
            <admin-settings-field label="Nieuwe Review Notificaties (E-mail)" forInputId="new-review-email-toggle">
              <royal-code-ui-toggle-button formControlName="email" label="E-mail" id="new-review-email-toggle" />
            </admin-settings-field>
            <admin-settings-field label="Nieuwe Review Notificaties (In-app)" forInputId="new-review-inapp-toggle">
              <royal-code-ui-toggle-button formControlName="inApp" label="In-app" id="new-review-inapp-toggle" />
            </admin-settings-field>
          </div>
          <div footer>
            <royal-code-ui-button type="primary" [disabled]="settingsForm.pristine || settingsForm.invalid">Opslaan</royal-code-ui-button>
          </div>
        </royal-code-ui-card>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsAdminPanelComponent implements OnInit {
  protected readonly AppIcon = AppIcon;
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsDataService);

  settingsForm!: FormGroup;

  themeOptions = [
    { value: 'light', label: 'Light Theme' },
    { value: 'dark', label: 'Dark Theme' },
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
  }

  initializeForm(): void {
    this.settingsForm = this.fb.group({
      defaultTheme: ['dark', Validators.required],
      customBrandingEnabled: [false],
      newOrderNotifications: this.fb.group({
        email: [true],
        inApp: [true],
      }),
      lowStockNotifications: this.fb.group({
        email: [false],
        inApp: [true],
      }),
      newReviewNotifications: this.fb.group({
        email: [true],
        inApp: [false],
      }),
    });
  }

  loadData(): void {
    this.settingsService.getAdminPanelSettings().subscribe(data => {
      this.settingsForm.patchValue(data);
    });
  }

  saveSettings(): void {
    if (this.settingsForm.valid) {
      console.log('Dummy Save Admin Panel Settings:', this.settingsForm.value);
      this.settingsForm.markAsPristine();
      // Toon notificatie in echte implementatie
    }
  }
}