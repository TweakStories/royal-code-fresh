import { Route } from '@angular/router';
import { CharacterStatsPageComponent } from './pages/character-stats-page/character-stats-page.component'; // Importeer de nieuwe page
import { SkillsPageComponent } from './pages/skills-page/skills-page.component';
import { CharacterProgressionSummaryPageComponent } from './pages/character-progression-summary/character-progression-summary.component';

export const characterProgressionRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'summary', // Of 'skills' als dat je default view moet zijn
    pathMatch: 'full',
  },
  {
    path: 'summary',
    component: CharacterProgressionSummaryPageComponent,
    title: 'Progression Summary'
  },
  {
    path: 'stats',
    component: CharacterStatsPageComponent,
    title: 'Full Character Stats'
  },
  {
    path: 'skills', // Zal matchen met /character-progression/skills
    component: SkillsPageComponent,
    title: 'Skills & Talents'
  },
  {
    path: 'skills/:category', // Zal matchen met /character-progression/skills/strength etc.
    component: SkillsPageComponent,
    title: 'Skill Category'
  }
];
