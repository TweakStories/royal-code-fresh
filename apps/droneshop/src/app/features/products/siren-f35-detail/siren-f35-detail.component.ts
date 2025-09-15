/**
 * @file siren-f35-detail.component.ts
 * @Version 3.0.0 (Hardcoded Frontend Explanation Page)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description A simple "smart" container component that loads the hardcoded
 *              Siren F3.5 explanation data and passes it to the reusable
 *              DroneExplanationPageComponent.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SIREN_F35_EXPLANATION_DATA } from './siren-f35-explanation.data';
import { DroneExplanationPageComponent } from 'libs/features/products/ui-droneshop/src/lib/pages/drone-explanation-page/drone-explanation-page.component';

@Component({
  selector: 'droneshop-siren-f35-detail-page',
  standalone: true,
  imports: [CommonModule, DroneExplanationPageComponent],
  template: `
    <droneshop-drone-explanation-page [contentData]="sirenF35Data" />
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SirenF35DetailPageComponent {
  protected readonly sirenF35Data = SIREN_F35_EXPLANATION_DATA;
}