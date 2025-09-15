/**
 * @file settings-security.component.ts
 * @Version 1.0.0
 * @Description Component for managing security and user account settings.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsDataService, SecuritySettings } from '../../services/settings-data.service';
import { UiCardComponent } from '@royal-code/ui/cards/card'; // << DE FIX: Correcte import >>
import { SettingsFieldComponent } from '../settings-field/settings-field.component'; // Correcte relatieve import
import { UiInputComponent } from '@royal-code/ui/input';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiToggleButtonComponent } from '@royal-code/ui/button';
import { UiSelectComponent } from '@royal-code/ui/forms';
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'admin-settings-security',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, UiCardComponent, SettingsFieldComponent,
    UiInputComponent, UiButtonComponent, UiToggleButtonComponent,
    UiSelectComponent
  ],
  template: `
    <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
      <div class="space-y-6">
        <!-- Card 1: Registratie & Authenticatie -->
        <royal-code-ui-card title="Registratie & Authenticatie" description="Instellingen voor gebruikersregistratie en -verificatie.">
          <admin-settings-field label="Openbare Registratie Toestaan" forInputId="allow-public-registration-toggle" helpText="Laat nieuwe gebruikers zichzelf registreren.">
            <royal-code-ui-toggle-button formControlName="allowPublicRegistration" label="Toestaan" id="allow-public-registration-toggle" />
          </admin-settings-field>
          <admin-settings-field label="E-mail Verificatie Vereisen" forInputId="require-email-verification-toggle" helpText="Gebruikers moeten hun e-mail verifiëren.">
            <royal-code-ui-toggle-button formControlName="requireEmailVerification" label="Vereisen" id="require-email-verification-toggle" />
          </admin-settings-field>
          <admin-settings-field label="Standaard Gebruikersrol" helpText="De rol die nieuwe gebruikers automatisch krijgen toegewezen.">
            <royal-code-ui-select 
              formControlName="defaultUserRole" 
              [options]="userRoleOptions" 
              id="default-user-role" />
          </admin-settings-field>
          <div footer>
            <royal-code-ui-button type="primary" [disabled]="settingsForm.pristine || settingsForm.invalid">Opslaan</royal-code-ui-button>
          </div>
        </royal-code-ui-card>

        <!-- Card 2: Wachtwoordbeleid -->
        <royal-code-ui-card title="Wachtwoordbeleid" description="Definieer de complexiteitseisen voor gebruikerswachtwoorden.">
          <div formGroupName="passwordPolicy">
            <admin-settings-field label="Minimale Lengte" helpText="Minimaal aantal karakters.">
              <royal-code-ui-input formControlName="minLength" type="number" />
            </admin-settings-field>
            <admin-settings-field label="Hoofdletters Vereisen" forInputId="require-uppercase-toggle">
              <royal-code-ui-toggle-button formControlName="requireUppercase" label="Vereisen" id="require-uppercase-toggle" />
            </admin-settings-field>
            <admin-settings-field label="Kleine letters Vereisen" forInputId="require-lowercase-toggle">
              <royal-code-ui-toggle-button formControlName="requireLowercase" label="Vereisen" id="require-lowercase-toggle" />
            </admin-settings-field>
            <admin-settings-field label="Cijfers Vereisen" forInputId="require-numbers-toggle">
              <royal-code-ui-toggle-button formControlName="requireNumbers" label="Vereisen" id="require-numbers-toggle" />
            </admin-settings-field>
            <admin-settings-field label="Symbolen Vereisen" forInputId="require-symbols-toggle">
              <royal-code-ui-toggle-button formControlName="requireSymbols" label="Vereisen" id="require-symbols-toggle" />
            </admin-settings-field>
          </div>
          <div footer>
            <royal-code-ui-button type="primary" [disabled]="settingsForm.pristine || settingsForm.invalid">Opslaan</royal-code-ui-button>
          </div>
        </royal-code-ui-card>
        
        <!-- Card 3: Admin Toegangsbeveiliging -->
        <royal-code-ui-card title="Admin Toegangsbeveiliging" description="Specifieke beveiligingsinstellingen voor het Admin Panel.">
          <admin-settings-field label="Toegestane IP-adressen" helpText="Komma-gescheiden lijst van IP-adressen die toegang hebben tot het Admin Panel.">
            <royal-code-ui-input formControlName="adminIpAllowlist" />
          </admin-settings-field>
          <admin-settings-field label="Admin Sessie Timeout (min)" helpText="Duur van een inactieve sessie voordat opnieuw moet worden ingelogd.">
            <royal-code-ui-input formControlName="adminSessionTimeoutMinutes" type="number" />
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
export class SettingsSecurityComponent implements OnInit {
  protected readonly AppIcon = AppIcon;
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsDataService);

  settingsForm!: FormGroup;

  // Dummy rollen, later uit een facade/API
  userRoleOptions = [
    { value: 'Customer', label: 'Klant' },
    { value: 'Admin', label: 'Administrator' },
    { value: 'Moderator', label: 'Moderator' },
    { value: 'Warehouse', label: 'Magazijn' },
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
  }

  initializeForm(): void {
    this.settingsForm = this.fb.group({
      allowPublicRegistration: [true],
      requireEmailVerification: [false],
      defaultUserRole: ['Customer', Validators.required],
      passwordPolicy: this.fb.group({
        minLength: [12, [Validators.required, Validators.min(8)]],
        requireUppercase: [true],
        requireLowercase: [true],
        requireNumbers: [true],
        requireSymbols: [false],
      }),
      adminIpAllowlist: [''],
      adminSessionTimeoutMinutes: [30, [Validators.required, Validators.min(5)]],
    });
  }

  loadData(): void {
    this.settingsService.getSecuritySettings().subscribe(data => {
      this.settingsForm.patchValue(data);
    });
  }

  saveSettings(): void {
    if (this.settingsForm.valid) {
      console.log('Dummy Save Security Settings:', this.settingsForm.value);
      this.settingsForm.markAsPristine();
      // Toon notificatie in echte implementatie
    }
  }
}