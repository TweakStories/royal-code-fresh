/**
 * @file dashboard-sales-chart.component.ts
 * @Version 2.7.0 (Simplified Chart without Date Adapter)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Simplified component for displaying the sales chart using Chart.js and Ng2-Charts,
 *              without requiring chartjs-adapter-date-fns dependency.
 */
import { Component, ChangeDetectionStrategy, input, OnInit, effect } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { RevenueDataPoint } from '@royal-code/features/admin-dashboard/domain';

// --- Charting Imports ---
import { BaseChartDirective } from 'ng2-charts';
import {
  ChartConfiguration,
  ChartOptions,
  ChartType,
  Chart,
  registerables,
  ChartData,
} from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'admin-dashboard-sales-chart',
  standalone: true,
  imports: [CommonModule, TranslateModule, UiTitleComponent, BaseChartDirective],
  template: `
    <div class="bg-card border border-border rounded-xs shadow-sm h-96 flex flex-col p-4">
      <royal-code-ui-title [level]="TitleTypeEnum.H3" text="Omzet Afgelopen 30 Dagen" />
      <div class="flex-grow flex items-center justify-center text-muted text-sm mt-4 bg-surface-alt rounded-md p-2">
        @if (data() && data()!.length > 0) {
          <canvas baseChart
            [data]="lineChartData"
            [options]="lineChartOptions"
            [type]="'line'"
          ></canvas>
        } @else {
          <p>{{ 'admin.dashboard.chart.noData' | translate }}</p>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSalesChartComponent implements OnInit {
  data = input<readonly RevenueDataPoint[] | undefined>();
  protected readonly TitleTypeEnum = TitleTypeEnum;

  // Primary kleur styling gebaseerd op jouw design system
  public lineChartData: ChartData<'line', number[], string> = {
    datasets: [
      {
        data: [], // Will be populated with revenue numbers
        label: 'Omzet',
        fill: true,
        backgroundColor: 'hsla(38, 92%, 58%, 0.1)', // Primary kleur met 10% transparantie
        borderColor: 'hsl(38, 92%, 58%)', // Primary kleur (hue: 38, sat: 92%, lightness: 58%)
        borderWidth: 2, // Dunnere lijn
        pointBackgroundColor: 'hsl(38, 92%, 58%)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 3, // Kleinere punten
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'hsl(38, 92%, 51%)', // Iets donkerder bij hover
        pointHoverBorderColor: 'white',
        pointHoverBorderWidth: 2,
        tension: 0.4, // Zachte curves
      },
    ],
    labels: [], // Will be populated with formatted date strings
  };

  // Moderne en cleane chart styling
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    elements: {
      line: {
        tension: 0.4, // Zachte curves
      },
      point: {
        radius: 2, // Kleinere punten standaard
        hoverRadius: 4, // Iets groter bij hover
        borderWidth: 1,
        hoverBorderWidth: 2,
      },
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
    scales: {
      x: {
        border: {
          display: false, // Geen dikke border
        },
        grid: {
          display: true,
          color: 'rgba(148, 163, 184, 0.1)', // Zeer subtiele grid lijnen
          lineWidth: 1,
        },
        ticks: {
          color: 'rgb(100, 116, 139)', // Matte tekst kleur
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif',
          },
          maxTicksLimit: 7,
          padding: 8,
        },
      },
      y: {
        beginAtZero: true,
        border: {
          display: false, // Geen dikke border
        },
        grid: {
          display: true,
          color: 'rgba(148, 163, 184, 0.1)', // Zeer subtiele grid lijnen
          lineWidth: 1,
        },
        ticks: {
          color: 'rgb(100, 116, 139)', // Matte tekst kleur
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif',
          },
          callback: function (value) {
            return new DecimalPipe('nl-NL').transform(value, '1.0-0') + '€';
          },
          padding: 8,
        },
      },
    },
    plugins: {
      legend: {
        display: false, // Geen legend nodig
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(15, 23, 42, 0.9)', // Donkere tooltip
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'hsl(var(--color-primary) / 0.3)',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: false,
        titleFont: {
          size: 12,
          weight: 'normal',
        },
        bodyFont: {
          size: 12,
          weight: 'bold',
        },
        padding: 10,
        callbacks: {
          title: (context) => {
            return context[0].label || '';
          },
          label: (context) => {
            const value = context.parsed.y;
            return `€${new DecimalPipe('nl-NL').transform(value, '1.2-2')}`;
          },
        },
      },
    },
  };

  // Fixed: Remove the public property and use inline literal type
  // public lineChartType: ChartType = 'line'; // Remove this line

  constructor() {
    effect(() => {
      const revenueData = this.data();
      if (revenueData && revenueData.length > 0) {
        this.updateChartData(revenueData);
      } else {
        this.lineChartData.datasets[0].data = [];
        this.lineChartData.labels = [];
      }
    });
  }

  ngOnInit(): void {
    // Chart.js components are already registered
  }

  private updateChartData(dataPoints: readonly RevenueDataPoint[]): void {
    // Convert data points to simple arrays for Chart.js
    const revenues: number[] = dataPoints.map(point => point.revenue);
    const labels: string[] = dataPoints.map(point => 
      point.date.toLocaleDateString('nl-NL', { 
        month: 'short', 
        day: 'numeric' 
      })
    );

    this.lineChartData.datasets[0].data = revenues;
    this.lineChartData.labels = labels;
  }
}