import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FilterConfig } from '@royal-code/shared/domain';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterChallengeService {

  // private readonly apiUrl: string;

  // constructor(
  //   private http: HttpClient,
  //   @Inject(APP_CONFIG) config: AppConfig
  // ) {
  //   this.apiUrl = config.apiUrl;
  // }

  private apiUrl = '/api/filters';

  constructor(private http: HttpClient) {}

  getFilterConfig(): Observable<FilterConfig[]> {
    return this.http.get<FilterConfig[]>(this.apiUrl);
  }
}
