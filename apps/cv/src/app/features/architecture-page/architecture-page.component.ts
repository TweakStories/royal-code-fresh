/**
 * @file architecture-page.component.ts (CV App)
 * @version 10.3.0 (Fix: openCalendlyModal & Full Internationalization)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-07
 * @Description
 *   De definitieve architectuurpagina, geherpositioneerd als een strategische business case.
 *   Deze versie is volledig geïnternationaliseerd en lost de compilatiebug van
 *   'openCalendlyModal' op.
 */
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { FolderTreeComponent, TreeNode } from '@royal-code/ui/folder-tree';
import { UiCardComponent } from '@royal-code/ui/cards/card';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiBadgeComponent } from '@royal-code/ui/badge';
import { DynamicOverlayService } from '@royal-code/ui/overlay'; // Importeer DynamicOverlayService
import { environment } from '../../../../environments/environment'; // Importeer environment
import { AuroraBackgroundComponent } from '@royal-code/ui/backgrounds';
// import { CalendlyOverlayComponent } from '...'; // Veronderstelde import voor de overlay

@Component({
  selector: 'app-cv-architecture-page',
  standalone: true,
  imports: [
    CommonModule, TranslateModule, UiTitleComponent, UiParagraphComponent, UiIconComponent,
    FolderTreeComponent, UiCardComponent, UiButtonComponent, AuroraBackgroundComponent,
    UiBadgeComponent
  ],
  template: `
    <section class="architecture-page container-max py-16 md:py-24 space-y-20">

      <!-- Sectie 1: De Filosofie & Het Probleem -->
      <header class="text-center">
        <royal-code-ui-title 
          [level]="TitleTypeEnum.H2" 
          [text]="'cv.architecture.philosophy.title' | translate" 
          extraClasses="!text-3xl sm:!text-5xl !font-black mb-4" 
        />
        <royal-code-ui-paragraph 
          [text]="'cv.architecture.philosophy.hook' | translate" 
          size="lg" 
          color="muted" 
          extraClasses="max-w-4xl mx-auto italic" 
        />
        <royal-code-ui-paragraph 
          [text]="'cv.architecture.philosophy.solution' | translate" 
          size="md" 
          color="primary" 
          extraClasses="max-w-3xl mx-auto mt-6 !font-bold"
        />
      </header>

      <!-- Sectie 2: De Blauwdruk van de Fabriek -->
      <article>
         <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.architecture.blueprintTitle' | translate" [center]="true" extraClasses="!mb-12" />
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16">
          <!-- Pilaar 1: Frontend Assemblagelijn -->
          <div class="space-y-4">
            <h4 class="text-xl font-bold flex items-center gap-3"><royal-code-ui-icon [icon]="AppIcon.Layers" colorClass="text-primary" />{{ 'cv.architecture.pillar1.title' | translate }}</h4>
            <royal-code-ui-paragraph [text]="'cv.architecture.pillar1.description' | translate" color="muted" />
            <div class="bg-card p-4 rounded-md border border-border mt-4">
              <royal-ui-folder-tree [data]="frontendTree" />
            </div>
          </div>
          <!-- Pilaar 2: Backend Kwaliteitsvesting -->
          <div class="space-y-4">
             <h4 class="text-xl font-bold flex items-center gap-3"><royal-code-ui-icon [icon]="AppIcon.Castle" colorClass="text-primary" />{{ 'cv.architecture.pillar2.title' | translate }}</h4>
            <royal-code-ui-paragraph [text]="'cv.architecture.pillar2.description' | translate" color="muted" />
            <div class="bg-card p-4 rounded-md border border-border mt-4">
              <royal-ui-folder-tree [data]="backendTree" />
            </div>
          </div>
        </div>
      </article>

      <!-- Sectie 3: De Trade-Offs (Bewijs van Senioriteit) -->
      <article>
        <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.architecture.tradeOffs.title' | translate" [center]="true" extraClasses="!mb-12" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div class="bg-card border-2 border-success/20 p-6 rounded-xs">
            <h4 class="font-bold mb-4 text-success">{{ 'cv.architecture.tradeOffs.wins.title' | translate }}</h4>
            <ul class="space-y-2 text-sm text-foreground">
              @for(itemKey of tradeOffsWinsKeys; track itemKey) {
                <li class="flex items-start gap-2"><royal-code-ui-icon [icon]="AppIcon.CheckCircle" colorClass="text-success mt-0.5" /><span>{{ itemKey | translate }}</span></li>
              }
            </ul>
          </div>
           <div class="bg-card border-2 border-border/50 p-6 rounded-xs">
            <h4 class="font-bold mb-4 text-secondary">{{ 'cv.architecture.tradeOffs.investments.title' | translate }}</h4>
            <ul class="space-y-2 text-sm text-secondary">
               @for(itemKey of tradeOffsInvestmentsKeys; track itemKey) {
                <li class="flex items-start gap-2"><royal-code-ui-icon [icon]="AppIcon.Clock" colorClass="text-warning mt-0.5" /><span>{{ itemKey | translate }}</span></li>
              }
            </ul>
          </div>
        </div>
      </article>

      <!-- Sectie 4: De Connectie met AI -->
      <article class="relative overflow-hidden p-8 text-center">
        <royal-aurora-background position="center" animation="default" blobSize="md" extraClasses="opacity-20" />
        
        <div class="relative z-10"> 
          <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.architecture.aiConnection.title' | translate" extraClasses="!mb-4" />
          <royal-code-ui-paragraph [text]="'cv.architecture.aiConnection.description' | translate" color="primary" [centered]="true" extraClasses="max-w-3xl mx-auto !font-bold" />
        </div>
      </article>

      
      <!-- Sectie 5: De Business Impact -->
      <article>
        <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.architecture.businessImpact.title' | translate" [center]="true" extraClasses="!mb-12" />
        <!-- Cost of Chaos & Case Study -->
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto mb-12">
            <div class="lg:col-span-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="border-2 border-border/50 p-6 rounded-xs">
                    <h4 class="font-bold mb-4 text-secondary">{{ 'cv.architecture.businessImpact.chaosTitle' | translate }}</h4>
                    <ul class="space-y-2 text-sm text-secondary">
                      <li class="flex items-start gap-2"><royal-code-ui-icon [icon]="AppIcon.Hourglass" /><span>{{ 'cv.architecture.businessImpact.chaosPoints.bugFix' | translate }}</span></li>
                      <li class="flex items-start gap-2"><royal-code-ui-icon [icon]="AppIcon.UserCircle" /><span>{{ 'cv.architecture.businessImpact.chaosPoints.onboarding' | translate }}</span></li>
                      <li class="flex items-start gap-2"><royal-code-ui-icon [icon]="AppIcon.Flame" /><span>{{ 'cv.architecture.businessImpact.chaosPoints.debt' | translate }}</span></li>
                    </ul>
                  </div>
                  <div class="border-2 border-primary/50 p-6 rounded-xs">
                    <h4 class="text-primary font-bold mb-4">{{ 'cv.architecture.businessImpact.structureTitle' | translate }}</h4>
                    <ul class="space-y-2 text-sm text-foreground">
                      <li class="flex items-start gap-2"><royal-code-ui-icon [icon]="AppIcon.Clock" /><span>{{ 'cv.architecture.businessImpact.structurePoints.bugFix' | translate }}</span></li>
                      <li class="flex items-start gap-2"><royal-code-ui-icon [icon]="AppIcon.UserCheck" /><span>{{ 'cv.architecture.businessImpact.structurePoints.onboarding' | translate }}</span></li>
                      <li class="flex items-start gap-2"><royal-code-ui-icon [icon]="AppIcon.Recycle" /><span>{{ 'cv.architecture.businessImpact.structurePoints.debt' | translate }}</span></li>
                    </ul>
                  </div>
                </div>
            </div>
            <div class="lg:col-span-2 bg-card p-6 rounded-xs border border-border">
                <h4 class="font-semibold text-center mb-3">{{ 'cv.architecture.businessImpact.miniCaseStudy.title' | translate }}</h4>
                <p class="text-xs text-secondary text-center">"{{ 'cv.architecture.businessImpact.miniCaseStudy.quote' | translate }}"</p>
                <p class="text-xs text-foreground font-bold text-center mt-2">{{ 'cv.architecture.businessImpact.miniCaseStudy.author' | translate }}</p>
            </div>
        </div>

        <!-- Impactpunten -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          @for (impact of businessImpactPoints; track impact.titleKey) {
            <royal-code-ui-card extraContentClasses="flex flex-col">
              <royal-code-ui-icon [icon]="impact.icon" sizeVariant="xl" colorClass="text-primary mb-4" />
              <h4 class="text-lg font-semibold mb-2">{{ impact.titleKey | translate }}</h4>
              <p class="text-sm text-secondary flex-grow">{{ impact.descriptionKey | translate }}</p>
            </royal-code-ui-card>
          }
        </div>
      </article>

       <!-- Sectie 6: Wat dit betekent voor u -->
      <article class="text-center">
          <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.architecture.hiringManager.title' | translate" [center]="true" extraClasses="!mb-8" />
          <div class="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              @for(itemKey of hiringManagerPoints; track itemKey) {
                  <royal-code-ui-badge color="primary" size="lg" [bordered]="false">{{itemKey | translate}}</royal-code-ui-badge>
              }
          </div>
      </article>
      <!-- CTA -->
      <article class="text-center bg-card border border-border rounded-xs p-8">
        <royal-code-ui-title [level]="TitleTypeEnum.H3" [text]="'cv.architecture.closing.statement' | translate" extraClasses="!mb-6 italic" />
        <royal-code-ui-paragraph [text]="'cv.architecture.closing.savingsHint' | translate" color="muted" [centered]="true" extraClasses="max-w-3xl mx-auto mb-8" />
        <royal-code-ui-button type="primary" sizeVariant="lg" (clicked)="openCalendlyModal()">
          <royal-code-ui-icon [icon]="AppIcon.CalendarClock" sizeVariant="sm" extraClass="mr-2" />
          {{ 'cv.architecture.closing.cta' | translate }}
        </royal-code-ui-button>
        <div class="mt-4">
           <royal-code-ui-badge color="success" [bordered]="false" data-analytics="risk_reversal_badge_view">
             <royal-code-ui-icon [icon]="AppIcon.ShieldCheck" sizeVariant="xs" extraClass="mr-1.5" />
             {{ 'cv.architecture.closing.guarantee' | translate }}
           </royal-code-ui-badge>
        </div>
      </article>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchitecturePageComponent implements OnInit {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly translateService = inject(TranslateService);
  private readonly overlayService = inject(DynamicOverlayService); // Injecteer DynamicOverlayService

  readonly TitleTypeEnum = TitleTypeEnum;
  readonly AppIcon = AppIcon;

  // Datastructuren nu met vertaalsleutels
  readonly tradeOffsWinsKeys = [
    'cv.architecture.tradeOffs.wins.item1',
    'cv.architecture.tradeOffs.wins.item2',
    'cv.architecture.tradeOffs.wins.item3',
    'cv.architecture.tradeOffs.wins.item4',
  ];
  readonly tradeOffsInvestmentsKeys = [
    'cv.architecture.tradeOffs.investments.item1',
    'cv.architecture.tradeOffs.investments.item2',
    'cv.architecture.tradeOffs.investments.item3',
  ];
  readonly businessImpactPoints = [
    { titleKey: "cv.architecture.businessImpact.points.item1.title", descriptionKey: "cv.architecture.businessImpact.points.item1.description", icon: AppIcon.Zap },
    { titleKey: "cv.architecture.businessImpact.points.item2.title", descriptionKey: "cv.architecture.businessImpact.points.item2.description", icon: AppIcon.Users },
    { titleKey: "cv.architecture.businessImpact.points.item3.title", descriptionKey: "cv.architecture.businessImpact.points.item3.description", icon: AppIcon.BadgeCheck },
    { titleKey: "cv.architecture.businessImpact.points.item4.title", descriptionKey: "cv.architecture.businessImpact.points.item4.description", icon: AppIcon.Wrench }
  ];
  readonly hiringManagerPoints = [
      'cv.architecture.hiringManager.points.item1',
      'cv.architecture.hiringManager.points.item2',
      'cv.architecture.hiringManager.points.item3',
  ];

readonly frontendTree: TreeNode[] = [
    { name: 'apps/', icon: AppIcon.FolderOpen, description: 'De consumenten: elke map is een deploybare applicatie.', children: [
      { name: 'cv/', icon: AppIcon.UserCircle, description: 'Deze CV/Portfolio website.' },
      { name: 'plushie-paradise/', icon: AppIcon.Store, description: 'De e-commerce storefront.' },
      { name: 'admin-panel/', icon: AppIcon.LayoutDashboard, description: 'Het beheerpaneel.' },
      { name: 'challenger/', icon: AppIcon.Gamepad2, description: 'De gamified persoonlijke groei app.' }, // Challenger hier toegevoegd op app-niveau
    ]},
    { name: 'libs/', icon: AppIcon.FolderOpen, description: 'De herbruikbare logica: de kern van de fabriek.', children: [
      { name: 'features/', icon: AppIcon.Folder, description: 'Verticale slices van business-functionaliteit.', children: [
        { name: 'products/', icon: AppIcon.Package, description: 'Voorbeeld: de "products" feature.', children: [
          { name: 'domain', icon: AppIcon.Gem, colorClass: 'text-purple-500', description: 'De Waarheid: TypeScript interfaces & enums.' },
          { name: 'core', icon: AppIcon.BrainCircuit, colorClass: 'text-amber-500', description: 'NgRx State, Facade & Actions. App-onafhankelijk.' },
          
          { name: 'data-access-plushie', icon: AppIcon.Cloud, colorClass: 'text-sky-500', description: 'Connector voor de Plushie-winkel API.' },
          { name: 'ui-plushie', icon: AppIcon.LayoutDashboard, colorClass: 'text-green-500', description: 'Smart components specifiek voor de Plushie-winkel.' },
          
          { name: 'data-access-admin', icon: AppIcon.Cloud, colorClass: 'text-sky-700', description: 'Connector voor de Admin Panel API.' },
          { name: 'ui-admin', icon: AppIcon.LayoutDashboard, colorClass: 'text-green-700', description: 'Smart components specifiek voor het Admin Panel.' },
          { name: 'ui-drone', icon: AppIcon.LayoutDashboard, colorClass: 'text-green-500', description: 'Gebruikersinterface voor de drone-app' },
        ]}
        // { name: 'cart/', icon: AppIcon.ShoppingCart, children: [ /* ... lagen ... */ ] },
        // { name: 'social/', icon: AppIcon.Users, children: [ /* ... lagen ... */ ] },
      ]},
      { name: 'ui/', icon: AppIcon.PackageOpen, description: 'De Algemene Lego-set: "Domme", herbruikbare UI componenten.', children: [
        { name: 'button/', icon: AppIcon.MousePointer },
        { name: 'card/', icon: AppIcon.Square },
        { name: 'input/', icon: AppIcon.PenTool },
      ]},
      { name: 'core/', icon: AppIcon.Settings, description: 'De Nutsvoorzieningen: Logging, Error Handling, Interceptors.' },
      { name: 'store/', icon: AppIcon.Recycle, description: 'Globale NgRx state: auth, user, theme.', children: [
        { name: 'auth/', icon: AppIcon.Lock },
        { name: 'user/', icon: AppIcon.User },
      ]},
      { name: 'shared/', icon: AppIcon.Folder, description: 'Gedeelde, niet-specifieke code.', children: [
        { name: 'domain/', icon: AppIcon.Gem, colorClass: 'text-purple-500', description: 'Globale, feature-overstijgende modellen.'},
        { name: 'utils/', icon: AppIcon.Wrench, description: 'Herbruikbare pipes, directives en helper-functies.'},
      ]},
    ]}
  ];

  readonly backendTree: TreeNode[] = [
    { name: 'src/', icon: AppIcon.FolderOpen, children: [
      { name: 'Domain', icon: AppIcon.Gem, colorClass: 'text-purple-500', description: 'cv.architecture.folderTree.backend.domain.description' },
      { name: 'Application', icon: AppIcon.Layers, colorClass: 'text-amber-500', description: 'cv.architecture.folderTree.backend.application.description' },
      { name: 'Infrastructure', icon: AppIcon.Database, colorClass: 'text-sky-500', description: 'cv.architecture.folderTree.backend.infrastructure.description' },
      { name: 'Web (API)', icon: AppIcon.Server, colorClass: 'text-green-500', description: 'cv.architecture.folderTree.backend.webApi.description' },
    ]}
  ];

  ngOnInit(): void {
    this.translateService.get([
      'cv.navigation.architecture', // Voor de titel
      'cv.architecture.meta.description',
      'cv.architecture.meta.ogTitle',
      'cv.architecture.meta.ogImageAlt'
    ]).subscribe(translations => {
      this.titleService.setTitle(`${translations['cv.navigation.architecture']} | Roy van de Wetering`);
      this.metaService.addTags([
        { name: 'description', content: translations['cv.architecture.meta.description'] },
        { property: 'og:title', content: translations['cv.architecture.meta.ogTitle'] },
        { property: 'og:image', content: '/assets/og/architecture-hero.png' },
        { name: 'robots', content: 'index,follow' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: '/assets/og/architecture-hero.png' },
        { name: 'twitter:image:alt', content: translations['cv.architecture.meta.ogImageAlt'] }
      ]);
    });
  }

  // NIEUWE METHODE TOEGEVOEGD
  openCalendlyModal(): void {
    // Analytics tracking (alleen in dev mode, anders echte service)
    if (!environment.production) {
      console.debug(`[ANALYTICS] Event: architecture_cta_click`, { source: 'architecture_page' });
      alert("Simulatie: Calendly opent nu in een frictieloze overlay vanuit Architecture page.");
    }
    // else { this.overlayService.open(CalendlyOverlayComponent, { data: { utm: 'architecture-page-cta' } }); }
  }
}