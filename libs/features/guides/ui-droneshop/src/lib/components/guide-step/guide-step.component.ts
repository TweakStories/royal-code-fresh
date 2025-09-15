/**
 * @file guide-step.component.ts
 * @Version 2.3.0 (Definitive Imports & Event Payload)
 */
import { ChangeDetectionStrategy, Component, input, output, signal, computed, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuideStep, ContentBlock } from '@royal-code/features/guides/domain';
import { Product } from '@royal-code/features/products/domain';
import { Dictionary } from '@ngrx/entity';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiButtonComponent } from '@royal-code/ui/button';
import { AppIcon } from '@royal-code/shared/domain';
import { ContentBlockDispatcherComponent } from '../content-block-dispatcher/content-block-dispatcher.component';
import { SafetyGateComponent } from '../safety-gate/safety-gate.component';
import { UiIconComponent } from '@royal-code/ui/icon';

@Component({
  selector: 'droneshop-guide-step',
  standalone: true,
  imports: [
    CommonModule,
    UiTitleComponent,
    UiParagraphComponent,
    UiButtonComponent,
    UiIconComponent,
    ContentBlockDispatcherComponent,
    SafetyGateComponent,
  ],
  template: `
       @if (step(); as s) {
            <section [id]="'step-' + s.id" class="py-8 border-b-2 border-dashed border-border last:border-b-0">
        <header class="mb-6">
          <royal-code-ui-title
            [level]="TitleTypeEnum.H2"
            [text]="s.title"
            [blockStyle]="true"
            [blockStyleType]="'primary'"
          />
          <royal-code-ui-paragraph size="sm" color="muted" extraClasses="mt-2">
            Geschatte tijd: {{ s.estimatedMinutes }} minuten
          </royal-code-ui-paragraph>
        </header>


        <div class="step-content">
          @for (block of s.content; track $index) {
            @if (isSafetyGate(block)) {
              <droneshop-safety-gate
                [acknowledgementText]="block.acknowledgementText"
                [isStepCompleted]="isCompleted()"
                [(isAcknowledged)]="safetyGateAcknowledged"
              />
            } @else {
              <droneshop-content-block-dispatcher 
                [block]="block" 
                [productMap]="productMap()"
                [isStepCompleted]="isCompleted()" 
              />
            }
          }
        </div>

        <footer class="mt-8 text-center">
          <royal-code-ui-button
            [type]="isCompleted() ? 'success' : 'primary'"
            [outline]="isCompleted()"
            sizeVariant="lg"
            (clicked)="onCompleteClick($event)"
            [disabled]="hasPendingSafetyGate()">
            <royal-code-ui-icon [icon]="isCompleted() ? AppIcon.CheckCheck : AppIcon.Check" extraClass="mr-2" />
            {{ isCompleted() ? 'Stap Voltooid' : 'Markeer als Voltooid' }}
          </royal-code-ui-button>
        </footer>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuideStepComponent {
  step = input.required<GuideStep>();
  isCompleted = input.required<boolean>();
  productMap = input.required<Dictionary<Product>>();

  completedToggle = output<{ stepId: string; event: MouseEvent }>();

  protected readonly safetyGateAcknowledged = model(false);
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  private readonly hasSafetyGate = computed(() => 
    this.step().content.some(b => b.type === 'safetyGate')
  );

  protected readonly hasPendingSafetyGate = computed(() => 
    this.hasSafetyGate() && !this.isCompleted() && !this.safetyGateAcknowledged()
  );

  isSafetyGate(block: ContentBlock): block is Extract<ContentBlock, { type: 'safetyGate' }> {
    return block.type === 'safetyGate';
  }
  
  onCompleteClick(event: MouseEvent): void {
    this.completedToggle.emit({ stepId: this.step().id, event });
  }
}