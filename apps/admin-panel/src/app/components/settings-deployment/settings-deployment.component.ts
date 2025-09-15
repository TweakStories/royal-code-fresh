/**
 * @file settings-deployment.component.ts
 * @Version 1.0.0
 * @Description Component for managing deployment and configuration management settings.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsDataService, DeploymentSettings } from '../../services/settings-data.service';
import { UiCardComponent } from '@royal-code/ui/cards/card';
import { SettingsFieldComponent } from '../settings-field/settings-field.component';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiToggleButtonComponent } from '@royal-code/ui/button';
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'admin-settings-deployment',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, UiCardComponent, SettingsFieldComponent,
    UiButtonComponent, UiToggleButtonComponent
  ],
  template: `
    <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
      <div class="space-y-6">
        <!-- Card 1: Feature Flags -->
        <royal-code-ui-card title="Feature Flags" description="Beheer de activering en deactivering van specifieke functionaliteiten.">
          <admin-settings-field label="Feature Flags Inschakelen" forInputId="feature-flags-enabled-toggle" helpText="Schakel het systeem voor feature flags in/uit.">
            <royal-code-ui-toggle-button formControlName="featureFlagsEnabled" label="Inschakelen" id="feature-flags-enabled-toggle" />
          </admin-settings-field>
          <div footer>
            <royal-code-ui-button type="primary" [disabled]="settingsForm.pristine || settingsForm.invalid">Opslaan</royal-code-ui-button>
          </div>
        </royal-code-ui-card>

        <!-- Card 2: Configuratie Versiebeheer -->
        <royal-code-ui-card title="Configuratie Versiebeheer" description="Beheer en herstel eerdere configuratieversies.">
          <admin-settings-field label="Configuratie Versiebeheer Inschakelen" forInputId="config-versioning-enabled-toggle" helpText="Houd verschillende versies van instellingen bij.">
            <royal-code-ui-toggle-button formControlName="configVersioningEnabled" label="Inschakelen" id="config-versioning-enabled-toggle" />
          </admin-settings-field>
          <admin-settings-field label="Staging naar Productie Migratie Wizard" forInputId="staging-to-prod-migration-wizard-toggle" helpText="Schakel de wizard in voor het overzetten van instellingen.">
            <royal-code-ui-toggle-button formControlName="stagingToProdMigrationWizardEnabled" label="Inschakelen" id="staging-to-prod-migration-wizard-toggle" />
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
export class SettingsDeploymentComponent implements OnInit {
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
      featureFlagsEnabled: [false],
      configVersioningEnabled: [false],
      stagingToProdMigrationWizardEnabled: [false],
    });
  }

  loadData(): void {
    this.settingsService.getDeploymentSettings().subscribe(data => {
      this.settingsForm.patchValue(data);
    });
  }

  saveSettings(): void {
    if (this.settingsForm.valid) {
      console.log('Dummy Save Deployment Settings:', this.settingsForm.value);
      this.settingsForm.markAsPristine();
      // Toon notificatie in echte implementatie
    }
  }
}