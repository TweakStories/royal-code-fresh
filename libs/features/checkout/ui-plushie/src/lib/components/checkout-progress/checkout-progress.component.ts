/**
 * @file checkout-progress.component.ts
 * @Version 3.0.0 (Interactive Steps)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-11
 * @Description
 *   An interactive checkout progress bar. This version allows users to click on
 *   previously completed steps to navigate back and make changes, enhancing usability.
 *   Steps that are not yet completed are visually distinct and not clickable.
 */
import { Component, ChangeDetectionStrategy, input, output, OutputEmitterRef, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CheckoutStep } from '@royal-code/features/checkout/core';

interface Step {
  id: CheckoutStep;
  nameKey: string;
}

@Component({
  selector: 'plushie-royal-code-checkout-progress',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <nav [attr.aria-label]="'checkout.progress.title' | translate">
      <ol class="flex items-center space-x-2">
        @for (step of steps; track step.id; let i = $index) {
          <li class="flex-1">
            <button
              type="button"
              (click)="onStepClick(step.id)"
              [disabled]="!isClickable(step.id)"
              class="group flex w-full flex-col border-l-4 py-2 pl-4 text-left transition-colors md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0"
              [ngClass]="getStepClasses(step.id)"
              [attr.aria-current]="activeStep() === step.id ? 'step' : null"
            >
              <span class="text-sm font-medium">{{ step.nameKey | translate }}</span>
            </button>
          </li>
        }
      </ol>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutProgressComponent {
  // --- INPUTS ---
  /** @description The currently active step in the checkout process. */
  readonly activeStep = input.required<CheckoutStep>();

  /** @description A set of steps that have been successfully completed. */
  readonly completedSteps = input.required<Set<CheckoutStep>>();


  /** @description Determines if the user is allowed to navigate to the 'payment' step. */
  readonly canProceedToPayment = input(false, { transform: booleanAttribute });

  /** @description Determines if the user is allowed to navigate to the 'review' step. */
  readonly canProceedToReview = input(false, { transform: booleanAttribute });
  // --- OUTPUTS ---
  /** @description Emits the ID of a step when a clickable step is selected by the user. */
  readonly stepClicked: OutputEmitterRef<CheckoutStep> = output<CheckoutStep>();


  // --- COMPONENT STATE ---
  /** @description The defined steps for the checkout process. */
  readonly steps: Step[] = [
    { id: 'shipping', nameKey: 'checkout.progress.shipping' },
    { id: 'payment', nameKey: 'checkout.progress.payment' },
    { id: 'review', nameKey: 'checkout.progress.review' },
  ];

  /**
   * @method isClickable
   * @description Determines if a given step should be interactive for the user.
   * A step is clickable if it has been completed, but is not the currently active step.
   * @param {CheckoutStep} stepId - The ID of the step to check.
   * @returns {boolean} True if the step can be clicked to navigate.
   */
    isClickable(stepId: CheckoutStep): boolean {
    // Een stap is nooit klikbaar als je er al op staat.
    if (this.activeStep() === stepId) {
      return false;
    }

    // Bepaal of de doelstap "ontgrendeld" is.
    const isUnlocked =
      stepId === 'shipping' ||
      (stepId === 'payment' && this.canProceedToPayment()) ||
      (stepId === 'review' && this.canProceedToReview());

    return isUnlocked;
  }

  /**
   * @method getStepClasses
   * @description Computes the dynamic CSS classes for a step based on its state (active, completed, or pending).
   * @param {CheckoutStep} stepId - The ID of the step to style.
   * @returns {string} A string of Tailwind CSS classes.
   */
    getStepClasses(stepId: CheckoutStep): string {
    const isActive = this.activeStep() === stepId;
    const isUnlocked = this.isClickable(stepId) || isActive; // Een stap is 'unlocked' als je erheen kan of er al op staat.

    if (isActive) {
      // Actieve stap: primaire kleur, niet-interactief.
      return 'border-primary text-primary cursor-default pointer-events-none';
    }

    if (isUnlocked) {
      // Ontgrendelde, niet-actieve stap: succeskleur, interactief met hover-effect.
      return 'border-success text-success hover:border-primary cursor-pointer';
    }

    // Toekomstige, vergrendelde stap: gedimde kleur, niet-interactief.
    return 'border-border text-muted cursor-not-allowed pointer-events-none';
  }

  /**
   * @method onStepClick
   * @description Handles the click event on a step button.
   * It only emits the `stepClicked` event if the step is deemed clickable.
   * @param {CheckoutStep} stepId - The ID of the clicked step.
   */
  onStepClick(stepId: CheckoutStep): void {
    if (this.isClickable(stepId)) {
      this.stepClicked.emit(stepId);
    }
  }
}
