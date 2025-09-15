/**
 * @file settings-general.component.ts
 * @Version 1.2.0 (Fixed SettingsCardComponent Import & UiToggleButtonComponent Label)
 * @Description Component for managing general shop settings.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsDataService, GeneralSettings } from '../../services/settings-data.service';
import { SettingsFieldComponent } from '../settings-field/settings-field.component'; // Correcte relatieve import
import { UiInputComponent } from '@royal-code/ui/input';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiToggleButtonComponent } from '@royal-code/ui/button';
import { AppIcon } from '@royal-code/shared/domain';
import { UiCardComponent } from '@royal-code/ui/cards/card'; // << DE FIX: Correcte import voor UiCardComponent >>

@Component({
  selector: 'admin-settings-general',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, UiCardComponent, SettingsFieldComponent,
    UiInputComponent, UiButtonComponent, UiToggleButtonComponent
  ],
  template: `
    <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
      <div class="space-y-6">
        <!-- Card 1: Winkel Details -->
        <royal-code-ui-card title="Winkel Details" description="Basisgegevens van uw webshop.">
          <admin-settings-field label="Winkelnaam" helpText="De naam die klanten zien.">
            <royal-code-ui-input formControlName="shopName" />
          </admin-settings-field>
          <admin-settings-field label="Contact E-mailadres" helpText="Voor klantcontact en systeemmeldingen.">
            <royal-code-ui-input formControlName="contactEmail" type="email" />
          </admin-settings-field>
          <admin-settings-field label="Telefoonnummer Klantenservice" helpText="Optioneel, voor weergave op contactpagina.">
            <royal-code-ui-input formControlName="customerServicePhone" />
          </admin-settings-field>
          <admin-settings-field label="Bedrijfsadres" helpText="Geregistreerd adres, gebruikt voor facturen.">
            <royal-code-ui-input formControlName="companyAddress" />
          </admin-settings-field>
          <div footer>
            <royal-code-ui-button type="primary" [disabled]="settingsForm.pristine || settingsForm.invalid">Opslaan</royal-code-ui-button>
          </div>
        </royal-code-ui-card>

        <!-- Card 2: Lokalisatie -->
        <royal-code-ui-card title="Lokalisatie" description="Valuta, taal en regio instellingen.">
          <admin-settings-field label="Standaard Valuta" helpText="De valuta waarin prijzen worden getoond.">
            <royal-code-ui-input formControlName="defaultCurrency" />
          </admin-settings-field>
          <admin-settings-field label="Standaard Taal" helpText="De taal waarin de shop standaard wordt geladen.">
            <royal-code-ui-input formControlName="defaultLanguage" />
          </admin-settings-field>
          <div footer>
            <royal-code-ui-button type="primary" [disabled]="settingsForm.pristine || settingsForm.invalid">Opslaan</royal-code-ui-button>
          </div>
        </royal-code-ui-card>
        
        <!-- Card 3: Juridische Pagina's -->
        <royal-code-ui-card title="Juridische Documenten" description="Links naar uw algemene voorwaarden, privacybeleid en retourbeleid.">
          <div formGroupName="legalUrls">
            <admin-settings-field label="Algemene Voorwaarden URL">
              <royal-code-ui-input formControlName="termsOfService" placeholder="/legal/terms-of-service" />
            </admin-settings-field>
            <admin-settings-field label="Privacybeleid URL">
              <royal-code-ui-input formControlName="privacyPolicy" placeholder="/legal/privacy-policy" />
            </admin-settings-field>
             <admin-settings-field label="Retourbeleid URL">
              <royal-code-ui-input formControlName="returnPolicy" placeholder="/legal/return-policy" />
            </admin-settings-field>
          </div>
           <div footer>
            <royal-code-ui-button type="primary" [disabled]="settingsForm.pristine || settingsForm.invalid">Opslaan</royal-code-ui-button>
          </div>
        </royal-code-ui-card>

        <!-- Card 4: Onderhoudsmodus -->
        <royal-code-ui-card title="Onderhoudsmodus" description="Schakel de frontend tijdelijk uit voor bezoekers.">
          <div formGroupName="maintenanceMode">
            <admin-settings-field label="Onderhoudsmodus Actief" forInputId="maintenance-mode-toggle">
              <royal-code-ui-toggle-button formControlName="enabled" label="Modus inschakelen" id="maintenance-mode-toggle" />
            </admin-settings-field>
            <admin-settings-field label="Onderhoudsbericht" helpText="Bericht dat wordt getoond aan bezoekers.">
              <royal-code-ui-input formControlName="message" />
            </admin-settings-field>
            <admin-settings-field label="Toegestane IP-adressen" helpText="Komma-gescheiden lijst van IP-adressen die de site wel mogen zien.">
              <royal-code-ui-input formControlName="allowedIpAddresses" />
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
export class SettingsGeneralComponent implements OnInit {
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
      shopName: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      customerServicePhone: [''],
      companyAddress: ['', Validators.required],
      defaultLanguage: ['nl', Validators.required],
      defaultCurrency: ['EUR', Validators.required],
      legalUrls: this.fb.group({
        termsOfService: [''],
        privacyPolicy: [''],
        returnPolicy: [''],
      }),
      maintenanceMode: this.fb.group({
        enabled: [false],
        message: [''],
        allowedIpAddresses: [''],
      }),
    });
  }

  loadData(): void {
    this.settingsService.getGeneralSettings().subscribe(data => {
      this.settingsForm.patchValue(data);
    });
  }

  saveSettings(): void {
    if (this.settingsForm.valid) {
      console.log('Dummy Save:', this.settingsForm.value);
      this.settingsForm.markAsPristine();
      // Toon notificatie in echte implementatie
    }
  }
}