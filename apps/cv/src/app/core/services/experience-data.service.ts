/**
 * @file experience-data.service.ts (CV App)
 * @version 4.5.0 (Job1 Comprehensive Refinement - Final)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-04
 * @Description Centrale service voor het aanleveren van alle data gerelateerd aan werkervaring,
 *              opleiding en certificaten, nu met een gedetailleerde en overtuigende Job1 beschrijving.
 */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WorkExperienceItem, EducationItem, CertificationItem } from '../models/experience.model';
import { AppIcon } from '@royal-code/shared/domain';

@Injectable({ providedIn: 'root' })
export class ExperienceDataService {

  private readonly workExperienceData: WorkExperienceItem[] = [
    {
      id: 'exp1',
      jobTitleKey: 'cv.experience.job1.title', // Senior Full-Stack Architect & Lead Developer
      companyName: 'Royal-Code Monorepo (Startup, Intern)',
      companyLogoUrl: 'images/default-image.webp', // Placeholder
      location: 'Katwijk, NL (Volledig remote)',
      periodKey: 'cv.experience.job1.period', // Jan 2020 – Heden (of de specifieke 2023-2025 periode als die de focus is)
      startDate: new Date('2020-01-01'), // Aanpassen naar 2023-01-01 als dit de start is van de monorepo-rol
      techStack: [
        { name: 'C#/.NET 9', icon: AppIcon.Code },
        { name: 'Angular 20', icon: AppIcon.Activity },
        { name: 'Nx Monorepo', icon: AppIcon.Grid },
        { name: 'Clean Architecture', icon: AppIcon.BrainCircuit },
        { name: 'Specification-Driven Dev', icon: AppIcon.Book },
        { name: 'AI/LLMs', icon: AppIcon.Bot },
        { name: 'Azure', icon: AppIcon.Cloud },
      ],
      detailRoutePath: '/werkervaring/royal-code-monorepo',
      situationKey: 'cv.experience.job1.situation', // Aangescherpt
      taskKey: 'cv.experience.job1.task', // Aangescherpt
      actionKey: 'cv.experience.job1.action', // Aangescherpt
      results: [
        { icon: AppIcon.Zap, descriptionKey: 'cv.experience.job1.result1' }, // 70% snellere feature init
        { icon: AppIcon.BadgeCheck, descriptionKey: 'cv.experience.job1.result2' }, // 90% minder architectuur bugs
        { icon: AppIcon.Users, descriptionKey: 'cv.experience.job1.result3' }, // Juniors 3 dagen productief
        { icon: AppIcon.Wrench, descriptionKey: 'cv.experience.job1.result4' }, // TCO reductie
      ]
    },
    {
      id: 'exp2', // ID behouden voor consistentie met eerdere referenties
      jobTitleKey: 'cv.experience.job2.title', // Frontend Developer
      companyName: 'New Story',
      companyLogoUrl: 'images/default-image.webp', // Placeholder
      location: 'Noordwijk, NL',
      periodKey: 'cv.experience.job2.period', // Okt 2022 – Okt 2023
      startDate: new Date('2022-10-01'),
      techStack: [
        { name: 'Angular', icon: AppIcon.Activity },
        { name: 'AngularJS (Legacy)', icon: AppIcon.Code },
        { name: 'TypeScript', icon: AppIcon.FileCode },
        { name: 'SCSS', icon: AppIcon.Palette },
      ],
      detailRoutePath: '/werkervaring/new-story-angularjs-migration',
      situationKey: 'cv.experience.job2.situation',
      taskKey: 'cv.experience.job2.task',
      actionKey: 'cv.experience.job2.action',
      results: [
        { icon: AppIcon.RefreshCcw, descriptionKey: 'cv.experience.job2.result1' },
        { icon: AppIcon.Lightbulb, descriptionKey: 'cv.experience.job2.result2' },
        { icon: AppIcon.CheckCheck, descriptionKey: 'cv.experience.job2.result3' },
      ]
    },
    {
      id: 'exp3',
      jobTitleKey: 'cv.experience.job3.title', // Technisch Projectondersteuner
      companyName: 'Heineken Brouwerij',
      companyLogoUrl: 'images/default-image.webp', // Placeholder
      location: 'Alphen a/d Rijn, NL',
      periodKey: 'cv.experience.job3.period', // Sep 2015 – Jul 2018
      startDate: new Date('2015-09-01'),
      techStack: [
        { name: 'Siemens PLCs', icon: AppIcon.BrainCircuit },
        { name: 'Troubleshooting', icon: AppIcon.Wrench },
        { name: 'Project Support', icon: AppIcon.Briefcase },
      ],
      detailRoutePath: '/werkervaring/heineken-brouwerij',
      situationKey: 'cv.experience.job3.situation',
      taskKey: 'cv.experience.job3.task',
      actionKey: 'cv.experience.job3.action',
      results: [
        { icon: AppIcon.RefreshCcw, descriptionKey: 'cv.experience.job3.result1' },
        { icon: AppIcon.ListChecks, descriptionKey: 'cv.experience.job3.result2' },
        { icon: AppIcon.Lightbulb, descriptionKey: 'cv.experience.job3.result3' },
      ]
    },
    {
      id: 'exp4',
      jobTitleKey: 'cv.experience.job4.title', // Stagiair Industriële Automatisering
      companyName: 'BRON Drukwerkveredeling',
      companyLogoUrl: 'images/default-image.webp', // Placeholder
      location: 'Valkenburg, NL',
      periodKey: 'cv.experience.job4.period', // Sep 2012 – Feb 2013
      startDate: new Date('2012-09-01'),
      techStack: [
        { name: 'Elektronica', icon: AppIcon.Flash },
        { name: 'Machine Onderhoud', icon: AppIcon.Hammer },
        { name: 'Probleemanalyse', icon: AppIcon.Search },
      ],
      detailRoutePath: '/werkervaring/bron-drukwerkveredeling',
      situationKey: 'cv.experience.job4.situation',
      taskKey: 'cv.experience.job4.task',
      actionKey: 'cv.experience.job4.action',
      results: [
        { icon: AppIcon.Zap, descriptionKey: 'cv.experience.job4.result1' },
        { icon: AppIcon.Box, descriptionKey: 'cv.experience.job4.result2' },
      ]
    },
    {
      id: 'exp-new-story', // Originele New Story, nu verschoven naar correcte periode
      jobTitleKey: 'cv.experience.jobNewStory.title', // Front-end Angular developer
      companyName: 'New Story',
      companyLogoUrl: 'images/default-image.webp', // Placeholder
      location: 'Noordwijk, NL',
      periodKey: 'cv.experience.jobNewStory.period', // 2022 – 2023
      startDate: new Date('2022-01-01'), // Correcte startdatum
      techStack: [
        { name: 'Angular', icon: AppIcon.Activity },
        { name: 'TypeScript', icon: AppIcon.FileCode },
        { name: 'SCSS', icon: AppIcon.Palette },
      ],
      detailRoutePath: '/werkervaring/new-story',
      situationKey: 'cv.experience.jobNewStory.situation',
      taskKey: 'cv.experience.jobNewStory.task',
      actionKey: 'cv.experience.jobNewStory.action',
      results: [
        { icon: AppIcon.CheckCheck, descriptionKey: 'cv.experience.jobNewStory.result1' },
        { icon: AppIcon.Users, descriptionKey: 'cv.experience.jobNewStory.result2' },
        { icon: AppIcon.Briefcase, descriptionKey: 'cv.experience.jobNewStory.result3' },
      ]
    },
    {
      id: 'exp-pxl-trainee',
      jobTitleKey: 'cv.experience.jobPxlTrainee.title', // Angular & Laravel trainee
      companyName: 'PXL',
      companyLogoUrl: 'images/default-image.webp', // Placeholder
      location: 'Hasselt, BE',
      periodKey: 'cv.experience.jobPxlTrainee.period', // 2021 - 2021
      startDate: new Date('2021-01-01'),
      techStack: [
        { name: 'Angular', icon: AppIcon.Activity },
        { name: 'Laravel', icon: AppIcon.Code },
        { name: 'MySQL', icon: AppIcon.Database },
      ],
      detailRoutePath: '/werkervaring/pxl-trainee',
      situationKey: 'cv.experience.jobPxlTrainee.situation',
      taskKey: 'cv.experience.jobPxlTrainee.task',
      actionKey: 'cv.experience.jobPxlTrainee.action',
      results: [
        { icon: AppIcon.CheckCheck, descriptionKey: 'cv.experience.jobPxlTrainee.result1' },
        { icon: AppIcon.ListChecks, descriptionKey: 'cv.experience.jobPxlTrainee.result2' },
      ]
    },
    {
      id: 'exp-bron',
      jobTitleKey: 'cv.experience.jobBron.title', // Storingsoplosser & elektromonteur
      companyName: 'Bron drukwerkveredeling',
      companyLogoUrl: 'images/default-image.webp', // Placeholder
      location: 'Valkenburg, NL',
      periodKey: 'cv.experience.jobBron.period', // 2015-2017
      startDate: new Date('2015-01-01'),
      techStack: [
        { name: 'Elektrotechniek', icon: AppIcon.Wrench },
        { name: 'Machine Onderhoud', icon: AppIcon.Hammer },
      ],
      detailRoutePath: '/werkervaring/bron-drukwerkveredeling',
      situationKey: 'cv.experience.jobBron.situation',
      taskKey: 'cv.experience.jobBron.task',
      actionKey: 'cv.experience.jobBron.action',
      results: [
        { icon: AppIcon.CheckCheck, descriptionKey: 'cv.experience.jobBron.result1' },
        { icon: AppIcon.Tool, descriptionKey: 'cv.experience.jobBron.result2' },
      ]
    },
    {
      id: 'exp-heineken',
      jobTitleKey: 'cv.experience.jobHeineken.title', // Technische dienst (stage)
      companyName: 'Heineken',
      companyLogoUrl: 'images/default-image.webp', // Placeholder
      location: 'Alphen a/d Rijn, NL',
      periodKey: 'cv.experience.jobHeineken.period', // 2013
      startDate: new Date('2013-01-01'),
      techStack: [
        { name: 'PLC Programmeren', icon: AppIcon.BrainCircuit },
        { name: 'Storing Analyse', icon: AppIcon.Search },
      ],
      detailRoutePath: '/werkervaring/heineken-stage',
      situationKey: 'cv.experience.jobHeineken.situation',
      taskKey: 'cv.experience.jobHeineken.task',
      actionKey: 'cv.experience.jobHeineken.action',
      results: [
        { icon: AppIcon.CheckCheck, descriptionKey: 'cv.experience.jobHeineken.result1' },
        { icon: AppIcon.Tool, descriptionKey: 'cv.experience.jobHeineken.result2' },
      ]
    },
    {
      id: 'exp-aldi',
      jobTitleKey: 'cv.experience.jobAldi.title', // Kassa | Vakkenvuller | Administratie
      companyName: 'ALDI',
      companyLogoUrl: 'images/default-image.webp', // Placeholder
      location: 'Katwijk, NL',
      periodKey: 'cv.experience.jobAldi.period', // 2009 - 2015
      startDate: new Date('2009-01-01'),
      techStack: [
        { name: 'Klantenservice', icon: AppIcon.Handshake },
        { name: 'Administratie', icon: AppIcon.FileText },
      ],
      detailRoutePath: '/werkervaring/aldi',
      situationKey: 'cv.experience.jobAldi.situation',
      taskKey: 'cv.experience.jobAldi.task',
      actionKey: 'cv.experience.jobAldi.action',
      results: [
        { icon: AppIcon.Users, descriptionKey: 'cv.experience.jobAldi.result1' },
        { icon: AppIcon.CheckCheck, descriptionKey: 'cv.experience.jobAldi.result2' },
      ]
    },
    {
      id: 'exp-lidl',
      jobTitleKey: 'cv.experience.jobLidl.title', // Vakkenvuller
      companyName: 'Lidl',
      companyLogoUrl: 'images/default-image.webp', // Placeholder
      location: 'Katwijk, NL',
      periodKey: 'cv.experience.jobLidl.period', // 2014 - 2015
      startDate: new Date('2014-01-01'),
      techStack: [
        { name: 'Teamwork', icon: AppIcon.Users },
        { name: 'Efficiëntie', icon: AppIcon.Zap },
      ],
      detailRoutePath: '/werkervaring/lidl',
      situationKey: 'cv.experience.jobLidl.situation',
      taskKey: 'cv.experience.jobLidl.task',
      actionKey: 'cv.experience.jobLidl.action',
      results: [
        { icon: AppIcon.Users, descriptionKey: 'cv.experience.jobLidl.result1' },
        { icon: AppIcon.CheckCheck, descriptionKey: 'cv.experience.jobLidl.result2' },
      ]
    }
  ].sort((a, b) => b.startDate.getTime() - a.startDate.getTime()); // Sorteer nieuwste eerst

  private readonly educationData: EducationItem[] = [
    {
      id: 'edu-pxl-applied', degreeKey: 'cv.experience.eduPxlApplied.degree', institutionName: 'Hogeschool PXL', periodKey: 'cv.experience.eduPxlApplied.period', descriptionKey: 'cv.experience.eduPxlApplied.description'
    },
    {
      id: 'edu-roc-leiden', degreeKey: 'cv.experience.eduRocLeiden.degree', institutionName: 'ROC Leiden', periodKey: 'cv.experience.eduRocLeiden.period', descriptionKey: 'cv.experience.eduRocLeiden.description'
    }
  ];

  private readonly certificationsData: CertificationItem[] = [
    {
      id: 'cert1', nameKey: 'cv.experience.cert1.name', issuingBody: 'Microsoft', dateKey: 'cv.experience.cert1.date', credentialUrl: '#'
    },
  ];

  getWorkExperience(): Observable<WorkExperienceItem[]> {
    return of(this.workExperienceData);
  }

  getEducation(): Observable<EducationItem[]> {
    return of(this.educationData);
  }

  getCertifications(): Observable<CertificationItem[]> {
    return of(this.certificationsData);
  }
}