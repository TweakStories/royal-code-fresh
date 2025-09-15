/**
 * @file ui-tab-panel.component.ts
 * @Version 1.1.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-31
 * @Description Represents a single panel within a tabbed interface.
 *              This component is primarily used to structure content and provide
 *              metadata (like title and ID) to its parent UiTabsComponent.
 *              The actual content of the tab panel is projected via <ng-content>.
 */
import { Component, ChangeDetectionStrategy, input, signal, computed } from '@angular/core';


let tabPanelUniqueIdCounter = 0;

@Component({
  selector: 'royal-code-ui-tab-panel',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // CORRECTIE: Gebruik inline `template` in plaats van `templateUrl`.
  template: `
    <div
      class="ui-tab-panel"
      role="tabpanel"
      [id]="panelId()"
      [attr.aria-labelledby]="labelId()"
      [hidden]="!isActiveAsSignal()">
      <!-- De content wordt hierin geprojecteerd -->
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .ui-tab-panel:not([hidden]) {
      /* Standaard padding voor de content van een actieve tab */
      padding-top: 1rem; /* pt-4 */
    }
  `]
})
export class UiTabPanelComponent {
  // CORRECTIE: Alle benodigde inputs en signals zijn hier correct gedefinieerd.

  /** @description The title of the tab, displayed in the tab header. Required. */
  readonly title = input.required<string>();

  /** @description Optional unique identifier for this tab panel. If not provided, a unique ID will be generated automatically. */
  readonly id = input<string | undefined>(undefined);

  /** @description If true, this tab cannot be selected by the user. */
  readonly disabled = input<boolean>(false);

  /**
   * @internal
   * @description Signal managed by the parent UiTabsComponent to indicate if this panel is currently visible.
   */
  readonly isActiveAsSignal = signal<boolean>(false);

  /**
   * @internal
   * @description The effective ID for this tab panel, used for state management.
   */
  readonly finalId = computed<string>(() => this.id() ?? `rc-tab-panel-${tabPanelUniqueIdCounter++}`);

  /**
   * @internal
   * @description The HTML ID for the tab panel content element, for ARIA.
   */
  readonly panelId = computed(() => `${this.finalId()}-panel`);

  /**
   * @internal
   * @description The HTML ID for the tab header button that controls this panel, for ARIA.
   */
  readonly labelId = computed(() => `${this.finalId()}-label`);
}
