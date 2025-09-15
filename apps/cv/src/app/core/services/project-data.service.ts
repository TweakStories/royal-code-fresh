/**
 * @file project-data.service.ts (CV App)
 * @version 5.5.0 (FINAL FIX: Reverted to Root-Relative Asset Paths)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-20
 * @Description
 *   Definitieve service voor projectdata. Alle afbeeldingspaden zijn teruggezet
 *   naar root-relatieve paden (zonder 'assets/'), wat overeenkomt met de
 *   projectconfiguratie waarbij een 'public' of 'images' map naar de root wordt
 *   gekopieerd. Dit lost het laadprobleem in Chromium definitief op.
 */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProjectCardData, ProjectDetail, ImpactMetric } from '../models/project.model';
import { AppIcon } from '@royal-code/shared/domain';
import { MediaType } from '@royal-code/shared/domain';

@Injectable({
  providedIn: 'root'
})
export class ProjectDataService {
 private readonly allProjects: ProjectDetail[] = [
  {
      id: 'projectCrypto',
      titleKey: 'cv.projects.projectCrypto.title',
      // --- FIX: Paden zijn weer root-relatief ---
      heroImage: { id: 'crypto-guru-hero', type: MediaType.IMAGE, variants: [{ url: 'images/projects/crypto-coin-app.jpg', purpose: 'original' }] },
      galleryImages: [{ id: 'crypto-guru-mobile-img', type: MediaType.IMAGE, variants: [{ url: 'images/projects/crypto-guru-mobile.png', purpose: 'original' }] }],
      challengeKey: 'cv.projects.projectCrypto.challenge',
      myApproachKey: 'cv.projects.projectCrypto.approach',
      resultKey: 'cv.projects.projectCrypto.result',
      architectureContext: {
        titleKey: 'cv.projects.projectCrypto.architectureContext.title',
        descriptionKey: 'cv.projects.projectCrypto.architectureContext.description',
        icon: AppIcon.BrainCircuit
      },
      techStack: [
        { name: 'Angular', icon: AppIcon.Activity }, { name: 'ASP.NET Core', icon: AppIcon.Code }, { name: 'Clean Architecture', icon: AppIcon.BrainCircuit }, { name: 'SQL Server', icon: AppIcon.Database }, { name: 'SCSS', icon: AppIcon.Palette }
      ],
      githubUrl: 'https://github.com/Royw94/CryptoGuru',
      liveUrl: '#',
    },
    {
      id: 'royal-code-monorepo',
      titleKey: 'cv.projects.royal-code-monorepo.title',
      heroImage: { id: 'monorepo-hero', type: MediaType.IMAGE, variants: [{ url: 'images/projects/royal-code-1.webp', purpose: 'original' }] },
      galleryImages: [],
      challengeKey: 'cv.projects.royal-code-monorepo.challenge',
      myApproachKey: 'cv.projects.royal-code-monorepo.approach',
      resultKey: 'cv.projects.royal-code-monorepo.result',
      architectureContext: {
        titleKey: 'cv.projects.royal-code-monorepo.architectureContext.title',
        descriptionKey: 'cv.projects.royal-code-monorepo.architectureContext.description',
        icon: AppIcon.Layers
      },
      techStack: [
        { name: 'Angular', icon: AppIcon.Activity }, { name: 'NgRx', icon: AppIcon.Recycle }, { name: 'Nx Monorepo', icon: AppIcon.Grid }, { name: '.NET', icon: AppIcon.Code }, { name: 'Clean Architecture', icon: AppIcon.BrainCircuit }, { name: 'SCSS', icon: AppIcon.Palette }, { name: 'Azure', icon: AppIcon.Cloud },
      ],
      githubUrl: 'https://github.com/jouwprofiel/Royal-Code-Monorepo',
      liveUrl: 'https://jouwcv.nl',
    },
    {
      id: 'smart-spec-bot',
      titleKey: 'cv.projects.smart-spec-bot.title',
      heroImage: { id: 'smart-spec-bot-hero', type: MediaType.IMAGE, variants: [{ url: 'images/projects/smart-bot-1.webp', purpose: 'original' }] },
      galleryImages: [],
      challengeKey: 'cv.projects.smart-spec-bot.challenge',
      myApproachKey: 'cv.projects.smart-spec-bot.approach',
      resultKey: 'cv.projects.smart-spec-bot.result',
      architectureContext: {
        titleKey: 'cv.projects.smart-spec-bot.architectureContext.title',
        descriptionKey: 'cv.projects.smart-spec-bot.architectureContext.description',
        icon: AppIcon.Bot
      },
      techStack: [
        { name: 'AI', icon: AppIcon.Bot }, { name: 'LangChain', icon: AppIcon.BrainCircuit }, { name: 'Azure OpenAI', icon: AppIcon.Sparkles },
      ],
      githubUrl: '#',
    },
    {
      id: 'corporate-dashboard',
      titleKey: 'cv.projects.corporate-dashboard.title',
      heroImage: { id: 'corp-dash-hero', type: MediaType.IMAGE, variants: [{ url: 'images/projects/admin-panel.webp', purpose: 'original' }] },
      galleryImages: [],
      challengeKey: 'cv.projects.corporate-dashboard.challenge',
      myApproachKey: 'cv.projects.corporate-dashboard.approach',
      resultKey: 'cv.projects.corporate-dashboard.result',
      architectureContext: {
        titleKey: 'cv.projects.corporate-dashboard.architectureContext.title',
        descriptionKey: 'cv.projects.corporate-dashboard.architectureContext.description',
        icon: AppIcon.Castle
      },
      techStack: [
        { name: 'Angular', icon: AppIcon.Activity }, { name: 'RxJS', icon: AppIcon.Droplets }, { name: 'ASP.NET Core', icon: AppIcon.Server }, { name: 'Clean Architecture', icon: AppIcon.BrainCircuit }, { name: 'SignalR', icon: AppIcon.Waves }, { name: 'SCSS', icon: AppIcon.Palette }
      ],
      liveUrl: '#',
      githubUrl: '#'
    },
    {
      id: 'pxlTicketing',
      titleKey: 'cv.projects.pxlTicketing.title',
      heroImage: { id: 'pxl-ticketing-hero', type: MediaType.IMAGE, variants: [{ url: 'images/projects/pxl-ticketing-system.jpg', purpose: 'original' }] },
      galleryImages: [],
      challengeKey: 'cv.projects.pxlTicketing.challenge',
      myApproachKey: 'cv.projects.pxlTicketing.approach',
      resultKey: 'cv.projects.pxlTicketing.result',
      architectureContext: {
        titleKey: 'cv.projects.pxlTicketing.architectureContext.title',
        descriptionKey: 'cv.projects.pxlTicketing.architectureContext.description',
        icon: AppIcon.ListChecks
      },
      techStack: [
        { name: 'Angular', icon: AppIcon.Activity }, { name: 'Laravel (PHP)', icon: AppIcon.Code }, { name: 'MySQL', icon: AppIcon.Database }, { name: 'RESTful API', icon: AppIcon.Server }, { name: 'SCSS', icon: AppIcon.Palette }
      ],
      githubUrl: '#',
      liveUrl: '#',
    },
    {
      id: 'challengerApp',
      titleKey: 'cv.projects.challengerApp.title',
      heroImage: { id: 'challenger-hero', type: MediaType.IMAGE, variants: [{ url: 'images/projects/challenger-app-1.webp', purpose: 'original' }] },
      galleryImages: [
        { id: 'challenger-desktop-2', type: MediaType.IMAGE, variants: [{ url: 'images/projects/challenger-app-1.webp', purpose: 'original' }] },
        { id: 'challenger-desktop-3', type: MediaType.IMAGE, variants: [{ url: 'images/projects/challenger-app-1.webp', purpose: 'original' }] },
        { id: 'challenger-desktop-4', type: MediaType.IMAGE, variants: [{ url: 'images/projects/challenger-app-1.webp', purpose: 'original' }] },
        { id: 'challenger-mobile-1', type: MediaType.IMAGE, variants: [{ url: 'images/projects/challenger-app-1.webp', purpose: 'original' }] },
        { id: 'challenger-mobile-2', type: MediaType.IMAGE, variants: [{ url: 'images/projects/challenger-app-1.webp', purpose: 'original' }] },
      ],
      challengeKey: 'cv.projects.challengerApp.challenge',
      myApproachKey: 'cv.projects.challengerApp.approach',
      resultKey: 'cv.projects.challengerApp.result',
      architectureContext: {
        titleKey: 'cv.projects.challengerApp.architectureContext.title',
        descriptionKey: 'cv.projects.challengerApp.architectureContext.description',
        icon: AppIcon.FlaskConical
      },
      techStack: [
        { name: 'Angular', icon: AppIcon.Activity }, { name: 'NgRx', icon: AppIcon.Recycle }, { name: 'Nx Monorepo', icon: AppIcon.Grid }, { name: 'ASP.NET Core', icon: AppIcon.Code }, { name: 'Clean Architecture', icon: AppIcon.BrainCircuit }, { name: 'AI/LLMs', icon: AppIcon.Bot }, { name: 'Azure', icon: AppIcon.Cloud }, { name: 'SCSS', icon: AppIcon.Palette }
      ],
      githubUrl: '#',
      liveUrl: '#',
    },
    {
      id: 'plushieApp',
      titleKey: 'cv.projects.plushieApp.title',
      heroImage: { id: 'plushie-hero', type: MediaType.IMAGE, variants: [{ url: 'images/projects/plushie-paradise-1.webp', purpose: 'original' }] },
      galleryImages: [
        { id: 'plushie-desktop-2', type: MediaType.IMAGE, variants: [{ url: 'images/projects/plushie-paradise-1.webp', purpose: 'original' }] },
        { id: 'plushie-desktop-3', type: MediaType.IMAGE, variants: [{ url: 'images/projects/plushie-paradise-1.webp', purpose: 'original' }] },
        { id: 'plushie-desktop-4', type: MediaType.IMAGE, variants: [{ url: 'images/projects/plushie-paradise-1.webp', purpose: 'original' }] },
        { id: 'plushie-mobile-1', type: MediaType.IMAGE, variants: [{ url: 'images/projects/plushie-paradise-1.webp', purpose: 'original' }] },
        { id: 'plushie-mobile-2', type: MediaType.IMAGE, variants: [{ url: 'images/projects/plushie-paradise-1.webp', purpose: 'original' }] },
      ],
      challengeKey: 'cv.projects.plushieApp.challenge',
      myApproachKey: 'cv.projects.plushieApp.approach',
      resultKey: 'cv.projects.plushieApp.result',
      architectureContext: {
        titleKey: 'cv.projects.plushieApp.architectureContext.title',
        descriptionKey: 'cv.projects.plushieApp.architectureContext.description',
        icon: AppIcon.ShoppingCart
      },
      techStack: [
        { name: 'Angular', icon: AppIcon.Activity }, { name: 'NgRx', icon: AppIcon.Recycle }, { name: 'Nx Monorepo', icon: AppIcon.Grid }, { name: 'ASP.NET Core', icon: AppIcon.Code }, { name: 'Clean Architecture', icon: AppIcon.BrainCircuit }, { name: 'Stripe', icon: AppIcon.CreditCard }, { name: 'SCSS', icon: AppIcon.Palette }
      ],
      githubUrl: '#',
      liveUrl: '#',
    },
    {
      id: 'cvApp',
      titleKey: 'cv.projects.cvApp.title',
      heroImage: { id: 'cv-app-hero', type: MediaType.IMAGE, variants: [{ url: 'images/projects/cv-1.webp', purpose: 'original' }] },
      galleryImages: [
        { id: 'cv-app-desktop-2', type: MediaType.IMAGE, variants: [{ url: 'images/projects/cv-1.webp', purpose: 'original' }] },
        { id: 'cv-app-desktop-3', type: MediaType.IMAGE, variants: [{ url: 'images/projects/cv-1.webp', purpose: 'original' }] },
        { id: 'cv-app-mobile-1', type: MediaType.IMAGE, variants: [{ url: 'images/projects/cv-1.webp', purpose: 'original' }] },
        { id: 'cv-app-mobile-2', type: MediaType.IMAGE, variants: [{ url: 'images/projects/cv-1.webp', purpose: 'original' }] },
      ],
      challengeKey: 'cv.projects.cvApp.challenge',
      myApproachKey: 'cv.projects.cvApp.approach',
      resultKey: 'cv.projects.cvApp.result',
      architectureContext: {
        titleKey: 'cv.projects.cvApp.architectureContext.title',
        descriptionKey: 'cv.projects.cvApp.architectureContext.description',
        icon: AppIcon.Building
      },
      techStack: [
        { name: 'Angular', icon: AppIcon.Activity }, { name: 'NgRx', icon: AppIcon.Recycle }, { name: 'Nx Monorepo', icon: AppIcon.Grid }, { name: 'Tailwind CSS', icon: AppIcon.Palette }, { name: 'TypeScript', icon: AppIcon.FileCode }, { name: 'AI-Assisted Dev', icon: AppIcon.Bot }, { name: 'Azure Hosting', icon: AppIcon.Cloud }, { name: 'SCSS', icon: AppIcon.Palette }
      ],
      githubUrl: 'https://github.com/Royw94/royal-code-monorepo',
      liveUrl: 'https://www.royvandewetering.nl',
    },
    {
      id: 'sunnycars',
      titleKey: 'cv.projects.sunnycars.title',
      heroImage: { id: 'sunnycars-hero', type: MediaType.IMAGE, variants: [{ url: 'images/projects/sunny-cars-1.webp', purpose: 'original' }] },
      galleryImages: [
        { id: 'sunnycars-mobile-1', type: MediaType.IMAGE, variants: [{ url: 'images/projects/sunny-cars-1.webp', purpose: 'original' }] },
      ],
      challengeKey: 'cv.projects.sunnycars.challenge',
      myApproachKey: 'cv.projects.sunnycars.approach',
      resultKey: 'cv.projects.sunnycars.result',
      architectureContext: {
        titleKey: 'cv.projects.sunnycars.architectureContext.title',
        descriptionKey: 'cv.projects.sunnycars.architectureContext.description',
        icon: AppIcon.RefreshCcw
      },
      techStack: [
        { name: 'AngularJS (Legacy)', icon: AppIcon.Activity }, { name: 'Angular', icon: AppIcon.Activity }, { name: 'TypeScript', icon: AppIcon.FileCode }, { name: 'RxJS', icon: AppIcon.Droplets }, { name: 'SCSS', icon: AppIcon.Palette }, { name: 'Go (Backend)', icon: AppIcon.Code }
      ],
      githubUrl: '#',
      liveUrl: 'https://www.sunnycars.nl/',
    },
    {
      id: 'vandervalk',
      titleKey: 'cv.projects.vandervalk.title',
      heroImage: { id: 'vandervalk-hero', type: MediaType.IMAGE, variants: [{ url: 'images/projects/van-der-valk-1.webp', purpose: 'original' }] },
      galleryImages: [
        { id: 'vandervalk-mobile-1', type: MediaType.IMAGE, variants: [{ url: 'images/projects/van-der-valk-1.webp', purpose: 'original' }] },
      ],
      challengeKey: 'cv.projects.vandervalk.challenge',
      myApproachKey: 'cv.projects.vandervalk.approach',
      resultKey: 'cv.projects.vandervalk.result',
      architectureContext: {
        titleKey: 'cv.projects.vandervalk.architectureContext.title',
        descriptionKey: 'cv.projects.vandervalk.architectureContext.description',
        icon: AppIcon.Building
      },
      techStack: [
        { name: 'AngularJS (Legacy)', icon: AppIcon.Activity }, { name: 'Angular', icon: AppIcon.Activity }, { name: 'TypeScript', icon: AppIcon.FileCode }, { name: 'RxJS', icon: AppIcon.Droplets }, { name: 'SCSS', icon: AppIcon.Palette }, { name: 'Java (Backend)', icon: AppIcon.Code }
      ],
      githubUrl: '#',
      liveUrl: 'https://www.valk.com/nl/hotel-restaurant/',
    }
  ];

  getAllProjectsForOverview(): Observable<ProjectCardData[]> {
    return of(this.allProjects).pipe(
      map(details => details.map(detail => ({
        id: detail.id,
        image: detail.heroImage,
        titleKey: detail.titleKey,
        descriptionKey: `cv.projects.${detail.id}.description`,
        techStack: detail.techStack,
        routePath: `/projects/${detail.id}`,
        impactMetrics: this.getImpactMetricsForProject(detail.id)
      })))
    );
  }

  getProjectById(id: string): Observable<ProjectDetail | undefined> {
    const project = this.allProjects.find(p => p.id === id);
    return of(project);
  }

    private getImpactMetricsForProject(id: string): ImpactMetric[] | undefined {
    switch(id) {
      case 'royal-code-monorepo':
        return [
          { label: 'cv.projects.metrics.developerVelocity', value: '+70%', icon: AppIcon.Zap },
          { label: 'cv.projects.metrics.architecturalBugs', value: '-90%', icon: AppIcon.BadgeCheck },
        ];
      case 'smart-spec-bot':
        return [
          { label: 'cv.projects.metrics.timeToMarket', value: '-70%', icon: AppIcon.Zap },
          { label: 'cv.projects.metrics.specConsistency', value: '100%', icon: AppIcon.RefreshCcw },
        ];
       case 'corporate-dashboard':
        return [
          { label: 'cv.projects.metrics.decisionMaking', value: 'Real-time', icon: AppIcon.Clock },
        ];
       case 'projectCrypto':
        return [
          { label: 'cv.projects.metrics.dataSources', value: '6 Integrated', icon: AppIcon.Database },
          { label: 'cv.projects.metrics.tradeSignals', value: 'Real-time', icon: AppIcon.Bot },
        ];
       case 'pxlTicketing':
        return [
          { label: 'cv.projects.metrics.manualEntry', value: '-40%', icon: AppIcon.FileText },
          { label: 'cv.projects.metrics.resolutionTime', value: 'Faster', icon: AppIcon.CheckCheck },
        ];
       case 'challengerApp':
        return [
          { label: 'cv.projects.metrics.userRetention', value: 'Higher', icon: AppIcon.Heart },
          { label: 'cv.projects.metrics.personalization', value: 'AI-Driven', icon: AppIcon.Sparkles },
        ];
       case 'plushieApp':
        return [
          { label: 'cv.projects.metrics.checkoutFlow', value: 'Faster', icon: AppIcon.ShoppingCart },
          { label: 'cv.projects.metrics.productCatalog', value: 'Scalable', icon: AppIcon.Package },
        ];
       case 'cv-app':
        return [
          { label: 'cv.projects.metrics.conversionFocus', value: 'High', icon: AppIcon.UserCheck },
          { label: 'cv.projects.metrics.performanceScore', value: 'Optimized', icon: AppIcon.Gauge },
          { label: 'cv.projects.metrics.accessibility', value: 'WCAG AA', icon: AppIcon.ShieldCheck },
        ];
       case 'sunnycars':
        return [
          { label: 'cv.projects.metrics.pageLoadTime', value: '-40%', icon: AppIcon.Gauge },
          { label: 'cv.projects.metrics.buildTimes', value: '-60%', icon: AppIcon.Zap },
          { label: 'cv.projects.metrics.techDebt', value: 'Reduced', icon: AppIcon.Recycle },
        ];
       case 'vandervalk':
        return [
          { label: 'cv.projects.metrics.bookingConversion', value: '+12%', icon: AppIcon.CheckCheck },
          { label: 'cv.projects.metrics.userExperience', value: 'Modernized', icon: AppIcon.Smile },
          { label: 'cv.projects.metrics.mobilePerformance', value: 'Responsive', icon: AppIcon.Smartphone },
        ];
      default:
        return undefined;
    }
  }
}