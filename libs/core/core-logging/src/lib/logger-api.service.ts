import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LogEntry } from './store/logger.reducer';

@Injectable({ providedIn: 'root' })
export class LoggerApiService {
  private apiUrl = '/api/logs';

  constructor(private http: HttpClient) {}

  sendLog(log: LogEntry): Observable<LogEntry> {
    return this.http.post<LogEntry>(this.apiUrl, log);
  }
}
