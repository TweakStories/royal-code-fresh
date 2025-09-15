import { Route } from '@angular/router';
import { JsonOutputViewerComponent } from './json-output-viewer-feature/json-output-viewer-feature.component';

export const jsonOutputViewerFeatureRoutes: Route[] = [
  { path: '', component: JsonOutputViewerComponent },
];
