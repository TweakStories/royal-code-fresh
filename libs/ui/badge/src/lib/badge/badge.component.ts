/**
 * @file ui-badge.component.ts
 * @Version 4.0.0 (Multiline by Default with Truncate Option)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-08-21
 * @Description Een veelzijdige badge component. Is nu standaard multiline om layoutproblemen
 *              te voorkomen en biedt een `[truncateText]` input voor single-line gedrag.
 */
import { Component, ChangeDetectionStrategy, input, computed, Signal, InputSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppIcon, BadgeColor, BadgeSize } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';

@Component({
  selector: 'royal-code-ui-badge',
  standalone: true,
  imports: [CommonModule, UiIconComponent],
  template: `
    <div
      class="inline-flex items-center gap-x-1.5 rounded-full transition-colors duration-200 ease-out"
      [ngClass]="badgeClasses()"
      [style.backgroundColor]="badgeStyles().backgroundColor"
      [style.color]="badgeStyles().color"
      [style.border]="badgeStyles().border">
      @if (icon()) {
        <royal-code-ui-icon [icon]="icon()!" sizeVariant="xs" />
      }
      <span [class.truncate]="truncateText()">
        <ng-content />
      </span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiBadgeComponent {
  readonly color: InputSignal<BadgeColor> = input<BadgeColor>('muted');
  readonly size: InputSignal<BadgeSize> = input<BadgeSize>('xs');
  readonly icon: InputSignal<AppIcon | undefined> = input<AppIcon | undefined>();
  readonly bordered: InputSignal<boolean> = input<boolean>(true);
  readonly extraClasses: InputSignal<string> = input<string>('');

  /**
   * NIEUWE INPUT: Bepaalt of de tekst op één regel moet worden afgekapt met '...'.
   * Standaard is dit false, waardoor de tekst over meerdere regels kan lopen.
   */
  readonly truncateText: InputSignal<boolean> = input<boolean>(false);

  private readonly sizeMap: Record<BadgeSize, string> = {
    xs: 'px-2.5 py-1 text-xs font-semibold',
    sm: 'px-3 py-1.5 text-sm font-semibold',
    md: 'px-4 py-2 text-base font-medium',
    lg: 'px-6 py-3 text-lg font-medium',
    xl: 'px-8 py-4 text-xl font-medium',
  };

  protected readonly badgeClasses: Signal<string> = computed(() => {
    const sizeClass = this.sizeMap[this.size()];
    // DE FIX: whitespace-nowrap is verwijderd uit de basisklassen.
    // De 'truncate' class wordt conditioneel toegevoegd op de span in de template.
    const layoutClass = this.truncateText() ? 'whitespace-nowrap' : 'whitespace-normal text-center';
    return `${sizeClass} ${layoutClass} ${this.extraClasses()}`;
  });

  protected readonly badgeStyles: Signal<{ backgroundColor: string; color: string; border: string }> = computed(() => {
    const color = this.color();
    const useBorder = this.bordered();

    const colorMap: Record<BadgeColor, { bg: string; text: string; border: string }> = {
      primary: { bg: 'var(--color-primary-hover)', text: 'var(--color-primary-on)', border: 'var(--color-primary)' },
      success: { bg: 'hsla(var(--hue-success-state), var(--sat-success-state), 50%, 0.1)', text: 'var(--color-success)', border: 'hsla(var(--hue-success-state), var(--sat-success-state), 50%, 0.2)' },
      error:   { bg: 'hsla(var(--hue-error-state), var(--sat-error-state), 58%, 0.1)', text: 'var(--color-error)', border: 'hsla(var(--hue-error-state), var(--sat-error-state), 58%, 0.2)' },
      warning: { bg: 'hsla(var(--hue-warning-state), var(--sat-warning-state), 50%, 0.1)', text: 'var(--color-warning)', border: 'hsla(var(--hue-warning-state), var(--sat-warning-state), 50%, 0.2)' },
      info:    { bg: 'hsla(var(--hue-info-state), var(--sat-info-state), 58%, 0.1)', text: 'var(--color-info)', border: 'hsla(var(--hue-info-state), var(--sat-info-state), 58%, 0.2)' },
      muted:   { bg: 'var(--color-hover)', text: 'var(--color-text-muted)', border: 'var(--color-border)' },
      accent:  { bg: 'var(--color-accent)', text: 'var(--color-accent-on)', border: 'var(--color-accent)' }
    };

    const styles = colorMap[color];

    return {
      backgroundColor: styles.bg,
      color: styles.text,
      border: useBorder ? `1px solid ${styles.border}` : 'none'
    };
  });
}