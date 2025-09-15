
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FilterConfig } from '@royal-code/shared/domain';

@Component({
  selector: 'royal-code-ui-filters',
  imports: [],
  template: `
    <div class="">
      <h2 class="text-2xl font-semibold text-primary mb-4">Filters</h2>
      @for (filter of filterConfig; track filter) {
        @switch (filter.controlType) {
          <!-- Date Range Filter -->
          @case ('daterange') {
            <div class="mb-4">
              <label>{{ filter.label }}</label>
              <div class="flex gap-2">
                <input
                  type="date"
                  (change)="onInputChange($event, filter.startDateKey ?? '')"
                  />
                  <input
                    type="date"
                    (change)="onInputChange($event, filter.endDateKey ?? '')"
                    />
                  </div>
                </div>
              }
              <!-- Multi-Select Checkbox Filter -->
              @case ('checkbox') {
                <div class="mb-4">
                  <label>{{ filter.label }}</label>
                  <div>
                    @for (option of filter.options; track option) {
                      <label>
                        <input
                          type="checkbox"
                          (change)="onCheckboxChange($event, filter.key, option)"
                          />
                          {{ option.label }}
                        </label>
                      }
                    </div>
                  </div>
                }
                <!-- Dropdown Filter -->
                @case ('dropdown') {
                  <div class="mb-4">
                    <label>{{ filter.label }}</label>
                    <select (change)="onDropdownChange($event, filter.key)">
                      @for (option of filter.options; track option) {
                        <option
                          [value]="option.value"
                          >
                          {{ option.label }}
                        </option>
                      }
                    </select>
                  </div>
                }
              }
            }
          </div>
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiFilterComponent {
  @Input() filterConfig: FilterConfig[] = [];
  @Output() filtersChanged = new EventEmitter<Record<string, any>>();

  filters: Record<string, any> = {};

  onFilterChange(key: string, value: any): void {
    if (!key) return; // Ensure key is not null or undefined
    if (Array.isArray(this.filters[key])) {
      if (value.selected) {
        this.filters[key] = [...this.filters[key], value.value];
      } else {
        this.filters[key] = this.filters[key].filter(
          (v: any) => v !== value.value
        );
      }
    } else {
      this.filters[key] = value;
    }
    this.filtersChanged.emit(this.filters);
  }

  onInputChange(event: Event, key: string): void {
    if (!key) return;
    const target = event.target as HTMLInputElement;
    const value = target?.value || '';
    this.onFilterChange(key, value);
  }

  onCheckboxChange(event: Event, key: string, option: any): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target?.checked;
    this.onFilterChange(key, { value: option, selected: isChecked });
  }

  onDropdownChange(event: Event, key: string): void {
    const target = event.target as HTMLSelectElement;
    const value = target?.value || '';
    this.onFilterChange(key, value);
  }
}
