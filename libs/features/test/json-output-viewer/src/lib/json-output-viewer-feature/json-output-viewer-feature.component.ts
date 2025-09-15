import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { TranslateModule } from '@ngx-translate/core';
import { AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { CheckoutFacade } from '@royal-code/features/checkout/core';
import { UserFacade } from '@royal-code/store/user';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { ListTypesEnum, UiListComponent } from '@royal-code/ui/list';

@Component({
  selector: 'droneshop-json-output-viewer',
  standalone: true,
  imports: [
    CommonModule, UiButtonComponent, UiSpinnerComponent, UiTitleComponent,
    TranslateModule, UiIconComponent, JsonPipe, UiParagraphComponent, UiListComponent
  ],
  template: `
    <div class="p-8 space-y-6 max-w-4xl mx-auto bg-card rounded-xs shadow-lg">
      <royal-code-ui-title [level]="TitleTypeEnum.H1" text="Test: Get Shipping Methods" />
      <royal-code-ui-paragraph color="secondary">
        Deze component test de <code>GET /api/Checkout/shipping-methods</code> call. Het gebruikt het standaard verzendadres van de ingelogde gebruiker.
      </royal-code-ui-paragraph>

      <div class="bg-surface-alt p-3 rounded-md text-sm">
        @if(userFacade.defaultShippingAddress(); as address) {
          <royal-code-ui-paragraph><strong>Gebruikt Adres ID:</strong> {{ address.id }}</royal-code-ui-paragraph>
          <royal-code-ui-paragraph><strong>Adres:</strong> {{ address.street }} {{ address.houseNumber }}, {{ address.city }}</royal-code-ui-paragraph>
        } @else {
          <royal-code-ui-paragraph color="error"><strong>Waarschuwing:</strong> Geen standaard verzendadres gevonden. De API call zal waarschijnlijk falen.</royal-code-ui-paragraph>
        }
      </div>

      <div class="flex items-center gap-4">
        <royal-code-ui-button type="primary" [loading]="isLoading()" (clicked)="fetchJsonData()" [disabled]="isLoading() || !userFacade.defaultShippingAddress()">
          <royal-code-ui-icon [icon]="AppIcon.Download" extraClass="mr-2" />
          Fetch Shipping Methods
        </royal-code-ui-button>
        @if (isLoading()) {
          <royal-code-ui-spinner size="md" />
          <royal-code-ui-paragraph color="primary">{{ 'common.loading' | translate }}</royal-code-ui-paragraph>
        }
      </div>

      @if (error()) {
        <div class="bg-destructive/10 text-destructive border border-destructive rounded-md p-4">
          <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'common.errorOccurred' | translate" />
        </div>
      }

      @if (jsonData()) {
        <div class="bg-surface-alt rounded-md p-4 overflow-x-auto border border-border">
          <pre><code class="language-json">{{ jsonData() | json }}</code></pre>
        </div>
      }
    </div>

    <div class="p-8 space-y-6 max-w-4xl mx-auto bg-card rounded-xs shadow-lg mt-8">
      <royal-code-ui-title [level]="TitleTypeEnum.H2" text="Productomschrijving Voorbeeld (HTML Content Projection)" />

      <royal-code-ui-title [level]="TitleTypeEnum.H3" text="Ontketen de Kracht van de Siren F5" extraClasses="!mb-4"></royal-code-ui-title>

      <royal-code-ui-paragraph color="foreground" extraClasses="mb-6">
        De <strong>Quadmula Siren F5 (8S)</strong> is niet zomaar een drone; het is een statement. Gebouwd voor de piloot die geen compromissen sluit, levert dit 5-inch beest de ongetemde, explosieve kracht van 8S. Elk component is met precisie geselecteerd en geassembleerd door onze experts, wat resulteert in een vliegervaring die zowel rauw als verfijnd is. Domineer het luchtruim, leg adembenemende cinematic shots vast en verleg de grenzen van wat mogelijk is in FPV.
      </royal-code-ui-paragraph>

      <royal-code-ui-title [level]="TitleTypeEnum.H4" text="Kern Eigenschappen" extraClasses="!mb-3"></royal-code-ui-title>

      <royal-code-ui-list class="mb-6">
        <li class="flex items-start gap-3 mb-2">
          <royal-code-ui-icon [icon]="AppIcon.Rocket" sizeVariant="sm" extraClass="text-primary mt-1"></royal-code-ui-icon>
          <royal-code-ui-paragraph><strong>Explosieve 8S Kracht:</strong> Ervaar ongeëvenaarde acceleratie en 'hang-time' voor de meest extreme freestyle manoeuvres.</royal-code-ui-paragraph>
        </li>
        <li class="flex items-start gap-3 mb-2">
          <royal-code-ui-icon [icon]="AppIcon.Shield" sizeVariant="sm" extraClass="text-primary mt-1"></royal-code-ui-icon>
          <royal-code-ui-paragraph><strong>Onverwoestbaar Chassis:</strong> Het legendarische Quadmula Siren F5 frame is ontworpen voor maximale impact-resistentie.</royal-code-ui-paragraph>
        </li>
        <li class="flex items-start gap-3 mb-2">
          <royal-code-ui-icon [icon]="AppIcon.Camera" sizeVariant="sm" extraClass="text-primary mt-1"></royal-code-ui-icon>
          <royal-code-ui-paragraph><strong>HD Cinematic Platform:</strong> Stabiel en krachtig genoeg om een full-size GoPro te dragen voor professionele, vloeiende opnames.</royal-code-ui-paragraph>
        </li>
        <li class="flex items-start gap-3">
          <royal-code-ui-icon [icon]="AppIcon.Wrench" sizeVariant="sm" extraClass="text-primary mt-1"></royal-code-ui-icon>
          <royal-code-ui-paragraph><strong>Professioneel Geassembleerd & Getuned:</strong> Elke drone wordt met de hand gebouwd, voorzien van een pro-tune en uitvoerig getest door onze FPV-experts.</royal-code-ui-paragraph>
        </li>
      </royal-code-ui-list>

      <royal-code-ui-paragraph color="muted" size="sm">
        Dit is de keuze voor de serieuze piloot die controle, betrouwbaarheid en pure prestaties eist. Geen compromissen, alleen de ultieme FPV-ervaring, direct uit de doos.
      </royal-code-ui-paragraph>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonOutputViewerComponent {
  private readonly checkoutFacade = inject(CheckoutFacade);
  protected readonly userFacade = inject(UserFacade);

  readonly isLoading = toSignal(this.checkoutFacade.viewModel$.pipe(map(vm => vm.isLoadingShippingMethods)));
  readonly jsonData = toSignal(this.checkoutFacade.viewModel$.pipe(map(vm => vm.shippingMethods)));
  readonly error = toSignal(this.checkoutFacade.viewModel$.pipe(map(vm => vm.error)));

  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly ListTypesEnum = ListTypesEnum;
  protected readonly AppIcon = AppIcon;

  fetchJsonData(): void {
    const defaultAddress = this.userFacade.defaultShippingAddress();
    if (defaultAddress && defaultAddress.id) {
      this.checkoutFacade.loadShippingMethods({ shippingAddressId: defaultAddress.id });
    } else {
      console.error("Kan verzendmethoden niet ophalen: geen standaard verzendadres gevonden.");
    }
  }
}