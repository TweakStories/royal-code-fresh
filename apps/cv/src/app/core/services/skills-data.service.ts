/**
 * @file skills-data.service.ts (CV App)
 * @description Centrale service voor het aanleveren van alle vaardigheidsdata.
 */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SkillCategory } from '../models/skills.model';
import { AppIcon } from '@royal-code/shared/domain';

@Injectable({
  providedIn: 'root'
})
export class SkillsDataService {
  private readonly allSkills: SkillCategory[] = [
    {
      categoryNameKey: 'cv.skills.backendDevAndDatabases',
      skills: [
        { name: 'C# & .NET (ASP.NET Core 9)', icon: AppIcon.Code },
        { name: 'Clean Architecture / DDD', icon: AppIcon.Sparkles },
        { name: 'CQRS & MediatR', icon: AppIcon.Share },
        { name: 'RESTful API Design', icon: AppIcon.Server },
        { name: 'Entity Framework Core 9', icon: AppIcon.Database },
        { name: 'SQL Server & SQLite', icon: AppIcon.Database },
        { name: 'FluentValidation', icon: AppIcon.CheckCheck },
        { name: 'Serilog (Logging)', icon: AppIcon.List },
      ],
    },
    {
      categoryNameKey: 'cv.skills.frontendDevAndUi',
      skills: [
        { name: 'Angular (v20+, Signals API, Control Flow)', icon: AppIcon.Activity },
        { name: 'TypeScript', icon: AppIcon.FileCode },
        { name: 'NgRx (met Signals & createFeature)', icon: AppIcon.Recycle },
        { name: 'RxJS', icon: AppIcon.Droplets },
        { name: 'Tailwind CSS (v4+, CSS Vars)', icon: AppIcon.Palette },
        { name: 'Angular CDK', icon: AppIcon.Layers },
        { name: 'i18n (ngx-translate)', icon: AppIcon.Globe },
        { name: 'Component Libraries (Nx UI)', icon: AppIcon.Box },
      ],
    },
    {
      categoryNameKey: 'cv.skills.cloudDevOpsAndTooling',
      skills: [
        { name: 'Microsoft Azure', icon: AppIcon.Cloud },
        { name: 'Azure DevOps (CI/CD, YAML)', icon: AppIcon.Truck },
        { name: 'Docker', icon: AppIcon.Package },
        { name: 'Nx Monorepos', icon: AppIcon.Grid },
        { name: 'Git & GitHub', icon: AppIcon.GitPullRequest },
        { name: 'ESLint & Prettier', icon: AppIcon.PenTool },
        { name: 'Unit Testing (Jest, xUnit)', icon: AppIcon.ShieldCheck },
        { name: 'E2E Testing (Playwright)', icon: AppIcon.MousePointer },
      ],
    },
    {
      categoryNameKey: 'cv.skills.aiAnd3dGraphics',
      skills: [
        { name: 'Prompt Engineering', icon: AppIcon.Bot },
        { name: 'AI-Assisted Development', icon: AppIcon.BrainCircuit },
        { name: 'Babylon.js (3D Rendering)', icon: AppIcon.Box3d },
        { name: 'Three.js (3D Rendering)', icon: AppIcon.Cone },
        { name: 'Real-time Systemen', icon: AppIcon.Watch },
        { name: 'Asset Pipeline & Optimization', icon: AppIcon.Hammer },
      ],
    },
    // NIEUWE SKILL CATEGORIE: Back-End Development (uit oud CV)
    {
      categoryNameKey: 'cv.skills.oldBackendDevelopment',
      skills: [
        { name: 'ASP.NET Core', icon: AppIcon.Code },
        { name: 'Clean-Architecture', icon: AppIcon.BrainCircuit },
        { name: 'SQL', icon: AppIcon.Database },
      ],
    },
    // NIEUWE SKILL CATEGORIE: Front-End UI/UX Design (uit oud CV)
    {
      categoryNameKey: 'cv.skills.oldFrontendUiUxDesign',
      skills: [
        { name: 'Angular', icon: AppIcon.Activity },
        { name: 'JavaScript', icon: AppIcon.FileCode },
        { name: 'Redux', icon: AppIcon.Recycle },
        { name: 'Tailwind', icon: AppIcon.Palette },
        { name: 'HTML5', icon: AppIcon.Code },
        { name: 'SCSS', icon: AppIcon.Palette },
      ],
    },
    // NIEUWE SKILL CATEGORIE: Social Skills (uit oud CV)
    {
      categoryNameKey: 'cv.skills.oldSocialSkills',
      skills: [
        { name: 'Dutch', icon: AppIcon.Globe },
        { name: 'English', icon: AppIcon.Globe },
        { name: 'Jira', icon: AppIcon.ListChecks },
      ],
    },
  ];

  constructor() { }

  getAllSkillCategories(): Observable<SkillCategory[]> {
    return of(this.allSkills);
  }

  getFeaturedSkillCategories(): Observable<SkillCategory[]> {
    const featuredCategories = this.allSkills.filter(
      cat => cat.categoryNameKey !== 'cv.skills.cloudDevOpsAndTooling' && cat.categoryNameKey !== 'cv.skills.aiAnd3dGraphics' && cat.categoryNameKey !== 'cv.skills.oldSocialSkills'
    );
    return of(featuredCategories);
  }
}