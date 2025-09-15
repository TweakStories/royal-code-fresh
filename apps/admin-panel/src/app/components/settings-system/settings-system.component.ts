/**
 * @file settings-system.component.ts
 * @Version 1.0.0
 * @Description Component for managing system and technical settings.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsDataService, SystemSettings } from '../../services/settings-data.service';
import { UiCardComponent } from '@royal-code/ui/cards/card';
import { SettingsFieldComponent } from '../settings-field/settings-field.component';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiToggleButtonComponent } from '@royal-code/ui/button';
import { UiSelectComponent } from '@royal-code/ui/forms';
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'admin-settings-system',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, UiCardComponent, SettingsFieldComponent,
    UiInputComponent, UiButtonComponent, UiToggleButtonComponent,
    UiSelectComponent
  ],
  template: `
    <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
      <div class="space-y-6">
        <!-- Card 1: Logging & Monitoring -->
        <royal-code-ui-card title="Logging & Monitoring" description="Configureer systeemlogs en externe monitoring.">
          <admin-settings-field label="Globaal Log Niveau" helpText="Het detailniveau voor applicatielogs.">
            <royal-code-ui-select 
              formControlName="globalLogLevel" 
              [options]="logLevelOptions" 
              id="global-log-level" />
          </admin-settings-field>
          <admin-settings-field label="Sentry DSN" helpText="Distributed Sentry Tracking ID voor error monitoring.">
            <royal-code-ui-input formControlName="sentryDsn" type="password" />
          </admin-settings-field>
          <admin-settings-field label="API Health Check Inschakelen" forInputId="api-health-check-toggle" helpText="Actieve monitoring van backend API's.">
            <royal-code-ui-toggle-button formControlName="apiHealthCheckEnabled" label="Inschakelen" id="api-health-check-toggle" />
          </admin-settings-field>
          <admin-settings-field label="Cron Job Monitoring Inschakelen" forInputId="cron-job-monitoring-toggle" helpText="Houd geplande taken in de gaten.">
            <royal-code-ui-toggle-button formControlName="cronJobMonitoringEnabled" label="Inschakelen" id="cron-job-monitoring-toggle" />
          </admin-settings-field>
          <div footer>
            <royal-code-ui-button type="primary" [disabled]="settingsForm.pristine || settingsForm.invalid">Opslaan</royal-code-ui-button>
          </div>
        </royal-code-ui-card>

        <!-- Card 2: Cache Beheer -->
        <royal-code-ui-card title="Cache Beheer" description="Beheer hoe en hoe lang data in de cache wordt bewaard.">
          <admin-settings-field label="Frontend Cache Leegknop Actief" forInputId="frontend-cache-clear-toggle" helpText="Toon knop om browser-cache te legen.">
            <royal-code-ui-toggle-button formControlName="frontendCacheClearButtonEnabled" label="Activeren" id="frontend-cache-clear-toggle" />
          </admin-settings-field>
          <admin-settings-field label="Backend Cache Leegknop Actief" forInputId="backend-cache-clear-toggle" helpText="Toon knop om server-cache te legen.">
            <royal-code-ui-toggle-button formControlName="backendCacheClearButtonEnabled" label="Activeren" id="backend-cache-clear-toggle" />
          </admin-settings-field>
          <admin-settings-field label="Standaard Cache Duur (min)" helpText="De standaard duur voor gecachte data.">
            <royal-code-ui-input formControlName="defaultCacheDurationMinutes" type="number" />
          </admin-settings-field>
          <div footer>
            <royal-code-ui-button type="primary" [disabled]="settingsForm.pristine || settingsForm.invalid">Opslaan</royal-code-ui-button>
          </div>
        </royal-code-ui-card>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsSystemComponent implements OnInit {
  protected readonly AppIcon = AppIcon;
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsDataService);

  settingsForm!: FormGroup;

  logLevelOptions = [
    { value: 'Debug', label: 'Debug' },
    { value: 'Info', label: 'Info' },
    { value: 'Warning', label: 'Waarschuwing' },
    { value: 'Error', label: 'Fout' },
    { value: 'Critical', label: 'Kritiek' },
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
  }

  initializeForm(): void {
    this.settingsForm = this.fb.group({
      globalLogLevel: ['Info', Validators.required],
      sentryDsn: [''],
      frontendCacheClearButtonEnabled: [true],
      backendCacheClearButtonEnabled: [true],
      defaultCacheDurationMinutes: [60, [Validators.required, Validators.min(0)]],
      apiHealthCheckEnabled: [true],
      cronJobMonitoringEnabled: [true],
    });
  }

  loadData(): void {
    this.settingsService.getSystemSettings().subscribe(data => {
      this.settingsForm.patchValue(data);
    });
  }

  saveSettings(): void {
    if (this.settingsForm.valid) {
      console.log('Dummy Save System Settings:', this.settingsForm.value);
      this.settingsForm.markAsPristine();
      // Toon notificatie in echte implementatie
    }
  }
}