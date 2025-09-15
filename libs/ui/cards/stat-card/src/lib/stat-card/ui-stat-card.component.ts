// --- IN libs/ui/card/src/lib/stat-card/ui-stat-card.component.ts, VERVANG HET VOLLEDIGE BESTAND ---
/**
 * @file ui-stat-card.component.ts
 * @Version 1.2.0 (Text Wrapping & Icon Alignment Fix)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-07-29
 * @Description Gecorrigeerde stat-card component. Lost de uitlijning van iconen op
 *              en zorgt ervoor dat de 'label' correct naast het icoon wordt weergegeven,
 *              ongeacht de aanwezigheid van een 'value' of 'title'. Nu met optionele tekstafbreking.
 */
import { ChangeDetectionStrategy, Component, input, InputSignal, Signal, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppIcon } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';

// Definieer het type opnieuw hier of importeer het als het gedeeld wordt
type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'inherit';

@Component({
  selector: 'royal-code-ui-stat-card',
  standalone: true,
  imports: [UiIconComponent, CommonModule],
  template: `
    <div class="stat-card border border-border bg-muted rounded-xs p-3 flex flex-col items-center text-center h-full transition-colors hover:bg-muted/80 hover:border-primary">
      <!-- Icoon (nu boven) -->
      @if (icon()) {
        <div class="mb-2 text-primary">
          <royal-code-ui-icon
            [icon]="icon()!"
            [sizeVariant]="iconSize()"
          />
        </div>
      }
      <!-- Label (nu onder het icoon) -->
      <div class="text-xs font-medium text-secondary w-full" [ngClass]="{'truncate': !textWrap()}" [title]="!textWrap() ? label() : null">
        {{ label() }}
      </div>
      <!-- Value (optioneel, onderaan) -->
      @if (value()) {
        <div class="text-sm font-semibold text-foreground mt-auto w-full" [ngClass]="{'truncate': !textWrap()}" [title]="!textWrap() ? (value() | json) : null">
          {{ value() }}
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .stat-card { min-height: 70px; border-width: 1px; }
    .stat-card:hover { border-color: var(--color-primary); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiStatCardComponent {
  readonly icon = input<AppIcon | null>(null);
  readonly label = input.required<string>(); // De skillnaam komt hierin
  readonly value = input<string | number | undefined>(undefined); // Deze is nu optioneel
  /** InputSignal to control the size of the icon within the card. Defaults to 'sm'. */
  readonly iconSize: InputSignal<SizeVariant> = input<SizeVariant>('sm');
  /** If true, text will wrap to a new line instead of truncating. Defaults to false (truncate). */
  readonly textWrap = input(false, { transform: booleanAttribute });
}