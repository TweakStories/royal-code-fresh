// libs/features/challenges/src/components/detail/challenge-detail.component.ts
/**
 * @fileoverview Displays the full details of a selected challenge, incorporating game elements,
 *               route/task info, requirements, rewards, safety, social aspects, and actions.
 * @Component ChallengeDetailComponent
 * @description Container component retrieving and displaying comprehensive challenge details.
 * @version 3.2.2 - Corrected UiImageComponent binding from [src] to [variants]. Removed invalid 'w' attribute.
 */
import {
  Component, ChangeDetectionStrategy, inject, signal, computed, effect, OnInit, OnDestroy,
  Signal, Injector, ChangeDetectorRef, DestroyRef // Added DestroyRef
} from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'; // Correct import
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { take, catchError, finalize } from 'rxjs/operators';

// --- UI Imports ---
import { UiButtonComponent } from '@royal-code/ui/button'; // ButtonType is in UiButtonComponent zelf
import { UiGridComponent } from '@royal-code/ui/grid';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiMediaCollectionComponent, UiMediaMosaicGridComponent, UiImageComponent } from '@royal-code/ui/media';
import { UiRatingComponent } from '@royal-code/ui/rating';
import { UiFaqComponent } from '@royal-code/ui/faq';
import { UiStatCardComponent } from '@royal-code/ui/cards/stat-card';
import { ParticipantsComponent } from '../participants/participants.component';
import { ChallengeMapComponent } from '../map/challenge-map.component';
import { ReviewListComponent } from '@royal-code/features/reviews/ui-plushie';
import { ReviewsFacade } from '@royal-code/features/reviews/core';
import { UiReviewCardComponent } from '@royal-code/ui/review-card';
import { ReviewTargetEntityType, Review } from '@royal-code/features/reviews/domain';
// ... en verderop ...
import { FeedComponent } from '@royal-code/features/social/ui';

// --- Domain Imports ---
import {
  AppIcon, Challenge, EquipmentItem, NodeFull,
  DifficultyLevel, Hazard, Quest, PrivacyLevel,
  ChallengeStatus} from '@royal-code/shared/domain';

// --- State & Core Imports ---
import { ChallengesFacade } from '../../state/challenges.facade';
import { UserFacade } from '@royal-code/store/user';
import { INodesFacade } from '@royal-code/shared/domain'; // Interface for Node state interaction.
import { NodesFacade } from '@royal-code/features/nodes';
import { QuestFacade } from '@royal-code/features/quests';
import { MapperService } from '@royal-code/mappers';
import { LoggerService } from '@royal-code/core/core-logging';
import { NotificationService } from '@royal-code/ui/notifications';
import { ROUTES } from '@royal-code/core/routing';
import { UiSpinnerComponent } from '@royal-code/ui/spinner';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';

// Type for user participation status (example)
type ParticipationStatus = 'NotStarted' | 'InProgress' | 'Completed' | 'Paused' | 'Failed';

@Component({
  selector: 'royal-code-challenge-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, DatePipe, TranslateModule, TitleCasePipe, DecimalPipe,
    UiButtonComponent, UiGridComponent, UiIconComponent, UiMediaMosaicGridComponent,
    UiRatingComponent, UiFaqComponent, UiStatCardComponent,
    ParticipantsComponent, ChallengeMapComponent, FeedComponent, UiImageComponent,
    UiMediaCollectionComponent, UiSpinnerComponent, UiRatingComponent, UiFaqComponent, UiStatCardComponent,
    UiParagraphComponent, ReviewListComponent, UiReviewCardComponent,
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<!-- Outer Container -->
<div class="challenge-detail-container text-text">

  <!-- Back Button -->
  <button
    (click)="backToOverview()"
    (keydown.enter)="backToOverview()"
    (keydown.space)="$event.preventDefault(); backToOverview()"
    tabindex="0"
    role="button"
    aria-label="Back to overview"
    class="mb-4 inline-flex items-center text-sm text-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
    <royal-code-ui-icon [icon]="AppIcon.ArrowLeft" sizeVariant="sm" extraClass="mr-1"/>
    {{ 'common.buttons.backToOverview' | translate }}
  </button>

  <!-- Loading State -->
  @if (isLoading()) {
    <div class="flex flex-col items-center justify-center p-12 text-secondary gap-4">
      <royal-code-ui-spinner size="xl" />
      <royal-code-ui-paragraph>Productdetails worden geladen...</royal-code-ui-paragraph>
    </div>
  }
  <!-- Error State -->
  @else if (error()) {
    <div class="my-12 p-6 bg-destructive/10 text-destructive rounded-md border border-destructive/30 text-center">
       <h3 class="font-semibold text-lg mb-2">{{ 'common.errors.errorOccurred' | translate }}</h3>
       <p class="text-sm mb-4">{{ error() }}</p>
       <royal-code-ui-button type="primary" sizeVariant="sm" (clicked)="backToOverview()">
            {{ 'common.buttons.back' | translate }}
       </royal-code-ui-button>
    </div>
  }
  <!-- Main Content (Challenge Loaded) -->
  @else if (challenge()) { <!-- Gebruik challenge() direct, geen alias 'as' hier -->
    <article>
      <!-- Header Section -->
      <header class="mb-6">
        <!-- Cover Image/Video -->
        <div class="relative w-full aspect-video bg-muted rounded-xs overflow-hidden shadow-md mb-4">
          @if(challenge()!.mainImageUrl) {
            <royal-code-ui-image
                [image]="challenge()!.mainImageUrl"
                [alt]="challenge()!.title + ' cover image'"
                objectFit="cover" />
           } @else {
              <div class="absolute inset-0 flex items-center justify-center">
                  <royal-code-ui-icon [icon]="AppIcon.Trophy" sizeVariant="xl" colorClass="text-secondary opacity-30"></royal-code-ui-icon>
               </div>
           }
        </div>

        <!-- Title, Creator, Meta Info -->
        <h1 class="text-2xl md:text-4xl font-bold mb-1 break-words text-foreground">{{ challenge()!.title }}</h1>
        <div class="text-xs md:text-sm text-secondary mb-2">
          {{ 'challenges.details.createdBy' | translate }}:
          <a [routerLink]="['/profile', challenge()!.creator.id]" class="font-medium text-primary hover:underline">{{ challenge()!.creator.displayName }}</a>
          @if(challenge()!.createdAt) { <span class="text-xs text-secondary"> • {{ challenge()!.createdAt!.iso | date:'mediumDate' }}</span> }
        </div>
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-secondary mb-3">
           <span><royal-code-ui-icon [icon]="getDifficultyIcon(challenge()!.difficultyLevel)" sizeVariant="xs" extraClass="inline-block mr-1"/>{{ challenge()!.difficultyLevel.level | titlecase }}</span>
           <span><royal-code-ui-icon [icon]="getTypeIcon(challenge()!.type)" sizeVariant="xs" extraClass="inline-block mr-1"/>{{ challenge()!.type || 'Algemeen' }}</span>
           <span><royal-code-ui-icon [icon]="getPrivacyIcon(challenge()!.privacy)" sizeVariant="xs" extraClass="inline-block mr-1"/>{{ challenge()!.privacy | titlecase }}</span>
           <span><royal-code-ui-icon [icon]="getStatusIcon(challenge()!.status)" sizeVariant="xs" extraClass="inline-block mr-1"/>{{ challenge()!.status }}</span>
        </div>
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm">
            <a (click)="scrollToSection('reviews')" (keydown.enter)="scrollToSection('reviews')" (keydown.space)="$event.preventDefault(); scrollToSection('reviews')" tabindex="0" role="button" [attr.aria-label]="'Scroll to reviews section' | translate" class="flex items-center text-secondary hover:text-primary cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded">
               <royal-code-ui-rating [rating]="challenge()!.rating" [readonly]="true" /> <!-- Verwijder size="small", wordt in component zelf bepaald -->
               <span class="ml-1">({{ challenge()!.reviews?.length ?? 0 }} {{ 'common.units.reviews' | translate }})</span>
            </a>
            <a (click)="scrollToSection('participants')" (keydown.enter)="scrollToSection('participants')" (keydown.space)="$event.preventDefault(); scrollToSection('participants')" tabindex="0" role="button" [attr.aria-label]="'Scroll to participants section' | translate" class="flex items-center text-secondary hover:text-primary cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded">
               <royal-code-ui-icon [icon]="AppIcon.Users" sizeVariant="sm" extraClass="mr-1"/>
               <span>{{ challenge()!.participantsCount }} / {{ challenge()!.maxParticipants === 0 ? '∞' : challenge()!.maxParticipants }} {{ 'challenges.details.participants' | translate }}</span>
            </a>
        </div>
      </header>

      <!-- Actions & User Status Section -->
      <section class="mb-6 p-4 bg-card-secondary rounded-xs border border-border">
         <h3 class="text-sm font-semibold text-secondary mb-2 uppercase tracking-wider">{{ 'challenges.details.yourStatus' | translate }}</h3>
         <p class="text-base font-medium text-text mb-3">{{ userParticipationStatusDisplay() }}</p>

          @if (!userParticipating()) {
             @if (challenge()!.isGroupChallenge && !userIsInParty()) {
               <royal-code-ui-button type="primary" mb-3" (clicked)="joinOrFormParty()">
                   <royal-code-ui-icon [icon]="AppIcon.Users" sizeVariant="sm" extraClass="mr-1.5"/>
                   {{ 'challenges.actions.formParty' | translate }}
               </royal-code-ui-button>
             } @else {
                <royal-code-ui-button type="primary" mb-3" (clicked)="joinChallenge(challenge()!.id)" [disabled]="!requirementsMet()">
                    <royal-code-ui-icon [icon]="requirementsMet() ? AppIcon.Play : AppIcon.AlertCircle" sizeVariant="sm" extraClass="mr-1.5"/>
                    {{ (requirementsMet() ? 'challenges.actions.join' : 'challenges.actions.requirementsNotMet') | translate }}
                </royal-code-ui-button>
             }
          } @else if (userParticipationStatus() === 'InProgress') {
            <royal-code-ui-button type="primary" mb-3" (clicked)="startTracking(challenge()!.id)">
                 <royal-code-ui-icon [icon]="AppIcon.LocateFixed" sizeVariant="sm" extraClass="mr-1.5"/>
                 {{ 'challenges.actions.continueTracking' | translate }}
            </royal-code-ui-button>
             <div class="flex gap-2">
                <royal-code-ui-button type="outline" sizeVariant="sm" extraClasses="flex-1" (clicked)="pauseChallenge(challenge()!.id)">Pause</royal-code-ui-button>
                <royal-code-ui-button type="theme-fire" sizeVariant="sm" extraClasses="flex-1" (clicked)="stopChallenge(challenge()!.id)">Stop</royal-code-ui-button>
             </div>
          } @else if (userParticipationStatus() === 'Completed') {
             <royal-code-ui-button type="default" mb-3 bg-success/20 text-success border-success/30 hover:bg-success/30 cursor-default" [disabled]="true">
                 <royal-code-ui-icon [icon]="AppIcon.CheckCheck" sizeVariant="sm" extraClass="mr-1.5"/>
                 {{ 'common.status.completed' | translate }}!
             </royal-code-ui-button>
          }

         <div class="flex items-center justify-center space-x-3 mt-3">
            <royal-code-ui-button type="outline" sizeVariant="sm" (clicked)="toggleFavorite(challenge()!.id)">
                <royal-code-ui-icon [icon]="isFavorited() ? AppIcon.BookmarkCheck : AppIcon.Bookmark" sizeVariant="sm" [colorClass]="isFavorited() ? 'text-primary' : 'text-muted-foreground'" extraClass="mr-1"/>
                {{ (isFavorited() ? 'common.actions.saved' : 'common.actions.save') | translate }}
            </royal-code-ui-button>
            <royal-code-ui-button type="outline" sizeVariant="sm" (clicked)="shareChallenge(challenge()!)">
                 <royal-code-ui-icon [icon]="AppIcon.Share" sizeVariant="sm" extraClass="mr-1 text-muted-foreground"/>
                 {{ 'common.buttons.share' | translate }}
             </royal-code-ui-button>
             @if(startNode()) {
                <royal-code-ui-button type="outline" sizeVariant="sm" (clicked)="startExternalNavigation()">
                  <royal-code-ui-icon [icon]="AppIcon.Navigation" sizeVariant="sm" extraClass="mr-1 text-muted-foreground"/>
                   {{ 'nodes.actions.navigate' | translate }}
                </royal-code-ui-button>
             }
         </div>
      </section>

      <section id="description" class="mb-6">
          <h3 class="section-title">{{ 'common.titles.description' | translate }}</h3>
          <div class="prose prose-sm md:prose-base max-w-none text-text-secondary mt-2" [innerHTML]="challenge()!.description | translate"></div>
      </section>

       <section id="route-objectives" class="mb-6">
           <h3 class="section-title">{{ challenge()!.route ? ('common.titles.routeInfo' | translate) : ('common.titles.objectives' | translate) }}</h3>
            @if (challenge()!.route) {
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-4">
                  <royal-code-ui-stat-card [icon]="AppIcon.Route" label="Afstand" [value]="(challenge()!.route!.totalDistance | number:'1.0-1') + ' km'" />
                  <royal-code-ui-stat-card [icon]="AppIcon.Barcode" label="Hoogteverschil" [value]="(challenge()!.route!.elevationGain | number) + ' m'" />
                  <royal-code-ui-stat-card [icon]="AppIcon.Clock" label="Geschatte Duur" [value]="formatDuration(challenge()!.estimatedDuration)" />
              </div>
              @if (routePointsForMap().length > 0) {
                <div class="rounded-xs overflow-hidden border border-border shadow-sm mb-4">
                    <royal-code-challenge-map [route]="challenge()!.route!" mapHeight="350px"/> <!-- Non-null assertion for route -->
                </div>
              } @else {
                 <p class="text-sm text-secondary italic">Route details zijn nog niet beschikbaar.</p>
              }
            } @else if (challenge()!.objectives && challenge()!.objectives!.length > 0) {
                 <p class="text-sm text-secondary italic mt-2">Weergave van taken/doelen komt hier.</p>
            } @else {
                <p class="text-sm text-secondary italic mt-2">{{ 'challenges.details.noRouteOrObjectives' | translate }}</p>
            }
       </section>

        <section id="requirements" class="mb-6">
           <h3 class="section-title">{{ 'challenges.details.requirements' | translate }}</h3>
            @if (hasRequirements()) {
              <ul class="list-none space-y-1 mt-2 text-sm">
                @if(challenge()!.ageRestrictions.minAge && challenge()!.ageRestrictions!.minAge > 0) { <li class="flex items-center"><royal-code-ui-icon [icon]="AppIcon.UserCheck" sizeVariant="sm" extraClass="mr-1.5 text-secondary"/>Min. Leeftijd: {{ challenge()!.ageRestrictions!.minAge }}</li> }                 @if(challenge()!.isGroupChallenge) { <li class="flex items-center"><royal-code-ui-icon [icon]="AppIcon.Users" sizeVariant="sm" extraClass="mr-1.5 text-secondary"/>Groepsdeelname: Verplicht</li> }
              </ul>
            } @else {
                <p class="text-sm text-secondary italic mt-2">{{ 'challenges.details.noSpecificRequirements' | translate }}</p>
            }
        </section>

        <section id="rewards" class="mb-6">
           <h3 class="section-title">{{ 'common.titles.rewards' | translate }}</h3>
           @if(hasRewards()) {
              <ul class="list-none space-y-1 mt-2 text-sm">
                 @if(challenge()!.rewardXP) { <li class="flex items-center"><royal-code-ui-icon [icon]="AppIcon.Sparkles" sizeVariant="sm" extraClass="mr-1.5 text-amber-500"/>{{ challenge()!.rewardXP | number }} XP</li> }
                 @if(challenge()!.hasItemReward) { <li class="flex items-center"><royal-code-ui-icon [icon]="AppIcon.Gift" sizeVariant="sm" extraClass="mr-1.5 text-purple-500"/>Mogelijke Item(s)</li> }
              </ul>
           } @else {
                <p class="text-sm text-secondary italic mt-2">{{ 'challenges.details.noSpecificRewards' | translate }}</p>
           }
        </section>

       @if(challenge()!.equipment && challenge()!.equipment!.length > 0) {
            <section id="equipment" class="mb-6">
               <h3 class="section-title">{{ 'common.titles.equipment' | translate }}</h3>
                @for (equipmentGroup of challenge()!.equipment; track equipmentGroup.id) {
                  <h4 class="text-xs font-semibold text-secondary mt-3 mb-1 uppercase tracking-wider">{{ equipmentGroup.type | titlecase }}</h4>
                  <royal-code-ui-grid [data]="equipmentGroup.list" [minItemWidth]="100" [maxCols]="6" [gap]="1.5">
                     <ng-template #cell let-item>
                        <div class="flex flex-col items-center text-center p-2 border border-border rounded-md bg-card-secondary h-full text-xs">
                           <royal-code-ui-icon [icon]="getEquipmentIcon(item)" colorClass="text-primary" sizeVariant="sm" extraClass="mb-1"/>
                           <span class="font-medium flex-grow line-clamp-2">{{item.name}}</span>
                           @if(item.description){ <span class="text-[10px] text-secondary mt-0.5 line-clamp-1">{{item.description}}</span> }
                        </div>
                     </ng-template>
                  </royal-code-ui-grid>
                }
             </section>
          }

        <section id="safety" class="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xs">
           <h3 class="section-title text-orange-700 !mb-3">{{ 'common.titles.safety' | translate }}</h3>
           @if(challenge()!.safetyGuidelines) {
              <p class="text-sm text-orange-800 mb-3">{{ challenge()!.safetyGuidelines }}</p>
           }
           @if(challenge()!.hazards && challenge()!.hazards!.length > 0) {
             <div class="flex flex-wrap gap-2 mb-3">
               @for(hazard of challenge()!.hazards; track hazard.id) {
                 <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                   <royal-code-ui-icon [icon]="getHazardIcon(hazard)" sizeVariant="xs" extraClass="mr-1"/> {{ hazard.name }}
                 </span>
               }
             </div>
           }
           <p class="text-xs text-orange-600">{{ 'challenges.details.emergencyInfo' | translate }}</p>
        </section>

        <section id="quests" class="mb-6">
           <h3 class="section-title">{{ 'common.titles.relatedQuests' | translate }}</h3>
           @if (isLoadingQuests()) {
               <p class="text-sm text-secondary italic mt-2">{{ 'common.messages.loading' | translate }}...</p>
           } @else if (relevantQuests().length > 0) {
               <ul class="list-none space-y-2 mt-2">
                   @for (quest of relevantQuests(); track quest.id) {
                       <li class="flex items-center p-2 border border-border rounded-md bg-card-secondary text-sm">
                           <royal-code-ui-icon [icon]="quest.icon ?? AppIcon.HelpCircle" sizeVariant="sm" extraClass="mr-2 text-primary flex-shrink-0"/>
                           <span class="flex-grow truncate">{{ quest.titleKeyOrText | translate }}</span>
                           <span class="text-xs text-secondary ml-2 flex-shrink-0">{{ quest.status }}</span>
                       </li>
                   }
               </ul>
           } @else {
                <p class="text-sm text-secondary italic mt-2">{{ 'challenges.details.noRelatedQuests' | translate }}</p>
           }
        </section>

       @if (challenge()!.participants && challenge()!.participants!.length > 0) {
            <section id="participants" class="mb-6">
               <h3 class="section-title">{{ 'common.titles.participants' | translate }} ({{challenge()!.participantsCount}})</h3>
                 <royal-code-participants [participants]="challenge()!.participants"/>
            </section>
        }

       @if ((challenge()!.mediaGallery && challenge()!.mediaGallery!.length > 0) || (challenge()!.userMediaGallery && challenge()!.userMediaGallery!.length > 0)) {
            <section id="media" class="mb-6">
               <h3 class="section-title">{{ 'common.titles.mediaGallery' | translate }}</h3>
               <royal-code-ui-media-collection [media]="challenge()!.mediaGallery" gridFixedHeight="15rem"/>
            </section>
       }

        <section id="feed" class="mb-6">
           <h3 class="section-title">{{ 'common.titles.discussion' | translate }}</h3>
           <royal-code-feed [feedId]="challenge()!.feedId" [hideFeedReply]="false" [hideCommentReply]="false" />
        </section>

       <!-- REVIEW SECTIE -->
       <section id="reviews" class="mb-6">
           <h3 class="section-title">{{ 'common.titles.reviews' | translate }}</h3>

           <royal-code-review-list [itemTemplate]="challengeReviewTemplate" />

           <!-- Dit is de 'blauwdruk' voor één review kaart, specifiek voor de Challenger app -->
           <ng-template #challengeReviewTemplate let-review>
              <royal-code-ui-review-card [review]="review"
                                             (voteClicked)="onVote($event)"
                                             (replyClicked)="onReplyToReview($event)">

                <!-- Slot 1: De Header -->
                <div reviewHeader class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <!-- TODO: Vervangen met <royal-code-ui-profile-image> -->
                    <div class="w-10 h-10 bg-primary/20 rounded-full"></div>
                    <div>
                      <p class="font-semibold text-sm text-foreground">{{ review.profile.displayName }}</p>
                      <p class="text-xs text-secondary">{{ review.createdAt.iso | date:'mediumDate' }}</p>
                    </div>
                  </div>
                  <royal-code-ui-rating [rating]="review.rating" [readonly]="true" />
                </div>

                <!-- Slot 2: De Body -->
                <div reviewBody>
                  @if(review.title) {
                    <h4 class="font-semibold text-foreground mt-3">{{review.title}}</h4>
                  }
                  <p class="text-sm text-text-secondary mt-1 whitespace-pre-wrap">{{review.reviewText}}</p>
                </div>

                <!-- Slot 3: De Acties -->
                <div reviewActions class="flex items-center gap-4">
                  <royal-code-ui-button type="outline" sizeVariant="sm" (clicked)="$event.stopPropagation(); onVote(review.id)">
                    <royal-code-ui-icon [icon]="AppIcon.ThumbsUp" sizeVariant="sm" extraClass="mr-1.5" />
                    Helpful ({{ review.likes }})
                  </royal-code-ui-button>
                  <royal-code-ui-button type="outline" sizeVariant="sm" (clicked)="$event.stopPropagation(); onReplyToReview(review.id)">
                    <royal-code-ui-icon [icon]="AppIcon.MessageSquare" sizeVariant="sm" extraClass="mr-1.5" />
                    Reply ({{ review.replyCount }})
                  </royal-code-ui-button>
                </div>

              </royal-code-ui-review-card>
           </ng-template>
       </section>

        @if (challenge()!.faqs && challenge()!.faqs!.length > 0) {
           <section id="faqs" class="mb-6">
              <h3 class="section-title">{{ 'common.titles.faq' | translate }}</h3>
               <royal-code-ui-faq [faqs]="challenge()!.faqs"/>
           </section>
        }
    </article>
  } @else if (!isLoading() && !error()) {
    <p class="text-center my-12 text-secondary italic">
      {{ 'challenges.errors.notFound' | translate }}
    </p>
  }
</div>
  `,
})
export class ChallengeDetailComponent implements OnInit, OnDestroy {
  // --- Dependencies & State Signals ---
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly mapper = inject(MapperService);
  private readonly logger = inject(LoggerService);
  private readonly userFacade = inject(UserFacade);
  private readonly challengesFacade = inject(ChallengesFacade);
  private readonly nodesFacade = inject(NodesFacade) as INodesFacade;
  private readonly questsFacade = inject(QuestFacade);
  private readonly reviewsFacade = inject(ReviewsFacade);
  private readonly notificationService = inject(NotificationService);
  private readonly injector = inject(Injector);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly challenge: Signal<Challenge | undefined> = toSignal(
    this.challengesFacade.selectedChallenge$
  );
  readonly isLoadingDetails = toSignal(this.challengesFacade.loadingDetails$, {
    initialValue: true,
  });
  readonly errorDetails = toSignal(this.challengesFacade.errorDetails$, {
    initialValue: null,
  });
  readonly isLoadingQuests = signal(false);
  readonly questError = signal<string | null>(null);
  readonly relevantQuests = signal<Quest[]>([]);
  readonly startNode = signal<NodeFull | null | undefined>(undefined);
  readonly isFavorited = signal(false);
  readonly userParticipationStatus: Signal<ParticipationStatus> =
    signal('NotStarted');
  readonly userIsInParty = signal(false);
  readonly isLoading = computed(() => this.isLoadingDetails());
  readonly error = computed(() => this.errorDetails());
  readonly AppIcon = AppIcon;

  readonly startLocationAddress = computed(() => {
    const node = this.startNode();
    return node?.location?.address ?? 'Locatie onbekend';
  });
  readonly requirementsMet = computed(() => {
    return true; // Placeholder
  });
  readonly userParticipationStatusDisplay = computed(() => {
    switch (this.userParticipationStatus()) {
      case 'InProgress':
        return 'Bezig';
      case 'Completed':
        return 'Voltooid';
      case 'Paused':
        return 'Gepauzeerd';
      case 'Failed':
        return 'Mislukt';
      case 'NotStarted':
      default:
        return 'Nog niet gestart';
    }
  });
  readonly userParticipating = computed(() => {
    const status = this.userParticipationStatus();
    return status === 'InProgress' || status === 'Paused';
  });

  readonly hasRequirements = computed(() => {
    const chal = this.challenge();
    return (
      !!chal &&
      // TODO: Check `requiredLevel`, `requiredSkillIds`, `requiredItemIds` when added to model
      ((chal.ageRestrictions?.minAge && chal.ageRestrictions.minAge > 0) ||
        chal.isGroupChallenge)
    );
  });
  readonly hasRewards = computed(() => {
    const chal = this.challenge();
    return (
      !!chal &&
      (chal.rewardXP || chal.hasItemReward)
      // TODO: Add checks for `rewardBadgeId`, `unlocksQuestId` when added to model
    );
  });
  readonly routePointsForMap = computed(
    () => this.challenge()?.route?.trackingPoints ?? []
  );

  private challengeId: string | null = null;

  constructor() {
    this.logger.debug('[ChallengeDetailComponent] Initialized');
    effect(
      () => {
        const chal = this.challenge();
        if (chal) {
          this.logger.debug(
            `[ChallengeDetailComponent] Effect: Challenge ${chal.id} loaded. Fetching related data.`
          );
          if (chal.starterNodeId && this.startNode() === undefined) {
            this.loadStartNodeDetails(chal.starterNodeId);
          } else if (!chal.starterNodeId) {
            this.startNode.set(null);
          }
          this.loadRelevantQuests(chal.id, chal.starterNodeId);
          this.loadUserContext(chal.id);
          this.cdr.detectChanges();
        }
      },
      { injector: this.injector, allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    this.challengeId = this.route.snapshot.paramMap.get('id');
    if (this.challengeId) {
      this.logger.info(
        `[ChallengeDetailComponent] OnInit - Requesting Challenge Details for ID: ${this.challengeId}`
      );

      // Set the context for the reviews feature store to load the correct reviews.
      this.reviewsFacade.setContext(
        this.challengeId,
        ReviewTargetEntityType.CHALLENGE
      );
      this.challengesFacade
        .selectOrLoadChallengeDetails(this.challengeId)
        .pipe(takeUntilDestroyed(this.destroyRef)) // Corrected usage
        .subscribe({
          error: (err) =>
            this.logger.error(
              `[ChallengeDetailComponent] Error in selectOrLoadChallengeDetails stream:`,
              err
            ),
        });
    } else {
      this.logger.error('[ChallengeDetailComponent] No Challenge ID found!');
      this.router.navigate([ROUTES.challenges.overview]);
    }
  }

  ngOnDestroy(): void {
    this.logger.debug('[ChallengeDetailComponent] Component destroyed.');
  }

  private loadStartNodeDetails(nodeId: string): void {
    this.logger.debug(
      `[ChallengeDetailComponent] Requesting start node details: ${nodeId}`
    );
    this.startNode.set(undefined);
    this.nodesFacade
      .selectOrLoadNodeDetails(nodeId)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef)) // Corrected usage
      .subscribe({
        next: (node) => {
          this.logger.debug(
            `[ChallengeDetailComponent] Start node loaded: ${node?.id}`
          );
          this.startNode.set(node ?? null);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.logger.error(
            `[ChallengeDetailComponent] Error loading start node ${nodeId}:`,
            err
          );
          this.startNode.set(null);
          this.cdr.detectChanges();
        },
      });
  }

  private loadRelevantQuests(
    challengeId: string | null | undefined,
    nodeId: string | null | undefined
  ): void {
    this.isLoadingQuests.set(true);
    this.questError.set(null);
    this.logger.debug(
      `[ChallengeDetailComponent] Requesting relevant quests. Challenge: ${challengeId}, Node: ${nodeId}`
    );
    this.questsFacade
      .selectOrLoadRelevantQuests(nodeId, challengeId)
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef), // Corrected usage
        finalize(() => this.isLoadingQuests.set(false)),
        catchError((err) => {
          this.logger.error(
            `[ChallengeDetailComponent] Error loading relevant quests:`,
            err
          );
          this.questError.set('Failed to load quests.');
          return of([]);
        })
      )
      .subscribe((quests) => {
        this.logger.info(
          `[ChallengeDetailComponent] Received relevant quests. Count: ${quests.length}`
        );
        this.relevantQuests.set(quests ?? []);
        this.cdr.detectChanges();
      });
  }

  private loadUserContext(challengeId: string): void {
    this.logger.debug(
      `[ChallengeDetailComponent] Placeholder: Loading user context for ${challengeId}`
    );
    // TODO: Implement real logic
  }

  // --- Action Handlers (placeholders) ---
  backToOverview(): void {
    this.router.navigate([ROUTES.challenges.overview]);
  }
  joinChallenge(challengeId: string | undefined): void {
    if (!challengeId) return;
    this.logger.info('Action: Join challenge:', challengeId);
    this.notificationService.showInfo('Deelnemen nog niet geïmplementeerd.');
  }
  startTracking(challengeId: string | undefined): void {
    if (!challengeId) return;
    this.logger.info('Action: Start/Continue Tracking:', challengeId);
    this.notificationService.showInfo(
      'Tracking starten nog niet geïmplementeerd.'
    );
  }
  pauseChallenge(challengeId: string | undefined): void {
    if (!challengeId) return;
    this.logger.info('Action: Pause Challenge:', challengeId);
  }
  stopChallenge(challengeId: string | undefined): void {
    if (!challengeId) return;
    this.logger.info('Action: Stop Challenge:', challengeId);
  }
  joinOrFormParty(): void {
    this.logger.info('Action: Join/Form Party');
    this.notificationService.showInfo('Party vormen nog niet geïmplementeerd.');
  }
  shareChallenge(challenge: Challenge | undefined): void {
    if (!challenge) return;
    this.logger.info('Action: Share challenge:', challenge.title);
    this.notificationService.showInfo('Delen nog niet geïmplementeerd.');
  }
  toggleFavorite(challengeId: string | undefined): void {
    if (!challengeId) return;
    this.isFavorited.update((fav) => !fav);
    this.logger.info(
      'Action: Toggled favorite for:',
      challengeId,
      'New state:',
      this.isFavorited()
    );
    this.notificationService.showInfo(
      this.isFavorited() ? 'Opgeslagen!' : 'Opslaan ongedaan gemaakt.'
    );
  }
  startExternalNavigation(): void {
    const coords = this.startNode()?.location?.coordinates;
    const locationName =
      this.challenge()?.title ?? this.startNode()?.title ?? 'Startpunt';
    this.logger.info(
      `[ChallengeDetail] Attempting external navigation to:`,
      coords
    );
    if (coords) {
      const geoUri = `geo:${coords.lat},${coords.lng}?q=${coords.lat},${
        coords.lng
      }(${encodeURIComponent(locationName)})`;
      try {
        window.open(geoUri, '_system');
      } catch (e) {
        this.notificationService.showError('Fout bij openen navigatie-app.');
        this.logger.error(`[ChallengeDetail] Failed to open geo URI:`, e);
      }
    } else {
      this.notificationService.showError(
        'nodes.errors.startLocationUnavailable'
      );
      this.logger.warn(
        `[ChallengeDetail] Cannot start external navigation: Start node coordinates missing.`
      );
    }
  }
  scrollToSection(sectionId: string): void {
    this.logger.debug(`Scrolling to section: ${sectionId}`);
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // --- Review Action Handlers ---
  onVote(reviewId: string): void {
    this.logger.info(`Action: Vote helpful for review ${reviewId}`);
    this.reviewsFacade.vote(reviewId, 'like');
    this.notificationService.showSuccess('Thanks for your feedback!');
  }

  onReplyToReview(reviewId: string): void {
    this.logger.info(`Action: Reply to review ${reviewId}`);
    // TODO: Implement logic to show a comment/reply input field.
    this.notificationService.showInfo('Replying is not yet implemented.');
  }

  // --- Template Helper Functions ---
  formatDuration(seconds: number | undefined): string {
    if (seconds === undefined || seconds === null) return '~?';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    let str = '~';
    if (hours > 0) str += `${hours}u `;
    str += `${minutes}m`;
    return str;
  }
  getEquipmentIcon(item: EquipmentItem): AppIcon {
    const iconKey = item.iconName as keyof typeof AppIcon;
    return AppIcon[iconKey] || AppIcon.Package;
  }
  getHazardIcon(hazard: Hazard): AppIcon {
    const iconKey = hazard.iconName as keyof typeof AppIcon;
    return AppIcon[iconKey] || AppIcon.AlertTriangle;
  }
  getDifficultyIcon(level: DifficultyLevel | undefined): AppIcon {
    return AppIcon.Gauge;
  }
  getTypeIcon(type: string | undefined): AppIcon {
    /* TODO: Map type string to icon */ return AppIcon.Trophy;
  }
  getPrivacyIcon(privacy: PrivacyLevel | undefined): AppIcon {
    switch (privacy) {
      case PrivacyLevel.PUBLIC:
        return AppIcon.Globe;
      case PrivacyLevel.FRIENDS:
        return AppIcon.Users;
      case PrivacyLevel.PRIVATE:
        return AppIcon.Lock;
      default:
        return AppIcon.HelpCircle;
    }
  }
  getStatusIcon(status: ChallengeStatus | undefined): AppIcon {
    switch (status) {
      case 'Active':
        return AppIcon.Play;
      case 'Upcoming':
        return AppIcon.CalendarClock;
      case 'Completed':
        return AppIcon.CheckCheck;
      default:
        return AppIcon.CircleDot;
    }
  }

  // --- TrackBy Functions ---
  trackById(index: number, item: { id: string }): string {
    return item.id;
  }
}
