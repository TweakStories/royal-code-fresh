import { Route } from '@angular/router';
import { CvHomepageComponent } from './features/home/home.component';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.CvHomepageComponent),
    title: 'Home | Roy van de Wetering',
  },
  {
    path: 'projects',
    loadComponent: () => import('./features/projects-overview/projects-overview.component').then(m => m.ProjectsOverviewComponent),
    title: 'Mijn Projecten | Roy van de Wetering',
  },
  {
    path: 'projects/:id',
    loadComponent: () => import('./features/project-detail/project-detail.component').then(m => m.ProjectDetailComponent),
    title: 'Project Details | Roy van de Wetering',
  },
  {
    path: 'werkervaring',
    loadComponent: () => import('./features/experience/experience.component').then(m => m.ExperienceComponent),
    title: 'Werkervaring | Roy van de Wetering',
  },
  {
    path: 'skills',
    loadComponent: () => import('./features/skills-page/skills-page.component').then(m => m.SkillsPageComponent),
    title: 'Mijn Vaardigheden | Roy van de Wetering',
  },
  {
    path: 'architectuur',
    loadComponent: () => import('./features/architecture-page/architecture-page.component').then(m => m.ArchitecturePageComponent),
    title: 'Architectuur | Roy van de Wetering',
  },
  {
    path: 'ai-workflow',
    loadComponent: () => import('./features/ai-workflow-page/ai-workflow-page.component').then(m => m.AiWorkflowPageComponent),
    title: 'AI Workflow | Roy van de Wetering',
  },
  {
    path: 'over-mij',
    loadComponent: () => import('./features/about-me-page/about-me-page.component').then(m => m.AboutMePageComponent),
    title: 'Over Mij | Roy van de Wetering',
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact-page/contact-page.component').then(m => m.ContactPageComponent),
    title: 'Contact | Roy van de Wetering',
  },
  {
    path: '**', // Fallback route
    redirectTo: '',
    pathMatch: 'full'
  }
];