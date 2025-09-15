import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'trade-off-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <table class="w-full text-sm border-collapse border-border">
      <thead>
        <tr class="bg-muted text-foreground font-semibold">
          <th class="p-3 border border-border">Aspect</th>
          <th class="p-3 border border-border">Benefit</th>
          <th class="p-3 border border-border">Trade-Off</th>
          <th class="p-3 border border-border">Mitigation</th>
        </tr>
      </thead>
      <tbody>
        <tr
          *ngFor="let row of rows"
          class="hover:bg-muted/40"
        >
          <td class="p-3 border border-border font-medium">{{ row.aspect }}</td>
          <td class="p-3 border border-border">{{ row.benefit }}</td>
          <td class="p-3 border border-border text-destructive">{{ row.tradeOff }}</td>
          <td class="p-3 border border-border">{{ row.mitigate }}</td>
        </tr>
      </tbody>
    </table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradeOffTableComponent {
  rows = [
    {
      aspect: 'Clean Architecture',
      benefit: 'Clear layers, testable',
      tradeOff: 'More boilerplate',
      mitigate: 'Nx schematics',
    },
    {
      aspect: 'Hexagonal',
      benefit: 'Adapters simplify integration',
      tradeOff: 'Steeper learning curve',
      mitigate: 'Workshop & pairing',
    },
    {
      aspect: 'Monorepo',
      benefit: 'Single source of truth',
      tradeOff: 'Potential build time',
      mitigate: 'Nx caching',
    },
    {
      aspect: 'Micro-frontends',
      benefit: 'Independent teams',
      tradeOff: 'Runtime overhead',
      mitigate: 'Module Federation',
    },
  ];
}
