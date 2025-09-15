import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApplicationSettings, User, UserFilters } from '@royal-code/shared/domain';
import { PaginatedList } from '@royal-code/shared/utils';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  // private readonly apiUrl: string;

  // constructor(
  //   private http: HttpClient,
  //   @Inject(APP_CONFIG) config: AppConfig
  // ) {
  //   this.apiUrl = config.apiUrl;
  // }

  private apiUrl = '/api/Users';

  constructor(private http: HttpClient) {}

  getUsers(filters: UserFilters): Observable<PaginatedList<User>> {
    let params = new HttpParams();

    Object.keys(filters).forEach((key) => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item: any) => {
            params = params.append(key, item);
          });
        } else {
          params = params.set(key, value.toString());
        }
      }
    });

    return this.http.get<PaginatedList<User>>(this.apiUrl, { params }).pipe(
      tap((response) => console.log('Received response from API:', response)), // Log API response

      map((response) => {
        console.log('Paginated response in map operator:', response);
        return response;
      }),

      catchError((error) => {
        console.error('Error fetching users:', error); // Log the error
        return throwError(error); // Pass the error along for further handling
      })
    );
  }

  getUserById(id: string): Observable<User> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<User>(url);
  }

  addUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${user.id}`, user);
  }

  deleteUser(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url);
  }

  getApplicationSettings(userId: string): Observable<ApplicationSettings> {
    return this.http.get<ApplicationSettings>(`${this.apiUrl}/${userId}`, {
      params: new HttpParams().set('settingsOnly', 'true'),
    });
  }


}
