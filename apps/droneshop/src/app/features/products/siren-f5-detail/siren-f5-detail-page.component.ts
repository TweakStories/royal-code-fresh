/**
 * @file siren-f5-detail.component.ts
 * @Version 1.0.0 (Hardcoded Frontend Explanation Page)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description A simple "smart" container component that loads the hardcoded
 *              Siren F5 explanation data and passes it to the reusable
 *              DroneExplanationPageComponent.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SIREN_F5_EXPLANATION_DATA } from './siren-f5-explanation.data';
import { DroneExplanationPageComponent } from 'libs/features/products/ui-droneshop/src/lib/pages/drone-explanation-page/drone-explanation-page.component';

@Component({
  selector: 'droneshop-siren-f5-detail-page',
  standalone: true,
  imports: [CommonModule, DroneExplanationPageComponent],
  template: `
    <droneshop-drone-explanation-page [contentData]="sirenF5Data" />
  `,
  styles: [`:host { display: block; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SirenF5DetailPageComponent {
  protected readonly sirenF5Data = SIREN_F5_EXPLANATION_DATA;
}