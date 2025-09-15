/**
 * @file settings-compliance.component.ts
 * @Version 1.0.0
 * @Description Component for managing drone-specific compliance and regulatory settings.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsDataService, ComplianceSettings } from '../../services/settings-data.service';
import { UiCardComponent } from '@royal-code/ui/cards/card';
import { SettingsFieldComponent } from '../settings-field/settings-field.component';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiToggleButtonComponent } from '@royal-code/ui/button';
import { AppIcon } from '@royal-code/shared/domain';


@Component({
  selector: 'admin-settings-compliance',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, UiCardComponent, SettingsFieldComponent,
    UiInputComponent, UiButtonComponent, UiToggleButtonComponent
  ],
  template: `
    <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
      <div class="space-y-6">
        <!-- Card 1: Drone Registratie & Classificatie (EASA/FAA) -->
        <royal-code-ui-card title="Drone Registratie & Classificatie" description="Instellingen voor EASA/FAA regelgeving en identificatie.">
          <admin-settings-field label="EASA Classificatiebeheer Inschakelen" forInputId="easa-classification-toggle" helpText="Beheer classificatie (C0-C4) voor drones.">
            <royal-code-ui-toggle-button formControlName="easaClassificationManagementEnabled" label="Inschakelen" id="easa-classification-toggle" />
          </admin-settings-field>
          <admin-settings-field label="Operator ID Zichtbaarheid Vereisen" forInputId="operator-id-visibility-toggle" helpText="Verplicht tonen van operator ID op drones.">
            <royal-code-ui-toggle-button formControlName="requireOperatorIdVisibility" label="Vereisen" id="operator-id-visibility-toggle" />
          </admin-settings-field>
          <admin-settings-field label="Geo-awareness Informatie Actief" forInputId="geo-awareness-info-toggle" helpText="Toon informatie over no-fly zones en restricties.">
            <royal-code-ui-toggle-button formControlName="geoAwarenessInfoEnabled" label="Activeren" id="geo-awareness-info-toggle" />
          </admin-settings-field>
          <admin-settings-field label="Drone Registratie Vereist" forInputId="drone-registration-required-toggle" helpText="Klanten moeten drones registreren (indien van toepassing).">
            <royal-code-ui-toggle-button formControlName="droneRegistrationRequired" label="Vereisen" id="drone-registration-required-toggle" />
          </admin-settings-field>
          <div footer>
            <royal-code-ui-button type="primary" [disabled]="settingsForm.pristine || settingsForm.invalid">Opslaan</royal-code-ui-button>
          </div>
        </royal-code-ui-card>

        <!-- Card 2: Leeftijdsverificatie -->
        <royal-code-ui-card title="Leeftijdsverificatie" description="Verifieer de leeftijd van klanten voor specifieke producten.">
          <admin-settings-field label="Leeftijdsverificatie Inschakelen" forInputId="age-verification-enabled-toggle">
            <royal-code-ui-toggle-button formControlName="ageVerificationEnabled" label="Inschakelen" id="age-verification-enabled-toggle" />
          </admin-settings-field>
          <admin-settings-field label="Verificatie Drempel (jaren)" helpText="Minimale leeftijd voor leeftijd-gebonden producten.">
            <royal-code-ui-input formControlName="ageVerificationThreshold" type="number" />
          </admin-settings-field>
          <div footer>
            <royal-code-ui-button type="primary" [disabled]="settingsForm.pristine || settingsForm.invalid">Opslaan</royal-code-ui-button>
          </div>
        </royal-code-ui-card>
        
        <!-- Card 3: Export/Import & CE-markering -->
        <royal-code-ui-card title="Export/Import & CE-markering" description="Regelgeving voor internationale handel en productcertificering.">
          <admin-settings-field label="Export Restricties Actief" forInputId="export-restrictions-toggle" helpText="Pas restricties toe op export naar specifieke landen.">
            <royal-code-ui-toggle-button formControlName="exportRestrictionsEnabled" label="Activeren" id="export-restrictions-toggle" />
          </admin-settings-field>
          <admin-settings-field label="ITAR/Dual-Use Vlaggen Actief" forInputId="itar-dual-use-toggle" helpText="Beheer producten die onder ITAR/Dual-Use wetgeving vallen.">
            <royal-code-ui-toggle-button formControlName="itarDualUseFlagsEnabled" label="Activeren" id="itar-dual-use-toggle" />
          </admin-settings-field>
          <admin-settings-field label="CE-markering Verificatie Inschakelen" forInputId="ce-marking-verification-toggle" helpText="Verifieer CE-markering status van producten.">
            <royal-code-ui-toggle-button formControlName="ceMarkingVerificationEnabled" label="Inschakelen" id="ce-marking-verification-toggle" />
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
export class SettingsComplianceComponent implements OnInit {
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
      easaClassificationManagementEnabled: [false],
      requireOperatorIdVisibility: [false],
      geoAwarenessInfoEnabled: [false],
      droneRegistrationRequired: [false],
      ageVerificationEnabled: [false],
      ageVerificationThreshold: [18, [Validators.required, Validators.min(1)]],
      exportRestrictionsEnabled: [false],
      itarDualUseFlagsEnabled: [false],
      ceMarkingVerificationEnabled: [false],
    });
  }

  loadData(): void {
    this.settingsService.getComplianceSettings().subscribe(data => {
      this.settingsForm.patchValue(data);
    });
  }

  saveSettings(): void {
    if (this.settingsForm.valid) {
      console.log('Dummy Save Compliance Settings:', this.settingsForm.value);
      this.settingsForm.markAsPristine();
      // Toon notificatie in echte implementatie
    }
  }
}