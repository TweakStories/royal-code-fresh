/**
 * @file settings-orders.component.ts
 * @Version 1.0.0
 * @Description Component for managing order and checkout settings, including drone-specific shipping.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsDataService, OrderSettings } from '../../services/settings-data.service';
import { UiCardComponent } from '@royal-code/ui/cards/card'; // << DE FIX: Correcte import >>
import { SettingsFieldComponent } from '../settings-field/settings-field.component'; // Correcte relatieve import
import { UiInputComponent } from '@royal-code/ui/input';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiToggleButtonComponent } from '@royal-code/ui/button';
import { AppIcon } from '@royal-code/shared/domain';


@Component({
  selector: 'admin-settings-orders',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, UiCardComponent, SettingsFieldComponent,
    UiInputComponent, UiButtonComponent, UiToggleButtonComponent
  ],
  template: `
    <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
      <div class="space-y-6">
        <!-- Card 1: Algemene Orderinstellingen -->
        <royal-code-ui-card title="Algemene Orderinstellingen" description="Basisgedrag voor orderverwerking.">
          <admin-settings-field label="Ordernummer Voorvoegsel" helpText="Prefix voor nieuwe ordernummers (bv. 'RC-DRONE-').">
            <royal-code-ui-input formControlName="orderNumberPrefix" />
          </admin-settings-field>
          <admin-settings-field label="Start Ordernummer" helpText="Het nummer vanaf waar nieuwe orders beginnen te tellen.">
            <royal-code-ui-input formControlName="startOrderNumber" type="number" />
          </admin-settings-field>
          <admin-settings-field label="Gast-checkout Toestaan" forInputId="allow-guest-checkout-toggle" helpText="Sta klanten toe te bestellen zonder account.">
            <royal-code-ui-toggle-button formControlName="allowGuestCheckout" label="Gast-checkout inschakelen" id="allow-guest-checkout-toggle" />
          </admin-settings-field>
          <admin-settings-field label="Onbetaalde Order Timeout (min)" helpText="Tijd totdat een onbetaalde order wordt geannuleerd.">
            <royal-code-ui-input formControlName="unpaidOrderTimeoutMinutes" type="number" />
          </admin-settings-field>
          <div footer>
            <royal-code-ui-button type="primary" [disabled]="settingsForm.pristine || settingsForm.invalid">Opslaan</royal-code-ui-button>
          </div>
        </royal-code-ui-card>

        <!-- Card 2: Retourneren, Garantie & DOA -->
        <royal-code-ui-card title="Retourneren, Garantie & DOA" description="Beleid en workflows voor productretouren en defecten.">
          <admin-settings-field label="RMA Workflow Inschakelen" forInputId="rma-workflow-toggle" helpText="Schakel het Return Merchandise Authorization proces in.">
            <royal-code-ui-toggle-button formControlName="rmaWorkflowEnabled" label="RMA inschakelen" id="rma-workflow-toggle" />
          </admin-settings-field>
          <admin-settings-field label="Garantievoorwaarden URL" helpText="Link naar de volledige garantievoorwaarden.">
            <royal-code-ui-input formControlName="warrantyTermsUrl" placeholder="/legal/warranty-terms" />
          </admin-settings-field>
          <admin-settings-field label="DOA Beleid URL" helpText="Link naar het Dead On Arrival beleid.">
            <royal-code-ui-input formControlName="doaPolicyUrl" placeholder="/legal/doa-policy" />
          </admin-settings-field>
          <div footer>
            <royal-code-ui-button type="primary" [disabled]="settingsForm.pristine || settingsForm.invalid">Opslaan</royal-code-ui-button>
          </div>
        </royal-code-ui-card>

        <!-- Card 3: Verzendproviders -->
        <royal-code-ui-card title="Verzendproviders" description="API-integraties met externe verzendservices.">
          @for (provider of shippingProviders.controls; track provider.get('id')?.value; let i = $index) {
            <div [formGroupName]="i" class="p-3 border border-dashed border-border rounded-md mb-4 last:mb-0">
              <admin-settings-field [label]="provider.get('name')?.value + ' API Key'">
                <royal-code-ui-input formControlName="apiKey" type="password" />
              </admin-settings-field>
            </div>
          }
          <div footer>
            <royal-code-ui-button type="primary" [disabled]="settingsForm.pristine || settingsForm.invalid">Opslaan</royal-code-ui-button>
          </div>
        </royal-code-ui-card>

        <!-- Card 4: Betaalproviders -->
        <royal-code-ui-card title="Betaalproviders" description="API-integraties met externe betaalservices.">
          @for (provider of paymentProviders.controls; track provider.get('id')?.value; let i = $index) {
            <div [formGroupName]="i" class="p-3 border border-dashed border-border rounded-md mb-4 last:mb-0">
              <admin-settings-field [label]="provider.get('name')?.value + ' API Key'">
                <royal-code-ui-input formControlName="apiKey" type="password" />
              </admin-settings-field>
            </div>
          }
          <div footer>
            <royal-code-ui-button type="primary" [disabled]="settingsForm.pristine || settingsForm.invalid">Opslaan</royal-code-ui-button>
          </div>
        </royal-code-ui-card>

        <!-- Card 5: Drone-specifieke Verzendopties -->
        <royal-code-ui-card title="Drone-specifieke Verzendopties" description="Beheer restricties en verzekeringen voor drone-zendingen.">
          <admin-settings-field label="Batterij Verzendrestricties Actief" forInputId="battery-shipping-toggle" helpText="Pas restricties toe op verzending van Li-ion batterijen.">
            <royal-code-ui-toggle-button formControlName="batteryShippingRestrictionsEnabled" label="Activeren" id="battery-shipping-toggle" />
          </admin-settings-field>
          <admin-settings-field label="Bulky Item Handling Actief" forInputId="bulky-item-handling-toggle" helpText="Speciale regels voor grote en zware drones.">
            <royal-code-ui-toggle-button formControlName="bulkyItemHandlingEnabled" label="Activeren" id="bulky-item-handling-toggle" />
          </admin-settings-field>
          <admin-settings-field label="Verplichte Verzekering High-Value Items" forInputId="high-value-insurance-toggle" helpText="Verzekering vereist voor drones boven een bepaalde waarde.">
            <royal-code-ui-toggle-button formControlName="highValueInsuranceRequired" label="Verplicht" id="high-value-insurance-toggle" />
          </admin-settings-field>
          <admin-settings-field label="Dropshipping Actief" forInputId="dropshipping-toggle" helpText="Configureer dropshipping met externe leveranciers.">
            <royal-code-ui-toggle-button formControlName="dropShippingEnabled" label="Activeren" id="dropshipping-toggle" />
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
export class SettingsOrdersComponent implements OnInit {
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
      orderNumberPrefix: ['', Validators.required],
      startOrderNumber: [0, [Validators.required, Validators.min(0)]],
      allowGuestCheckout: [false],
      unpaidOrderTimeoutMinutes: [60, [Validators.required, Validators.min(1)]],
      rmaWorkflowEnabled: [false],
      warrantyTermsUrl: [''],
      doaPolicyUrl: [''],
      shippingProviders: this.fb.array([]), // Lege array, wordt gevuld met data
      paymentProviders: this.fb.array([]), // Lege array, wordt gevuld met data
      batteryShippingRestrictionsEnabled: [false],
      bulkyItemHandlingEnabled: [false],
      highValueInsuranceRequired: [false],
      dropShippingEnabled: [false],
    });
  }

  get shippingProviders() {
    return this.settingsForm.get('shippingProviders') as FormArray;
  }

  get paymentProviders() {
    return this.settingsForm.get('paymentProviders') as FormArray;
  }

  loadData(): void {
    this.settingsService.getOrderSettings().subscribe(data => {
      this.settingsForm.patchValue(data);

      // Vul de FormArray's voor providers
      this.shippingProviders.clear();
      data.shippingProviders.forEach(p => this.shippingProviders.push(this.fb.group(p)));

      this.paymentProviders.clear();
      data.paymentProviders.forEach(p => this.paymentProviders.push(this.fb.group(p)));
    });
  }

  saveSettings(): void {
    if (this.settingsForm.valid) {
      console.log('Dummy Save Order Settings:', this.settingsForm.value);
      this.settingsForm.markAsPristine();
      // Toon notificatie in echte implementatie
    }
  }
}