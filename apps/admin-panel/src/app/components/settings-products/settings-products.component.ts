/**
 * @file settings-products.component.ts
 * @Version 1.1.0 (Fixed SettingsCardComponent Import)
 * @Description Component for managing product and inventory settings, including drone-specific details.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsDataService, ProductSettings } from '../../services/settings-data.service';
import { SettingsFieldComponent } from '../settings-field/settings-field.component'; // Correcte relatieve import
import { UiInputComponent } from '@royal-code/ui/input';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiToggleButtonComponent } from '@royal-code/ui/button';
import { UiSelectComponent } from '@royal-code/ui/forms';
import { UiCardComponent } from '@royal-code/ui/cards/card'; // << DE FIX: Correcte import voor UiCardComponent >>

@Component({
  selector: 'admin-settings-products',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, UiCardComponent, SettingsFieldComponent,
    UiInputComponent, UiButtonComponent, UiToggleButtonComponent,
    UiSelectComponent
  ],
  template: `
    <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
      <div class="space-y-6">
        <!-- Card 1: Algemene Productinstellingen -->
        <royal-code-ui-card title="Algemene Productinstellingen" description="Standaard gedrag en weergave van producten.">
          <admin-settings-field label="Standaard Productstatus" helpText="Status van nieuwe producten na aanmaken.">
            <royal-code-ui-select 
              formControlName="defaultStatus" 
              [options]="productStatusOptions" 
              id="default-product-status" />
          </admin-settings-field>
          <admin-settings-field label="Globale Lage Voorraad Drempel" helpText="Trigger voor meldingen als de voorraad hieronder komt.">
            <royal-code-ui-input formControlName="lowStockThreshold" type="number" />
          </admin-settings-field>
          <div footer>
            <royal-code-ui-button type="primary" [disabled]="settingsForm.pristine || settingsForm.invalid">Opslaan</royal-code-ui-button>
          </div>
        </royal-code-ui-card>

        <!-- Card 2: Inventaris & Backorders -->
        <royal-code-ui-card title="Inventaris & Backorders" description="Beheer hoe de voorraad wordt bijgehouden en afgehandeld.">
          <admin-settings-field label="Voorraadbeheer Globaal Actief" forInputId="manage-stock-globally-toggle">
            <royal-code-ui-toggle-button formControlName="manageStockGlobally" label="Voorraadbeheer inschakelen" id="manage-stock-globally-toggle" />
          </admin-settings-field>
          <admin-settings-field label="Backorders Toestaan" forInputId="allow-backorders-toggle" helpText="Klanten kunnen bestellen, zelfs als een product niet op voorraad is.">
            <royal-code-ui-toggle-button formControlName="allowBackorders" label="Backorders toestaan" id="allow-backorders-toggle" />
          </admin-settings-field>
          <div footer>
            <royal-code-ui-button type="primary" [disabled]="settingsForm.pristine || settingsForm.invalid">Opslaan</royal-code-ui-button>
          </div>
        </royal-code-ui-card>

        <!-- Card 3: Reviews & Moderatie -->
        <royal-code-ui-card title="Reviews & Moderatie" description="Beheer hoe productreviews worden verzameld en getoond.">
          <admin-settings-field label="Reviews Inschakelen" forInputId="reviews-enabled-toggle">
            <royal-code-ui-toggle-button formControlName="reviewsEnabled" label="Reviews inschakelen" id="reviews-enabled-toggle" />
          </admin-settings-field>
          <admin-settings-field label="Reviews Automatisch Goedkeuren" forInputId="auto-approve-reviews-toggle" helpText="Nieuwe reviews worden direct gepubliceerd zonder handmatige moderatie.">
            <royal-code-ui-toggle-button formControlName="autoApproveReviews" label="Automatisch goedkeuren" id="auto-approve-reviews-toggle" />
          </admin-settings-field>
          <admin-settings-field label="Drempel Gevlagde Reviews" helpText="Aantal meldingen voordat een review automatisch wordt verborgen.">
            <royal-code-ui-input formControlName="flaggedReviewsThreshold" type="number" />
          </admin-settings-field>
          <div footer>
            <royal-code-ui-button type="primary" [disabled]="settingsForm.pristine || settingsForm.invalid">Opslaan</royal-code-ui-button>
          </div>
        </royal-code-ui-card>

        <!-- Card 4: Drone-specifieke Productdetails -->
        <royal-code-ui-card title="Drone Product Configuratie & Tracking" description="Instellingen voor drone-specifieke informatie en compliance.">
          <admin-settings-field label="Standaard EASA Classificatie" helpText="De standaard classificatie voor nieuwe drones.">
            <royal-code-ui-select 
              formControlName="droneDefaultEasaClassification" 
              [options]="easaClassificationOptions" 
              id="default-easa-classification" />
          </admin-settings-field>
          <admin-settings-field label="Firmware Versie Tracking Inschakelen" forInputId="firmware-tracking-toggle" helpText="Houd bij welke firmwareversies bij producten horen.">
            <royal-code-ui-toggle-button formControlName="droneFirmwareTrackingEnabled" label="Tracking inschakelen" id="firmware-tracking-toggle" />
          </admin-settings-field>
          <admin-settings-field label="Compatibiliteitsmatrix Inschakelen" forInputId="compatibility-matrix-toggle" helpText="Beheer compatibiliteit tussen drones, apps en accessoires.">
            <royal-code-ui-toggle-button formControlName="droneCompatibilityMatrixEnabled" label="Matrix inschakelen" id="compatibility-matrix-toggle" />
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
export class SettingsProductsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(SettingsDataService);

  settingsForm!: FormGroup;

  productStatusOptions = [
    { value: 'draft', label: 'Concept' },
    { value: 'published', label: 'Gepubliceerd' },
  ];

  easaClassificationOptions = [
    { value: 'C0', label: 'C0' },
    { value: 'C1', label: 'C1' },
    { value: 'C2', label: 'C2' },
    { value: 'C3', label: 'C3' },
    { value: 'C4', label: 'C4' },
    { value: 'OpenCategory', label: 'Open Categorie' },
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
  }

  initializeForm(): void {
    this.settingsForm = this.fb.group({
      defaultStatus: ['draft', Validators.required],
      manageStockGlobally: [true],
      lowStockThreshold: [10, [Validators.required, Validators.min(0)]],
      allowBackorders: [false],
      reviewsEnabled: [true],
      autoApproveReviews: [false],
      flaggedReviewsThreshold: [5, [Validators.required, Validators.min(0)]],
      droneDefaultEasaClassification: ['C0', Validators.required],
      droneFirmwareTrackingEnabled: [true],
      droneCompatibilityMatrixEnabled: [true],
    });
  }

  loadData(): void {
    this.settingsService.getProductSettings().subscribe(data => {
      this.settingsForm.patchValue(data);
    });
  }

  saveSettings(): void {
    if (this.settingsForm.valid) {
      console.log('Dummy Save Product Settings:', this.settingsForm.value);
      this.settingsForm.markAsPristine();
      // Toon notificatie in echte implementatie
    }
  }
}