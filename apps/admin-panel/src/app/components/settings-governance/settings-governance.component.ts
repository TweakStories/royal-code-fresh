/**
 * @file settings-governance.component.ts
 * @Version 1.0.0
 * @Description Component for managing security, governance, and audit settings.
 */
import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsDataService, GovernanceSettings } from '../../services/settings-data.service';
import { UiCardComponent } from '@royal-code/ui/cards/card';
import { SettingsFieldComponent } from '../settings-field/settings-field.component';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiToggleButtonComponent } from '@royal-code/ui/button';
import { AppIcon } from '@royal-code/shared/domain';

@Component({
  selector: 'admin-settings-governance',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, UiCardComponent, SettingsFieldComponent,
    UiButtonComponent, UiToggleButtonComponent
  ],
  template: `
    <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()">
      <div class="space-y-6">
        <!-- Card 1: Rolgebaseerd Toegangsbeheer (RBAC) -->
        <royal-code-ui-card title="Rolgebaseerd Toegangsbeheer (RBAC)" description="Beheer de toegang en permissies van gebruikersrollen.">
          <admin-settings-field label="RBAC Inschakelen" forInputId="rbac-enabled-toggle" helpText="Schakel rolgebaseerd toegangsbeheer in voor de applicatie.">
            <royal-code-ui-toggle-button formControlName="rbacEnabled" label="Inschakelen" id="rbac-enabled-toggle" />
          </admin-settings-field>
          <admin-settings-field label="Audit Logging Inschakelen" forInputId="audit-logging-toggle" helpText="Leg alle belangrijke wijzigingen en acties vast voor auditdoeleinden.">
            <royal-code-ui-toggle-button formControlName="auditLoggingEnabled" label="Inschakelen" id="audit-logging-toggle" />
          </admin-settings-field>
          <admin-settings-field label="Goedkeuringsworkflow Actief" forInputId="high-risk-approval-toggle" helpText="Vereis goedkeuring voor high-risk instellingswijzigingen (4-ogenprincipe).">
            <royal-code-ui-toggle-button formControlName="highRiskApprovalWorkflowEnabled" label="Activeren" id="high-risk-approval-toggle" />
          </admin-settings-field>
          <admin-settings-field label="Admin IP Rate Limiting Actief" forInputId="admin-ip-rate-limiting-toggle" helpText="Beperk het aantal verzoeken vanaf een IP-adres naar de admin.">
            <royal-code-ui-toggle-button formControlName="adminIpRateLimitingEnabled" label="Activeren" id="admin-ip-rate-limiting-toggle" />
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
export class SettingsGovernanceComponent implements OnInit {
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
      rbacEnabled: [true],
      auditLoggingEnabled: [true],
      highRiskApprovalWorkflowEnabled: [false],
      adminIpRateLimitingEnabled: [true],
    });
  }

  loadData(): void {
    this.settingsService.getGovernanceSettings().subscribe(data => {
      this.settingsForm.patchValue(data);
    });
  }

  saveSettings(): void {
    if (this.settingsForm.valid) {
      console.log('Dummy Save Governance Settings:', this.settingsForm.value);
      this.settingsForm.markAsPristine();
      // Toon notificatie in echte implementatie
    }
  }
}