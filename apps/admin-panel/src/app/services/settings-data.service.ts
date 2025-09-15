/**
 * @file settings-data.service.ts
 * @Version 7.0.1 (Fixed Duplicate 'doaPolicyUrl' in OrderSettings)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-02
 * @Description Provides complete dummy data for all admin settings categories, now with 'doaPolicyUrl' fix.
 */
import { Injectable } from '@angular/core';
import { of } from 'rxjs';

export interface GeneralSettings {
  shopName: string;
  contactEmail: string;
  customerServicePhone: string;
  companyAddress: string;
  logoUrl?: string;
  faviconUrl?: string;
  defaultLanguage: string;
  defaultCurrency: string;
  maintenanceMode: {
    enabled: boolean;
    message: string;
    allowedIpAddresses: string;
  };
  legalUrls: {
    termsOfService: string;
    privacyPolicy: string;
    returnPolicy: string;
  };
}

export interface ProductSettings {
  defaultStatus: 'draft' | 'published';
  manageStockGlobally: boolean;
  lowStockThreshold: number;
  allowBackorders: boolean;
  reviewsEnabled: boolean;
  autoApproveReviews: boolean;
  flaggedReviewsThreshold: number;
  droneDefaultEasaClassification: string;
  droneFirmwareTrackingEnabled: boolean;
  droneCompatibilityMatrixEnabled: boolean;
}

export interface OrderSettings {
  orderNumberPrefix: string;
  startOrderNumber: number;
  allowGuestCheckout: boolean;
  unpaidOrderTimeoutMinutes: number;
  rmaWorkflowEnabled: boolean;
  warrantyTermsUrl: string;
  doaPolicyUrl: string; // << DE FIX: Duplicaat verwijderd, nu slechts één keer gedeclareerd
  batteryShippingRestrictionsEnabled: boolean;
  bulkyItemHandlingEnabled: boolean;
  highValueInsuranceRequired: boolean;
  dropShippingEnabled: boolean;
  shippingProviders: { id: string; name: string; apiKey: string; }[];
  paymentProviders: { id: string; name: string; apiKey: string; }[];
}

export interface SecuritySettings {
  allowPublicRegistration: boolean;
  requireEmailVerification: boolean;
  defaultUserRole: string;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
  };
  adminIpAllowlist: string;
  adminSessionTimeoutMinutes: number;
}

export interface ComplianceSettings {
  easaClassificationManagementEnabled: boolean;
  requireOperatorIdVisibility: boolean;
  geoAwarenessInfoEnabled: boolean;
  droneRegistrationRequired: boolean;
  ageVerificationEnabled: boolean;
  ageVerificationThreshold: number;
  exportRestrictionsEnabled: boolean;
  itarDualUseFlagsEnabled: boolean;
  ceMarkingVerificationEnabled: boolean;
}

export interface MarketingSettings {
  googleAnalyticsId: string;
  googleTagManagerId: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  globalMetaKeywords: string;
  sitemapAutoGenerate: boolean;
  socialMediaLinks: { platform: string; url: string; }[];
}

export interface SystemSettings {
  globalLogLevel: 'Debug' | 'Info' | 'Warning' | 'Error' | 'Critical';
  sentryDsn: string;
  frontendCacheClearButtonEnabled: boolean;
  backendCacheClearButtonEnabled: boolean;
  defaultCacheDurationMinutes: number;
  apiHealthCheckEnabled: boolean;
  cronJobMonitoringEnabled: boolean;
}

export interface AdminPanelSettings {
  defaultTheme: 'light' | 'dark';
  customBrandingEnabled: boolean;
  newOrderNotifications: { email: boolean; inApp: boolean; };
  lowStockNotifications: { email: boolean; inApp: boolean; };
  newReviewNotifications: { email: boolean; inApp: boolean; };
}

export interface GovernanceSettings {
  rbacEnabled: boolean;
  auditLoggingEnabled: boolean;
  highRiskApprovalWorkflowEnabled: boolean;
  adminIpRateLimitingEnabled: boolean;
}

export interface DeploymentSettings {
  featureFlagsEnabled: boolean;
  configVersioningEnabled: boolean;
  stagingToProdMigrationWizardEnabled: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class SettingsDataService {

  getGeneralSettings() {
    return of<GeneralSettings>({
      shopName: 'Royal-Code Drone Shop',
      contactEmail: 'support@royal-code.drones',
      customerServicePhone: '+31 6 12345678',
      companyAddress: 'Dronehaven 1, 1234 AB, Amsterdam, Nederland',
      logoUrl: 'assets/images/logo-placeholder.png',
      faviconUrl: 'assets/images/favicon-placeholder.png',
      defaultLanguage: 'nl',
      defaultCurrency: 'EUR',
      maintenanceMode: {
        enabled: false,
        message: 'We voeren momenteel onderhoud uit. Probeer het later opnieuw.',
        allowedIpAddresses: '127.0.0.1, 192.168.1.1'
      },
      legalUrls: {
        termsOfService: '/legal/terms-of-service',
        privacyPolicy: '/legal/privacy-policy',
        returnPolicy: '/legal/return-policy'
      }
    });
  }

  getProductSettings() {
    return of<ProductSettings>({
      defaultStatus: 'draft',
      manageStockGlobally: true,
      lowStockThreshold: 10,
      allowBackorders: false,
      reviewsEnabled: true,
      autoApproveReviews: false,
      flaggedReviewsThreshold: 5,
      droneDefaultEasaClassification: 'C0',
      droneFirmwareTrackingEnabled: true,
      droneCompatibilityMatrixEnabled: true,
    });
  }
  
  getOrderSettings() {
    return of<OrderSettings>({
      orderNumberPrefix: 'RC-DRONE-',
      startOrderNumber: 2025001,
      allowGuestCheckout: true,
      unpaidOrderTimeoutMinutes: 60,
      rmaWorkflowEnabled: true,
      warrantyTermsUrl: '/legal/warranty-terms',
      doaPolicyUrl: '/legal/doa-policy',
      shippingProviders: [
        { id: 'postnl', name: 'PostNL', apiKey: 'postnl-api-key-123' },
        { id: 'dhl', name: 'DHL Express', apiKey: 'dhl-api-key-456' },
      ],
      paymentProviders: [
        { id: 'mollie', name: 'Mollie', apiKey: 'mollie-api-key-abc' },
        { id: 'stripe', name: 'Stripe', apiKey: 'stripe-api-key-xyz' },
      ],
      batteryShippingRestrictionsEnabled: true,
      bulkyItemHandlingEnabled: true,
      highValueInsuranceRequired: true,
      dropShippingEnabled: false,
    });
  }

  getSecuritySettings() {
    return of<SecuritySettings>({
      allowPublicRegistration: true,
      requireEmailVerification: false,
      defaultUserRole: 'Customer',
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true,
      },
      adminIpAllowlist: '127.0.0.1, 192.168.1.1',
      adminSessionTimeoutMinutes: 30,
    });
  }

  getComplianceSettings() {
    return of<ComplianceSettings>({
      easaClassificationManagementEnabled: true,
      requireOperatorIdVisibility: true,
      geoAwarenessInfoEnabled: true,
      droneRegistrationRequired: true,
      ageVerificationEnabled: true,
      ageVerificationThreshold: 16,
      exportRestrictionsEnabled: false,
      itarDualUseFlagsEnabled: false,
      ceMarkingVerificationEnabled: true,
    });
  }

  getMarketingSettings() {
    return of<MarketingSettings>({
      googleAnalyticsId: 'UA-XXXXX-Y',
      googleTagManagerId: 'GTM-XXXXXX',
      defaultMetaTitle: 'Royal-Code Drone Shop: Jouw bestemming voor drones',
      defaultMetaDescription: 'Ontdek de nieuwste drones, accessoires en services bij Royal-Code Drone Shop.',
      globalMetaKeywords: 'drones, quadcopters, RC, FPV, accessoires, drone shop',
      sitemapAutoGenerate: true,
      socialMediaLinks: [
        { platform: 'Facebook', url: 'https://facebook.com/royal-code-drones' },
        { platform: 'Instagram', url: 'https://instagram.com/royal-code-drones' },
        { platform: 'YouTube', url: 'https://youtube.com/royal-code-drones' },
      ],
    });
  }

  getSystemSettings() {
    return of<SystemSettings>({
      globalLogLevel: 'Info',
      sentryDsn: 'https://examplepublickey@o0.ingest.sentry.io/0',
      frontendCacheClearButtonEnabled: true,
      backendCacheClearButtonEnabled: true,
      defaultCacheDurationMinutes: 60,
      apiHealthCheckEnabled: true,
      cronJobMonitoringEnabled: true,
    });
  }

  getAdminPanelSettings() {
    return of<AdminPanelSettings>({
      defaultTheme: 'dark',
      customBrandingEnabled: true,
      newOrderNotifications: { email: true, inApp: true },
      lowStockNotifications: { email: false, inApp: true },
      newReviewNotifications: { email: true, inApp: false },
    });
  }

  getGovernanceSettings() {
    return of<GovernanceSettings>({
      rbacEnabled: true,
      auditLoggingEnabled: true,
      highRiskApprovalWorkflowEnabled: true,
      adminIpRateLimitingEnabled: true,
    });
  }

  getDeploymentSettings() {
    return of<DeploymentSettings>({
      featureFlagsEnabled: true,
      configVersioningEnabled: true,
      stagingToProdMigrationWizardEnabled: false,
    });
  }
}