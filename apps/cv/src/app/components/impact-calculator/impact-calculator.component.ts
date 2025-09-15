import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { signal, computed, WritableSignal } from '@angular/core';

@Component({
  selector: 'impact-calculator',
  standalone: true,
  imports: [CommonModule, UiParagraphComponent],
  template: `
    <div class="impact-calculator bg-card p-4 rounded-xs border border-border w-full max-w-md mx-auto text-left">
      <label class="block text-sm font-medium mb-2">Teamgrootte: {{ teamSize() }} developers</label>
      <input
        type="range"
        min="3"
        max="25"
        [value]="teamSize()"
        (input)="teamSize.set($any($event.target).value)"
        class="w-full"
      />
      <p class="mt-4 text-sm">
        Jaarlijkse besparing:
        <strong>€{{ totalSavings() | number:'1.0-0' }}</strong>
      </p>
    </div>
  `,
  styles: [`.impact-calculator { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImpactCalculatorComponent {
  teamSize: WritableSignal<number> = signal(10);
  private readonly savingPercentage = 30;
  private readonly avgCostPerDeveloper = 70000;
  totalSavings = computed(() =>
    (this.teamSize() * this.avgCostPerDeveloper) * (this.savingPercentage / 100)
  );
}
