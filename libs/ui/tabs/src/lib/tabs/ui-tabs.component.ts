/**
 * @file ui-tabs.component.ts
 * @Version 1.1.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description Manages a collection of tab panels (UiTabPanelComponent).
 *              It displays tab headers and allows users to switch between panels.
 *              Styling uses Tailwind CSS with CSS variables for theming.
 */
import {
  Component, ChangeDetectionStrategy, input, output, signal, contentChildren,
  effect, AfterContentInit, OutputEmitterRef
} from '@angular/core';

import { UiTabPanelComponent } from '../tab-panel/ui-tab-panel.component';

@Component({
  selector: 'royal-code-ui-tabs',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ui-tabs">
      <div class="border-b border-border" role="tablist" [attr.aria-label]="ariaLabel() || 'Tabbed content'">
        <nav class="-mb-px flex space-x-4 sm:space-x-6 overflow-x-auto" aria-label="Tabs">
          @for (panel of tabPanels(); track panel.finalId()) {
            <button
              type="button"
              role="tab"
              [id]="panel.labelId()"
              [attr.aria-controls]="panel.panelId()"
              [attr.aria-selected]="isActiveTab(panel.finalId())"
              [disabled]="panel.disabled()"
              [class]="tabButtonClasses(panel.finalId(), panel.disabled())"
              (click)="!panel.disabled() && selectTab(panel.finalId())">
              {{ panel.title() }}
            </button>
          }
        </nav>
      </div>
      <div class="ui-tabs-content">
        <ng-content select="royal-code-ui-tab-panel"></ng-content>
      </div>
    </div>
  `,
  styles: [` :host { display: block; } `]
})
export class UiTabsComponent implements AfterContentInit {
  readonly initialActiveId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>();
  readonly activeTabChange: OutputEmitterRef<string> = output<string>();
  readonly activeTabIdSignal = signal<string | undefined>(undefined);
  readonly tabPanels = contentChildren(UiTabPanelComponent);

  constructor() {
    effect(() => {
      const currentActiveId = this.activeTabIdSignal();
      this.tabPanels().forEach(panel => {
        panel.isActiveAsSignal.set(panel.finalId() === currentActiveId);
      });
    });
  }

  ngAfterContentInit(): void {
    const panels = this.tabPanels();
    if (panels.length === 0) return;

    let targetActiveId = this.initialActiveId();

    if (targetActiveId) {
      const initialPanel = panels.find(p => p.finalId() === targetActiveId && !p.disabled());
      if (!initialPanel) targetActiveId = undefined;
    }

    if (!targetActiveId) {
      const firstEnabledPanel = panels.find(p => !p.disabled());
      if (firstEnabledPanel) targetActiveId = firstEnabledPanel.finalId();
    }

    if (targetActiveId) this.selectTab(targetActiveId, false);
    else this.activeTabIdSignal.set(undefined);
  }

  selectTab(panelId: string, emitChange: boolean = true): void {
    const panelToSelect = this.tabPanels().find(p => p.finalId() === panelId);
    if (panelToSelect && !panelToSelect.disabled() && this.activeTabIdSignal() !== panelId) {
      this.activeTabIdSignal.set(panelId);
      if (emitChange) this.activeTabChange.emit(panelId);
    }
  }

  isActiveTab(panelId: string): boolean {
    return this.activeTabIdSignal() === panelId;
  }

  tabButtonClasses(panelId: string, isDisabled: boolean): string {
    const isActive = this.isActiveTab(panelId);
    let classes = 'whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background rounded-t-md ';
    if (isDisabled) {
      classes += 'text-muted-foreground opacity-50 cursor-not-allowed ';
    } else if (isActive) {
      classes += 'border-primary text-primary border-b-2 ';
    } else {
      classes += 'border-transparent text-muted-foreground hover:text-foreground hover:border-border ';
    }
    return classes.trim();
  }
}
