/**
 * @file variant-info-panel.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-28
 * @Description Displays detailed information about the attribute pricing strategy.
 */
import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';

@Component({
  selector: 'admin-variant-info-panel',
  standalone: true,
  imports: [CommonModule, UiTitleComponent, UiButtonComponent],
  template: `
    <div class="p-6 bg-card rounded-xs max-w-2xl">
      <royal-code-ui-title [level]="TitleTypeEnum.H2" text="Hoe Werken Attribuutprijzen?" />
      <div class="mt-4 space-y-4 text-secondary text-sm">
        <p>
          Het prijssysteem voor productvarianten is gelaagd om maximale flexibiliteit te bieden. Prijzen worden bepaald door een hiërarchie van drie niveaus:
        </p>
        <ol class="list-decimal list-inside space-y-3">
          <li>
            <strong class="font-semibold text-foreground">Niveau 1: Globale Prijsaanpassing (Deze Pagina)</strong><br>
            Hier stelt u de <strong>standaard</strong> meer- of minderprijs in voor een attribuutwaarde, geldig voor de <strong>hele winkel</strong>.
            <br><em>Voorbeeld: U stelt in dat de maat "X-Large" standaard +€5,00 kost.</em>
          </li>
          <li>
            <strong class="font-semibold text-foreground">Niveau 2: Product-Specifieke Override</strong><br>
            Op de "Product Bewerken"-pagina kunt u de globale regel voor een specifiek product <strong>overschrijven</strong>.
            <br><em>Voorbeeld: Voor een premium T-shirt stelt u in dat "X-Large" +€7,50 kost, wat de globale +€5,00 negeert.</em>
          </li>
          <li>
            <strong class="font-semibold text-foreground">Niveau 3: Definitieve Prijs in Variantentabel</strong><br>
            In de tabel met alle combinaties (SKU's) op de "Product Bewerken"-pagina vult u de <strong>definitieve, uiteindelijke verkoopprijs</strong> in. Dit getal overschrijft alle automatische berekeningen en is de prijs die de klant ziet.
            <br><em>Voorbeeld: De berekende prijs voor "Rood / X-Large" is €27,50, maar u maakt er handmatig een aanbieding van: €24,99.</em>
          </li>
        </ol>
        <p class="pt-4 border-t border-border">
          Deze gelaagde aanpak bespaart u tijd met globale regels, terwijl u de volledige controle behoudt voor uitzonderingen per product of zelfs per specifieke variant.
        </p>
      </div>
      <div class="mt-6 flex justify-end">
        <royal-code-ui-button type="primary" (clicked)="close.emit()">Begrepen</royal-code-ui-button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariantInfoPanelComponent {
  close = output<void>();
  protected readonly TitleTypeEnum = TitleTypeEnum;
}