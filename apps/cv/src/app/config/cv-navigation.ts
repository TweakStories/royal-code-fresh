/**
 * @file cv-navigation.ts
 * @Version 2.1.0 (FIX: Implemented 'external' property)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   De navigatiedata voor de CV-app, nu met de correcte 'external: true'
 *   property voor de downloadlink van het CV.
 */
import { AppIcon, NavigationItem, NavDisplayHintEnum } from '@royal-code/shared/domain';
import { AppNavigationConfig } from '@royal-code/core';

const primaryNav: NavigationItem[] = [
  { id: 'home-cv', labelKey: 'cv.navigation.home', route: '/', icon: AppIcon.Home, displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal] },
  { id: 'projects-cv', labelKey: 'cv.navigation.projects', route: '/projects', icon: AppIcon.Package, displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal] },
  { id: 'experience-cv', labelKey: 'cv.navigation.experience', route: '/werkervaring', icon: AppIcon.Briefcase, displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal] },
  { id: 'skills-cv', labelKey: 'cv.navigation.skills', route: '/skills', icon: AppIcon.Gauge, displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal] },
  { id: 'architecture-cv', labelKey: 'cv.navigation.architecture', route: '/architectuur', icon: AppIcon.Grid, displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal] },
  { id: 'ai-workflow-cv', labelKey: 'cv.navigation.aiWorkflow', route: '/ai-workflow', icon: AppIcon.Bot, displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal] },
  { id: 'about-me-cv', labelKey: 'cv.navigation.aboutMe', route: '/over-mij', icon: AppIcon.UserCircle, displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal] },
  { id: 'contact-cv', labelKey: 'cv.navigation.contact', route: '/contact', icon: AppIcon.Mail, displayHint: [NavDisplayHintEnum.Desktop, NavDisplayHintEnum.MobileModal] },
];

const footerLinks = {
  supportLinks: [
    { id: 'footer-contact', labelKey: 'cv.navigation.contact', route: '/contact' },
    // DE FIX: 'external: true' toegevoegd voor de downloadlink
    { id: 'footer-download', labelKey: 'cv.footer.download', route: '/assets/CV-Roy-van-de-Wetering.pdf', external: true },
  ],
  shopLinks: [
    { id: 'footer-projects', labelKey: 'cv.navigation.projects', route: '/projects' },
    { id: 'footer-experience', labelKey: 'cv.navigation.experience', route: '/werkervaring' },
    { id: 'footer-skills', labelKey: 'cv.navigation.skills', route: '/skills' },
  ],
  companyLinks: [
    { id: 'footer-architecture', labelKey: 'cv.navigation.architecture', route: '/architectuur' },
    { id: 'footer-ai', labelKey: 'cv.navigation.aiWorkflow', route: '/ai-workflow' },
    { id: 'footer-about', labelKey: 'cv.navigation.aboutMe', route: '/over-mij' },
  ],
};

export const CV_APP_NAVIGATION: AppNavigationConfig = {
  primary: primaryNav,
  topBar: [],
  mobileModal: primaryNav,
  footer: footerLinks
};