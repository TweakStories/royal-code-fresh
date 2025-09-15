import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'availability-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
    🔥 {{ slotsLeft }} slots vrij in {{ quarter }}
  </span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvailabilityBadgeComponent {
  slotsLeft = 2;
  quarter = 'Q4 2025';
}
