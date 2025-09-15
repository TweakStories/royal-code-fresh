/**
 * @file experience.model.ts (CV App)
 * @version 2.0.0 (STAR Method Integration)
 * @description Defines data structures for work experience, education, and certificates,
 *              now refactored to support the STAR method for impactful storytelling.
 */
import { AppIcon } from "@royal-code/shared/domain";

export interface WorkExperienceItem {
  id: string;
  jobTitleKey: string;
  companyName: string;
  companyLogoUrl: string;
  location: string;
  periodKey: string;
  startDate: Date;
  techStack: { name: string, icon?: AppIcon }[];
  detailRoutePath: string; // Pad naar een eventuele detailpagina

  // === STAR Method Properties ===
  situationKey: string;
  taskKey: string;
  actionKey: string;
  results: {
    descriptionKey: string;
    icon?: AppIcon;
  }[];
}

export interface EducationItem {
  id: string;
  degreeKey: string;
  institutionName: string;
  periodKey: string;
  descriptionKey?: string;
}

export interface CertificationItem {
  id: string;
  nameKey: string;
  issuingBody: string;
  dateKey: string;
  credentialUrl?: string;
}