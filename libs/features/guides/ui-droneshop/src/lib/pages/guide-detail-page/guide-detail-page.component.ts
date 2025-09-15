import {
  ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal,
  AfterViewInit, viewChildren, ElementRef, computed, effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GuidesFacade } from '@royal-code/features/guides/core';
import { ProductFacade } from '@royal-code/features/products/core';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { GuideNavigationComponent } from '../../components/guide-navigation/guide-navigation.component';
import { GuideStepComponent } from '../../components/guide-step/guide-step.component';
import { GuideMobileNavComponent } from '../../components/guide-mobile-nav/guide-mobile-nav.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { UiButtonComponent } from '@royal-code/ui/button';

@Component({
  selector: 'droneshop-guide-detail-page',
  standalone: true,
  imports: [
    CommonModule, UiSpinnerComponent, UiTitleComponent, UiParagraphComponent,
    GuideNavigationComponent, GuideStepComponent, GuideMobileNavComponent,
    UiButtonComponent
  ],
  template: `
    <div 
      class="p-4 sm:p-6 lg:p-8"
      royalCodeSwipeable
      (swipeleft)="isMobileView() && navigateToNextStep()"
      (swiperight)="isMobileView() && navigateToPreviousStep()">
      
      @if (facade.isLoading() && !facade.currentGuide()) {
        <div class="flex items-center justify-center h-96">
          <royal-code-ui-spinner size="xl" />
        </div>
      } @else if (facade.currentGuide(); as guide) {
        <header class="mb-8">
          <royal-code-ui-title
            [level]="TitleTypeEnum.H1"
            [text]="guide.title"
            [blockStyle]="true"
            [blockStyleType]="'primary'"
          />
          <royal-code-ui-paragraph color="muted" extraClasses="mt-4">{{ guide.description }}</royal-code-ui-paragraph>
        </header>

        <div class="flex flex-col lg:flex-row gap-8">
          <div class="w-full lg:w-[65%]">
            @for (step of guide.steps; track step.id) {
              <droneshop-guide-step
                [step]="step"
                [isCompleted]="completedStatus()[step.id] ?? false"
                [productMap]="productFacade.productEntities()"
                (completedToggle)="onStepCompleted($event)"
              />
            }
          </div>
          <aside class="w-full lg:w-[35%] lg:sticky top-24 self-start hidden lg:block">
            <droneshop-guide-navigation
              [steps]="guide.steps"
              [activeStepId]="activeStepId()"
              [completedStepIds]="completedStatus()"
              (stepSelected)="scrollToStep($event, 'smooth')"
            />
          </aside>
        </div>

        @if (isGuideCompleted()) {
          <section class="mt-12 p-8 bg-surface-alt border-2 border-primary rounded-lg text-center animate-fade-in">
            <royal-code-ui-title 
              [level]="TitleTypeEnum.H2"
              text="Gefeliciteerd, gids voltooid!"
              [blockStyle]="true"
              [blockStyleType]="'primary'"
              extraClasses="mb-4" />
            <royal-code-ui-paragraph color="muted" extraClasses="max-w-xl mx-auto mb-6">
              Je hebt alle stappen succesvol doorlopen. Je bent nu klaar voor de volgende fase van je FPV-avontuur!
            </royal-code-ui-paragraph>
            <div class="flex justify-center gap-4">
              <royal-code-ui-button type="default" sizeVariant="lg">Schrijf een review</royal-code-ui-button>
              <royal-code-ui-button type="primary" sizeVariant="lg" (clicked)="navigateToGuides()">Bekijk andere gidsen</royal-code-ui-button>
            </div>
          </section>
        }

        @if (isMobileView()) {
          <droneshop-guide-mobile-nav
            [currentStepNumber]="currentStepNumber()"
            [totalSteps]="guide.steps.length"
            [isFirstStep]="currentStepNumber() === 1"
            [isLastStep]="currentStepNumber() === guide.steps.length"
            (previousClicked)="navigateToPreviousStep()"
            (nextClicked)="navigateToNextStep()"
          />
        }

      } @else if (facade.error(); as error) {
        <div class="text-center p-12 bg-surface-alt rounded-lg">
           <royal-code-ui-title
             [level]="TitleTypeEnum.H3"
             text="Gids niet gevonden"
             [blockStyle]="true"
             [blockStyleType]="'secondary'"
           />
           <royal-code-ui-paragraph color="error" extraClasses="mt-4">{{ error.message }}</royal-code-ui-paragraph>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuideDetailPageComponent implements OnInit, OnDestroy, AfterViewInit {
  protected readonly facade = inject(GuidesFacade);
  protected readonly productFacade = inject(ProductFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);

  private readonly productDataLoaded = signal(false);
  protected readonly activeStepId = signal<string>('');
  protected readonly completedStatus = this.facade.currentGuideCompletionStatus;
  protected readonly isMobileView = toSignal(
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]).pipe(map(result => result.matches)),
    { initialValue: false }
  );
  
  private stepElements = viewChildren(GuideStepComponent, { read: ElementRef });
  private observer: IntersectionObserver | null = null;
  protected readonly TitleTypeEnum = TitleTypeEnum;
  
  protected readonly currentStepNumber = computed(() => {
    const guide = this.facade.currentGuide();
    const activeId = this.activeStepId();
    if (!guide || !activeId) return 1;
    const index = guide.steps.findIndex(s => s.id === activeId);
    return index + 1;
  });

  protected readonly isGuideCompleted = computed(() => {
    const p = this.facade.progress();
    return p && p.totalCount > 0 && p.completedCount === p.totalCount;
  });

  constructor() {
    effect(() => {
      const guide = this.facade.currentGuide();
      if (guide && !this.productDataLoaded()) {
        this.productFacade.loadFeaturedProducts();
        this.productDataLoaded.set(true);
        if (guide.steps.length > 0 && !this.activeStepId()) {
          this.activeStepId.set(guide.steps[0].id);
        }
      }
    });
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) { this.facade.loadGuide(slug); }
  }

  ngAfterViewInit(): void { this.setupIntersectionObserver(); }
  ngOnDestroy(): void {
    this.facade.clearCurrentGuide();
    this.observer?.disconnect();
  }

  private setupIntersectionObserver(): void {
    if (this.stepElements().length === 0) {
      setTimeout(() => this.setupIntersectionObserver(), 100);
      return;
    }
    const options = { root: null, rootMargin: '-40% 0px -60% 0px', threshold: 0 };
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.activeStepId.set(entry.target.id.replace('step-', ''));
        }
      });
    }, options);
    this.stepElements().forEach(el => this.observer?.observe(el.nativeElement));
  }

  onStepCompleted({ stepId, event }: { stepId: string; event: MouseEvent }): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.facade.toggleStepCompletion(stepId);
    
    if (!this.completedStatus()[stepId]) {
      setTimeout(() => this.navigateToNextStep(), 50);
    }
  }
  
  scrollToStep(stepId: string, behavior: ScrollBehavior = 'smooth'): void {
    const element = document.getElementById('step-' + stepId);
    if (element) {
      element.scrollIntoView({ behavior, block: 'start' });
    }
  }

  navigateToPreviousStep(): void {
    const guide = this.facade.currentGuide();
    if (!guide) return;
    const currentIndex = guide.steps.findIndex(s => s.id === this.activeStepId());
    if (currentIndex > 0) {
      this.scrollToStep(guide.steps[currentIndex - 1].id, 'auto');
    }
  }

  navigateToNextStep(): void {
    const guide = this.facade.currentGuide();
    if (!guide) return;
    const currentIndex = guide.steps.findIndex(s => s.id === this.activeStepId());
    if (currentIndex < guide.steps.length - 1) {
      this.scrollToStep(guide.steps[currentIndex + 1].id, 'auto');
    }
  }

  navigateToGuides(): void {
    this.router.navigate(['/guides']);
  }
}