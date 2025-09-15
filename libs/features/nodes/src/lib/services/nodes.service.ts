import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { NodeFull, NodeSummary } from '@royal-code/shared/domain';
import { APP_CONFIG, AppConfig } from '@royal-code/core/config';
import { LoggerService } from '@royal-code/core/core-logging';

@Injectable({
  providedIn: 'root'
})
export class NodesService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${inject(APP_CONFIG).apiUrl}/nodes`;
  private logger = inject(LoggerService);


  /**
   * Haalt NodeSummary[] op voor overzichten.
   */
  getNodeSummaries(filter?: any): Observable<NodeSummary[]> {
    let params = new HttpParams();
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = (filter as any)[key];
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((item: any) => params = params.append(key, item));
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
    }
    return this.http.get<NodeSummary[]>(this.apiUrl, { params }).pipe(
      catchError(error => this.handleError(error, 'getNodeSummaries'))
    );
  }

  /**
   * Haalt volledige NodeFull details op.
   */
  getNodeById(id: string): Observable<NodeFull> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<NodeFull>(url).pipe(
      catchError(error => this.handleError(error, `getNodeById(${id})`))
    );
  }

  /**
   * Voert interactie uit en verwacht geüpdatete NodeFull terug.
   */
  interactWithNode(id: string, action: string): Observable<NodeFull> {
    const url = `${this.apiUrl}/${id}/interact`;
    return this.http.post<NodeFull>(url, { action }).pipe(
      catchError(error => this.handleError(error, `interactWithNode(${id}, ${action})`))
    );
  }


  private handleError(error: HttpErrorResponse, context: string = 'NodesService') {
    this.logger.error(`[${context}] API Call Failed`, error);

    const formattedMessage = this.logger.formatError(error);
    return throwError(() => new Error(formattedMessage));
}

}
