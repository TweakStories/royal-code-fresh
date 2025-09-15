// error-log-panel.component.ts
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LogEntry, LoggerState } from '../../store/logger.reducer';
import { selectErrorLogs } from '../../store/logger.selectors';

@Component({
  selector: 'lib-error-log-panel',
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-0 right-0 w-[300px] max-h-[50vh] border border-neutral-700 p-4 bg-gray-900 text-white overflow-auto z-[1000]">
      <h2 class="text-xl mb-2">Error Logs</h2>
      @if (errorLogs$ | async; as logs) {
        @for (log of logs; track log.createdAt) {
          <div class="mb-2 border-b border-gray-700 pb-1">
            <div class="font-bold">{{ log.createdAt | date:'shortTime' }} - {{ log.message }}</div>
            <div class="text-sm text-gray-400">{{ log.data | json }}</div>
          </div>
        }
      } @else {
        <div>Geen errors gelogd.</div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorLogPanelComponent {
  errorLogs$: Observable<LogEntry[]>;

  private store = inject<Store<LoggerState>>(Store);

  constructor() {
    this.errorLogs$ = this.store.pipe(select(selectErrorLogs));
  }
}