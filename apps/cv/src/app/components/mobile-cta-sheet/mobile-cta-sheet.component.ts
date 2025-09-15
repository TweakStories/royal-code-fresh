import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'mobile-cta-sheet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="visible()" class="fixed bottom-0 inset-x-0 bg-background/95 border-t border-border shadow-lg p-4 z-50 flex items-center justify-between">
      <span class="font-medium text-sm">Gratis 15‑min Quick‑Scan?</span>
      <a href="#calendly" class="btn-primary">Plan Nu</a>
    </div>
  `,
  styles: [
    `.btn-primary {
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      background-color: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
      font-size: 0.875rem;
      font-weight: 600;
      transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }
    .btn-primary:hover {
      background-color: hsl(var(--primary) / 0.9);
    }`,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileCtaSheetComponent implements OnInit {
  visible = signal(false);

  ngOnInit(): void {
    if (typeof window === 'undefined') return;
    const hero = document.querySelector('app-cv-home section');
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => this.visible.set(!entry.isIntersecting),
      { threshold: 0.5 }
    );
    observer.observe(hero);
  }
}
