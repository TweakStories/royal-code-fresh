/**
 * @file siren-f5-build-kit-detail.component.ts
 * @Version 1.2.0 (Vereenvoudigd: Data direct doorgegeven aan geconsolideerde pagina)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description
 *   Een "smart" container component die de hardcoded data voor de Siren F5 Build Kit
 *   laadt en doorgeeft aan de generieke DroneExplanationPageComponent.
 *   Nu geoptimaliseerd voor de geconsolideerde DroneExplanationPageComponent.
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2025-09-02
 * @PromptSummary "Consolidate all Droneshop UI components into a single monolithic DroneExplanationPageComponent."
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DroneExplanationPageComponent } from 'libs/features/products/ui-droneshop/src/lib/pages/drone-explanation-page/drone-explanation-page.component';
import { SIREN_F5_BUILD_KIT_DATA } from './siren-f5-build-kit.data';
import { DroneExplanationData } from '@royal-code/shared/domain';

@Component({
  selector: 'droneshop-siren-f5-build-kit-detail-page',
  standalone: true,
  imports: [CommonModule, DroneExplanationPageComponent],
  template: `
    <droneshop-drone-explanation-page [contentData]="sirenF5BuildKitData" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SirenF5BuildKitDetailPageComponent {
  protected readonly sirenF5BuildKitData: DroneExplanationData = SIREN_F5_BUILD_KIT_DATA;
}