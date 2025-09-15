// libs/features/nodes/src/lib/nodes.routes.ts
import { Route } from '@angular/router';

// Importeer componenten (pas paden aan indien nodig binnen de lib)
import { NodeOverviewMapComponent } from './components/node-overview-map/node-overview-map.component';
import { NodeDetailComponent } from './components/node-detail/node-detail.component';
import { provideSocialFeature } from '@royal-code/features/social';
import { nodeDetailResolver } from './resolvers/node-detail.resolver';
import { provideNodesFeature } from './node.providers';
import { provideQuestsFeature } from '@royal-code/features/quests';

// Importeer state/effects (pas paden aan indien nodig binnen de lib)
// Importeer authGuard eventueel
// import { authGuard } from '@royal-code/features/authentication';

export const nodesFeatureRoutes: Route[] = [
  // Geef het een duidelijke naam
  {
    // Dit lege pad matcht met het 'nodes' segment uit app.routes.ts
    path: '',
    // Providers specifiek voor deze feature
    providers: [provideNodesFeature(), provideSocialFeature(), provideQuestsFeature()],
    children: [
      // Default route voor '/nodes' -> Overview Component
      {
        path: '', // Matcht '/nodes' exact
        component: NodeOverviewMapComponent,
        title: 'Node Map Overview',
        // canActivate: [authGuard] // Optioneel
        pathMatch: 'full', // Belangrijk
      },
      // Route voor '/nodes/:id' -> Detail Component
      {
        path: ':id', // Matcht '/nodes/xyz'
        component: NodeDetailComponent,
        title: 'Node Detail',
        resolve: {
          resolvedData: nodeDetailResolver, // Zorg ervoor dat deze resolver is geregistreerd in de module
        },
      },
    ],
  },
];
