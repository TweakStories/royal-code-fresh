/**
 * @file project.model.ts (CV App)
 * @version 3.1.0 (Impact-Driven & Narrative-Aligned)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-04
 * @Description Defines data structures for projects, fully aligned with the
 *              "business case" narrative of the CV. Includes impact metrics and
 *              an architecture context section.
 */
import { Image } from '@royal-code/shared/domain';
import { AppIcon } from '@royal-code/shared/domain';

// Interface for a single, quantifiable impact metric.
export interface ImpactMetric {
  label: string;
  value: string;
  icon: AppIcon;
}

// Model for the project overview card.
export interface ProjectCardData {
  id: string;
  image: Image;
  titleKey: string;
  descriptionKey: string;
  impactMetrics?: ImpactMetric[];
  techStack: { name: string, icon?: AppIcon }[];
  routePath: string;
}

// Extended model for the project detail page.
export interface ProjectDetail {
  id: string;
  titleKey: string;
  heroImage: Image;
  galleryImages: Image[];
  challengeKey: string;
  myApproachKey: string;
  resultKey: string;
  architectureContext?: {
    titleKey: string;
    descriptionKey: string;
    icon: AppIcon;
  };
  techStack: { name: string, icon?: AppIcon }[];
  liveUrl?: string;
  githubUrl?: string;
  underTheHood?: {
    titleKey: string;
    descriptionKey: string;
    image: Image;
    githubLink: string;
  }[];
}