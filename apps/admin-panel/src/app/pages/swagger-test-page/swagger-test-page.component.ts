/**
 * @file swagger-test-page.component.ts
 * @Version 1.0.1 (Fixed NG5002 ICU message errors)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description A simple page to simulate Swagger for testing API endpoints by sending raw JSON payloads,
 *              now with escaped curly braces to fix Angular template parsing errors.
 */
import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiTextareaComponent } from '@royal-code/ui/textarea';
import { UiInputComponent } from '@royal-code/ui/input';
import { UiButtonComponent } from '@royal-code/ui/button';
import { AdminProductsFacade } from '@royal-code/features/admin-products/core';
import { UpdateProductPayload } from '@royal-code/features/products/domain';
import { NotificationService } from '@royal-code/ui/notifications';
import { LoggerService } from '@royal-code/core/core-logging';

@Component({
  selector: 'admin-swagger-test-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    JsonPipe,
    UiTitleComponent,
    UiTextareaComponent,
    UiInputComponent,
    UiButtonComponent
  ],
  template: `
    <div class="space-y-6">
      <royal-code-ui-title [level]="TitleTypeEnum.H1" text="Swagger API Test Pagina" />

      <div class="p-6 bg-card border border-border rounded-xs">
        <h3 class="text-lg font-medium mb-4">Update Product (PUT /api/Products/{{ '{' }}id{{ '}' }})</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Input Sectie -->
          <div class="space-y-4">
            <royal-code-ui-input 
              label="Product ID" 
              [(ngModel)]="productId" 
              placeholder="Voer het product ID (GUID) in om te updaten" 
            />
            
            <label for="json-payload" class="block text-sm font-medium text-foreground">JSON Payload</label>
            <royal-code-ui-textarea 
              id="json-payload"
              [(value)]="jsonPayload"
              [rows]="25"
              [extraTextareaClasses]="'font-mono !text-xs ' + (isJsonValid() ? '' : '!border-error !ring-error')"
            />
            @if (!isJsonValid()) {
              <p class="text-sm text-error">De ingevoerde tekst is geen geldige JSON.</p>
            }
          </div>

          <!-- Output & Actie Sectie -->
          <div class="space-y-4">
            <royal-code-ui-button 
              type="primary" 
              (clicked)="submitUpdate()" 
              [disabled]="!productId() || !isJsonValid() || facade.viewModel().isSubmitting">
              Verstuur Update
            </royal-code-ui-button>
            
            <h4 class="text-md font-semibold mt-4">NgRx State & Response</h4>
            <div class="p-3 bg-surface-alt rounded-md border border-border">
              <p><strong>Is Submitting:</strong> {{ facade.viewModel().isSubmitting }}</p>
              <h5 class="font-medium mt-2">Error:</h5>
              <pre class="text-xs bg-card p-2 rounded max-h-48 overflow-auto">{{ facade.viewModel().error | json }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwaggerTestPageComponent {
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly facade = inject(AdminProductsFacade);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);

  protected readonly productId = signal<string>('');
  protected readonly jsonPayload = signal<string>('');
  protected readonly isJsonValid = signal<boolean>(true);

  constructor() {
    // Luister naar veranderingen in jsonPayload om validatie te triggeren
    effect(() => {
      try {
        JSON.parse(this.jsonPayload());
        this.isJsonValid.set(true);
      } catch (e) {
        this.isJsonValid.set(false);
      }
    });

    // Standaard payload bij laden van de pagina
    this.jsonPayload.set(JSON.stringify(this.getExamplePayload(), null, 2));
  }

  submitUpdate(): void {
    if (!this.productId() || !this.isJsonValid()) {
      this.notificationService.showError("Product ID en een geldige JSON payload zijn vereist.");
      return;
    }

    try {
      const payload: UpdateProductPayload = JSON.parse(this.jsonPayload());
      this.logger.info(`[SwaggerTestPage] Versturen van update voor product ID ${this.productId()} met payload:`, payload);
      this.facade.updateProduct(this.productId(), payload);
    } catch (e) {
      this.logger.error("[SwaggerTestPage] Fout bij parsen van JSON payload:", e);
      this.notificationService.showError("Kon de JSON payload niet parsen.");
    }
  }

  private getExamplePayload(): any {
    return {
      name: "Bijgewerkte Productnaam via Swagger Test",
      shortDescription: "Deze beschrijving is bijgewerkt via de testpagina.",
      isActive: true,
      variantOverrides: [
        {
          tempAttributeValueIds: ["c0100001-0000-4000-8000-000000000004", "a0000001-0000-4000-8000-000000000002"],
          sku: "SWAGGER-TEST-SKU-1",
          price: 999.99
        }
      ]
    };
  }
}