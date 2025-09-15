import { Route } from '@angular/router';
import { LoginComponent } from './components/login/login.component';

export const authenticationRoutes: Route[] = [
  { path: '', component: LoginComponent },
];
