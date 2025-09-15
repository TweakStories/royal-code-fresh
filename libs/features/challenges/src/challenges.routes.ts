// libs/features/challenges/src/lib/challenges.routes.ts
import { Route } from '@angular/router';
// ... andere imports ...
import { ChallengesOverviewComponent } from './pages/overview/challenges-overview.component';
import { ChallengeDetailComponent } from './components/detail/challenge-detail.component';
import { provideChallengesFeature } from './challenges.providers';
import { provideSocialFeature } from '@royal-code/features/social';
import { provideQuestsFeature } from '@royal-code/features/quests';
import { provideNodesFeature } from '@royal-code/features/nodes';

export const challengesFeatureRoutes: Route[] = [
  {
    path: '', // Basis voor /challenges
    providers: [provideChallengesFeature(),
      provideNodesFeature(),
      provideSocialFeature(),
      provideQuestsFeature()
      ],
    children: [
      // EERST de meest specifieke routes
      {
        path: 'overview', // Matcht /challenges/overview EXACT
        component: ChallengesOverviewComponent, // <-- De OVERVIEW component hier!
        title: 'Challenges Overview'
      },
      // DAN de route met de parameter
      {
        path: ':id', // Matcht /challenges/alles-anders
        component: ChallengeDetailComponent, // <-- De DETAIL component hier!
        title: 'Challenge Detail'
      },
       // DAN pas de redirect voor het basispad (optioneel)
       {
         path: '', // Matcht /challenges EXACT
         redirectTo: 'overview', // Stuur door naar /challenges/overview
         pathMatch: 'full'
       }
    ]
  }
];
