import { Route } from '@angular/router';
import { QuestsComponent } from './quests/quests.component';
import { QuestLogComponent } from './quest-log/quest-log.component';
import { provideQuestsFeature } from './state/quests.providers';

export const questsRoutes: Route[] = [
  {
    path: '',
    providers: [provideQuestsFeature()],
    component: QuestLogComponent,
  },
];
