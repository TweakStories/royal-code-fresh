// libs/features/nodes/src/lib/components/node-detail/node-detail.component.ts
/**
 * @fileoverview Displays the full details of a selected Node, potentially including
 *               information about an associated Challenge, Quests, and social feed.
 * @Component NodeDetailComponent
 * @description Container component retrieving and displaying comprehensive node details.
 *              Adapts from ChallengeDetailComponent structure.
 * @version 1.0.6 - Corrected template structure with @if alias and refined media gallery binding.
 */
import {
  Component, ChangeDetectionStrategy, inject, signal, computed, effect, OnInit, OnDestroy,
  Signal, Injector, ChangeDetectorRef, DestroyRef
} from '@angular/core';
import { CommonModule, TitleCasePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { take, finalize } from 'rxjs/operators';

// --- UI Imports ---
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiMediaMosaicGridComponent, MediaViewerService, UiMediaCollectionComponent } from '@royal-code/ui/media';
import { UiRatingComponent } from '@royal-code/ui/rating';
import { UiStatCardComponent } from '@royal-code/ui/cards/stat-card';
import { FeedComponent } from '@royal-code/features/social/ui';
import { UiImageComponent } from "@royal-code/ui/media";

// --- Domain Imports ---
import {
  AppIcon, NodeFull, NodeType, NodeStatus, ChallengeSummary,
   Quest,
  DifficultyLevel, ModeOfCompletion
} from '@royal-code/shared/domain';
import { Image, MediaType, Media } from '@royal-code/shared/domain';

// --- State & Core Imports ---
import { NodesFacade } from '../../state/nodes.facade';
import { ChallengesFacade } from '@royal-code/features/challenges';
import { UserFacade } from '@royal-code/store/user';
import { QuestFacade } from '@royal-code/features/quests';
import { LoggerService } from '@royal-code/core/core-logging';
import { NotificationService } from '@royal-code/ui/notifications';
import { ROUTES } from '@royal-code/core/routing';

type ChallengeParticipationStatus = 'NotStarted' | 'InProgress' | 'Completed' | 'Paused' | 'Failed' | 'NotApplicable';

@Component({
  selector: 'royal-code-node-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule, TitleCasePipe, DecimalPipe,
    UiButtonComponent, UiIconComponent, UiMediaMosaicGridComponent,
    UiRatingComponent, UiStatCardComponent,
    FeedComponent, UiImageComponent,
    UiMediaCollectionComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<!-- Outer Container -->
<div class="node-detail-container text-text">

  <!-- Back Button -->
  <button
    (click)="backToOverview()"
    (keydown.enter)="backToOverview()"
    (keydown.space)="$event.preventDefault(); backToOverview()"
    tabindex="0" role="button" aria-label="Back to Node Overview"
    class="mb-4 inline-flex items-center text-sm text-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
    <royal-code-ui-icon [icon]="AppIcon.ArrowLeft" sizeVariant="sm" extraClass="mr-1"/>
    {{ 'nodes.buttons.backToOverview' | translate }}
  </button>

  <!-- Main Content Structure: Primary @if checks for node() -->
  @if (node(); as currentNode) {
    <article>
      <!-- Header Section -->
      <header class="mb-6">
        <div class="relative w-full aspect-video bg-muted rounded-xs overflow-hidden shadow-md mb-4">
          @if(linkedChallenge(); as challenge) {
            <royal-code-ui-image
                [image]="challenge.mainImageUrl"
                objectFit="cover" />
           } @else {
              <div class="absolute inset-0 flex items-center justify-center">
                  <royal-code-ui-icon [icon]="getNodeTypeIcon(currentNode.type)" sizeVariant="xl" colorClass="text-secondary opacity-30"></royal-code-ui-icon>
               </div>
           }
        </div>
        <h1 class="text-2xl md:text-4xl font-bold mb-1 break-words text-foreground">{{ displayTitle() }}</h1>
        <div class="text-xs md:text-sm text-secondary mb-2">
          {{ 'nodes.details.type' | translate }}: {{ currentNode.type | titlecase }}
          @if (currentNode.location.address; as address) {
            <span class="text-xs text-secondary"> • {{ address }}</span>
          }
        </div>
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-secondary mb-3">
           <span><royal-code-ui-icon [icon]="getNodeStatusIcon(currentNode.status)" sizeVariant="xs" extraClass="inline-block mr-1"/>{{ currentNode.status | titlecase }}</span>
           <span><royal-code-ui-icon [icon]="AppIcon.Users" sizeVariant="xs" extraClass="inline-block mr-1"/>{{ currentNode.popularity | number }} Views</span>
        </div>
        @if (linkedChallenge(); as chal) {
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm">
              <a (click)="navigateToChallengeDetail(chal.id)" (keydown.enter)="navigateToChallengeDetail(chal.id)" (keydown.space)="$event.preventDefault(); navigateToChallengeDetail(chal.id)" class="flex items-center text-secondary hover:text-primary cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded" tabindex="0" role="link" [attr.aria-label]="'View details for challenge ' + chal.title">
                 <royal-code-ui-rating [rating]="chal.rating" [readonly]="true" />
                 <span class="ml-1">({{ chal.reviews?.length ?? 0 }} {{ 'common.units.reviews' | translate }})</span>
              </a>
              <span class="flex items-center text-secondary">
                 <royal-code-ui-icon [icon]="getChallengeDifficultyIcon(chal.difficultyLevel)" sizeVariant="xs" extraClass="mr-1"/>
                 <span>{{ chal.difficultyLevel.level | titlecase }}</span>
              </span>
          </div>
        }
      </header>

      <section class="mb-6 p-4 bg-card-secondary rounded-xs border border-border">
         <h3 class="text-sm font-semibold text-secondary mb-2 uppercase tracking-wider">{{ 'nodes.details.actionsAndStatus' | translate }}</h3>
         @if (linkedChallenge()) {
            <p class="text-base font-medium text-text mb-3">{{ 'nodes.challenge.yourStatus' | translate }}: {{ userChallengeParticipationStatusDisplay() }}</p>
         }
          <royal-code-ui-button
            type="primary"
            mb-3"
            (clicked)="handlePrimaryNodeAction(currentNode)"
            [disabled]="isPrimaryActionDisabled()">
             <royal-code-ui-icon [icon]="primaryActionDetails().icon" sizeVariant="sm" extraClass="mr-1.5"/>
             {{ primaryActionDetails().textKey | translate }}
          </royal-code-ui-button>
         <div class="flex items-center justify-center space-x-3 mt-3">
            <royal-code-ui-button type="outline" sizeVariant="sm" (clicked)="startExternalNavigation(currentNode)">
                <royal-code-ui-icon [icon]="AppIcon.Navigation" sizeVariant="sm" extraClass="mr-1 text-muted-foreground"/>
                {{ 'nodes.actions.navigate' | translate }}
            </royal-code-ui-button>
            <royal-code-ui-button type="outline" sizeVariant="sm" (clicked)="toggleNodeBookmark(currentNode.id)">
                <royal-code-ui-icon [icon]="isNodeBookmarked() ? AppIcon.BookmarkCheck : AppIcon.Bookmark" sizeVariant="sm" [colorClass]="isNodeBookmarked() ? 'text-primary' : 'text-muted-foreground'" extraClass="mr-1"/>
                {{ (isNodeBookmarked() ? 'common.actions.saved' : 'common.actions.save') | translate }}
            </royal-code-ui-button>
             <royal-code-ui-button type="outline" sizeVariant="sm" (clicked)="shareNode(currentNode)">
                 <royal-code-ui-icon [icon]="AppIcon.Share" sizeVariant="sm" extraClass="mr-1 text-muted-foreground"/>
                 {{ 'common.buttons.share' | translate }}
             </royal-code-ui-button>
         </div>
      </section>

      <section id="description" class="mb-6">
          <h3 class="section-title">{{ 'common.titles.description' | translate }}</h3>
          <div class="prose prose-sm md:prose-base max-w-none text-text-secondary mt-2" [innerHTML]="displayDescription() | translate"></div>
      </section>

        @if (linkedChallenge(); as chal) {
            <section id="challenge-info" class="mb-6 p-4 bg-card-secondary rounded-xs border border-border">
                <h3 class="section-title text-primary !mb-3">
                    <a (click)="navigateToChallengeDetail(chal.id)" (keydown.enter)="navigateToChallengeDetail(chal.id)" (keydown.space)="$event.preventDefault(); navigateToChallengeDetail(chal.id)" class="hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded" tabindex="0" role="link" [attr.aria-label]="'View details for challenge ' + chal.title">
                         {{ 'nodes.details.linkedChallenge' | translate }}: {{ chal.title }}
                         <royal-code-ui-icon [icon]="AppIcon.ArrowRight" sizeVariant="xs" extraClass="inline-block ml-1"/>
                    </a>
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-4">
                  <royal-code-ui-stat-card [icon]="getChallengeModeIcon(chal.modeOfCompletions[0])" [label]="'nodes.challenge.mode' | translate" [value]="(chal.modeOfCompletions[0]?.category | titlecase) ?? 'N/A'" />
                  <royal-code-ui-stat-card [icon]="AppIcon.Clock" [label]="'nodes.challenge.duration' | translate" [value]="formatDuration(chal.estimatedDuration)" />
                </div>
            </section>
        }

        <section id="quests" class="mb-6">
           <h3 class="section-title">{{ 'common.titles.relatedQuests' | translate }}</h3>
           @if (isLoadingQuests()) {
               <p class="text-sm text-secondary italic mt-2">{{ 'common.messages.loading' | translate }}...</p>
           } @else if (relevantQuests().length > 0) {
               <ul class="list-none space-y-2 mt-2">
                   @for (quest of relevantQuests(); track quest.id) {
                       <li class="flex items-center p-2 border border-border rounded-md bg-card-secondary text-sm hover:bg-accent cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" (click)="navigateToQuest(quest.id)" (keydown.enter)="navigateToQuest(quest.id)" tabindex="0" role="link" [attr.aria-label]="'View details for quest ' + (quest.titleKeyOrText | translate)">
                           <royal-code-ui-icon [icon]="quest.icon ?? AppIcon.HelpCircle" sizeVariant="sm" extraClass="mr-2 text-primary flex-shrink-0"/>
                           <span class="flex-grow truncate">{{ quest.titleKeyOrText | translate }}</span>
                           <span class="text-xs text-secondary ml-2 flex-shrink-0">{{ quest.status }}</span>
                       </li>
                   }
               </ul>
           } @else {
                <p class="text-sm text-secondary italic mt-2">{{ 'nodes.details.noRelatedQuests' | translate }}</p>
           }
        </section>

       @if (currentNode.mediaGallery && currentNode.mediaGallery.length > 0) {
            <section id="media" class="mb-6">
               <h3 class="section-title">{{ 'common.titles.mediaGallery' | translate }}</h3>
               <royal-code-ui-media-collection [media]="currentNode.mediaGallery" gridFixedHeight="15rem"/>
            </section>
       }

        @if (displayFeedId(); as feedIdVal) {
            <section id="feed" class="mb-6">
               <h3 class="section-title">{{ 'common.titles.discussion' | translate }}</h3>
               <royal-code-feed [feedId]="feedIdVal" [hideFeedReply]="true" [hideCommentReply]="true" [maximumNumberOfFeedItems]="4" />
            </section>
        }
    </article>
  }
  @else if (isLoadingNode()) {
    <div class="text-center my-12 p-4">
        <span class="text-primary animate-pulse text-lg">{{ 'common.messages.loadingDetails' | translate }}...</span>
    </div>
  }
  @else if (nodeError()) {
    <div class="my-12 p-6 bg-destructive/10 text-destructive rounded-md border border-destructive/30 text-center">
       <h3 class="font-semibold text-lg mb-2">{{ 'common.errors.errorOccurred' | translate }}</h3>
       <p class="text-sm mb-4">{{ nodeError() }}</p>
       <royal-code-ui-button type="primary" sizeVariant="sm" (clicked)="backToOverview()">
            {{ 'common.buttons.back' | translate }}
       </royal-code-ui-button>
    </div>
  }
  @else {
    <p class="text-center my-12 text-secondary italic">
      {{ 'nodes.errors.notFound' | translate }}
    </p>
  }
</div>
  `,
})
export class NodeDetailComponent implements OnInit, OnDestroy {
  // --- Dependencies & State Signals ---
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private logger = inject(LoggerService);
  private nodesFacade = inject(NodesFacade);
  private challengesFacade = inject(ChallengesFacade);
  private questsFacade = inject(QuestFacade);
  private userFacade = inject(UserFacade);
  private notificationService = inject(NotificationService);
  private mediaViewerService = inject(MediaViewerService);
  private injector = inject(Injector);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  readonly nodeId = signal<string | null>(null);
  readonly node: Signal<NodeFull | undefined> = toSignal(
    this.nodesFacade.selectedNode$
  );
  readonly isLoadingNode = toSignal(this.nodesFacade.loadingDetails$, {
    initialValue: true,
  });
  readonly nodeErrorSignal = signal<string | null>(null);

  readonly linkedChallenge = signal<ChallengeSummary | undefined | null>(
    undefined
  );
  readonly isLoadingChallenge = signal<boolean>(false);

  readonly relevantQuests = signal<Quest[]>([]);
  readonly isLoadingQuests = signal(false);
  readonly questError = signal<string | null>(null);

  readonly isNodeBookmarked = signal(false);
  readonly userChallengeParticipationStatus =
    signal<ChallengeParticipationStatus>('NotApplicable');

  readonly AppIcon = AppIcon;
  readonly NodeType = NodeType;
  readonly MediaType = MediaType;

  // --- Computed Signals ---
  readonly nodeError = computed(
    () =>
      this.nodeErrorSignal() ??
      toSignal(this.nodesFacade.errorDetails$, { initialValue: null })()
  );

  readonly displayTitle = computed(() => {
    const chal = this.linkedChallenge();
    const nd = this.node();
    if (chal && (nd?.type === NodeType.START || !nd?.title)) return chal.title;
    return nd?.title ?? 'Node Details';
  });

// --- MET DIT BLOK ---
  /**
   * @description Bepaalt de cover-afbeelding die getoond moet worden. Geeft voorrang aan
   *              een afbeelding uit de media-galerij van de node en valt terug op de
   *              cover-afbeelding van de gelinkte challenge.
   * @returns {Image | undefined} Het `Image` object voor de cover, of undefined.
   */
  readonly displayCoverImage: Signal<Image | undefined> = computed(() => {
    const nodeMedia = this.node()?.mediaGallery;
    const challenge = this.linkedChallenge();

    // Prioriteit 1: Zoek een 'cover' afbeelding in de media-galerij van de node.
    if (nodeMedia?.length) {
      const coverImage = nodeMedia.find(
        (m): m is Image => m.type === MediaType.IMAGE && m.variants.some(v => v.purpose === 'cover')
      );
      if (coverImage) return coverImage;

      // Prioriteit 2: Zoek de eerste de beste afbeelding in de media-galerij van de node.
      const firstImage = nodeMedia.find((m): m is Image => m.type === MediaType.IMAGE);
      if (firstImage) return firstImage;
    }

    // Prioriteit 3: Gebruik de `mainImageUrl` of `coverImageUrl` van de gelinkte challenge.
    // Dit zijn al volledige Image objecten, dus we kunnen ze direct retourneren.
    if (challenge) {
      return challenge.mainImageUrl ?? challenge.coverImageUrl;
    }

    // Geen afbeelding gevonden.
    return undefined;
  });

  readonly displayDescription = computed(() => {
    const nodeDesc = this.node()?.description;
    const challengeSummary = this.linkedChallenge()?.summary;
    return nodeDesc || challengeSummary || 'nodes.details.noDescription';
  });

  readonly displayFeedId = computed(
    () => this.node()?.socialFeedId ?? this.linkedChallenge()?.feedId
  );

  readonly userChallengeParticipationStatusDisplay = computed(() => {
    switch (this.userChallengeParticipationStatus()) {
      case 'InProgress':
        return 'Bezig met gelinkte challenge';
      case 'Completed':
        return 'Gelinkte challenge voltooid';
      case 'NotStarted':
        return 'Nog niet gestart met gelinkte challenge';
      default:
        return '';
    }
  });

  readonly primaryActionDetails = computed(() => {
    const nd = this.node();
    const chal = this.linkedChallenge();
    if (nd?.type === NodeType.START && chal) {
      return {
        textKey: 'nodes.actions.startChallenge',
        icon: AppIcon.Play,
        type: 'challenge-start' as const,
      };
    }
    if (nd?.type === NodeType.QUEST) {
      return {
        textKey: 'nodes.actions.viewQuest',
        icon: AppIcon.HelpCircle,
        type: 'quest-view' as const,
      };
    }
    return {
      textKey: 'nodes.actions.interactDefault',
      icon: AppIcon.Handshake,
      type: 'node-interact' as const,
    };
  });

  readonly isPrimaryActionDisabled = computed(() => {
    return (
      this.node()?.status === NodeStatus.LOCKED ||
      this.isLoadingChallenge() ||
      this.isLoadingNode()
    );
  });

  constructor() {
    this.logger.debug('[NodeDetailComponent] Initialized');
    effect(
      () => {
        const idFromRoute = this.route.snapshot.paramMap.get('id');
        if (idFromRoute && idFromRoute !== this.nodeId()) {
          this.nodeId.set(idFromRoute);
          this.loadNodeAndRelatedData(idFromRoute);
        }
      },
      { injector: this.injector, allowSignalWrites: true }
    );

    effect(
      () => {
        const nodeData = this.node();
        if (nodeData?.challengeId) {
          this.loadLinkedChallengeSummary(nodeData.challengeId);
        } else {
          this.linkedChallenge.set(null);
        }
      },
      { injector: this.injector, allowSignalWrites: true }
    );

    effect(
      () => {
        const nd = this.node();
        const chal = this.linkedChallenge();
        if (nd) {
          this.loadRelevantQuests(nd.id, chal?.id);
          this.loadUserSpecificNodeData(nd.id, chal?.id);
        }
      },
      { injector: this.injector, allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    this.logger.info(
      `[NodeDetailComponent] OnInit. Resolved Node ID from route: ${this.nodeId()}`
    );
    const resolvedNodeData = this.route.snapshot.data['resolvedData'] as {
      node: NodeFull | null;
    };
    if (resolvedNodeData && resolvedNodeData.node) {
      this.nodesFacade.selectNode(resolvedNodeData.node.id);
      this.logger.debug(
        `[NodeDetailComponent] Node data from resolver: ${resolvedNodeData.node.id}`
      );
    } else if (!this.nodeId() && !resolvedNodeData?.node) {
      this.logger.error(
        '[NodeDetailComponent] No Node ID found from route or resolver!'
      );
      this.nodeErrorSignal.set('Node could not be loaded.');
    } else if (this.nodeId() && !resolvedNodeData?.node) {
      this.logger.warn(
        `[NodeDetailComponent] Node ID ${this.nodeId()} present, but resolver did not provide node data. Error state should be set by facade.`
      );
    }
  }

  ngOnDestroy(): void {
    this.logger.debug('[NodeDetailComponent] Component destroyed.');
    this.nodesFacade.selectNode(null);
  }

  private loadNodeAndRelatedData(nodeId: string): void {
    this.logger.info(
      `[NodeDetailComponent] Requesting Node Details for ID: ${nodeId}`
    );
    this.nodeErrorSignal.set(null);
    this.nodesFacade
      .selectOrLoadNodeDetails(nodeId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (node) => {
          if (!node && !this.isLoadingNode()) {
            this.nodeErrorSignal.set('Node not found.');
          }
        },
        error: (err) => {
          this.logger.error(
            `[NodeDetailComponent] Error in selectOrLoadNodeDetails stream:`,
            err
          );
          this.nodeErrorSignal.set('Failed to load node details.');
        },
      });
  }

  private loadLinkedChallengeSummary(challengeId: string): void {
    this.isLoadingChallenge.set(true);
    this.logger.debug(
      `[NodeDetailComponent] Requesting Challenge Summary for linked ID: ${challengeId}`
    );
    this.challengesFacade
      .selectOrLoadChallengeSummaryById(challengeId)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (summary) => {
          this.linkedChallenge.set(summary ?? null);
          this.isLoadingChallenge.set(false);
          this.logger.debug(
            `[NodeDetailComponent] Linked challenge summary loaded: ${summary?.title}`
          );
        },
        error: (err) => {
          this.logger.error(
            `[NodeDetailComponent] Error loading linked challenge summary ${challengeId}:`,
            err
          );
          this.linkedChallenge.set(null);
          this.isLoadingChallenge.set(false);
        },
      });
  }

  private loadRelevantQuests(nodeId: string, challengeId?: string): void {
    this.isLoadingQuests.set(true);
    this.questError.set(null);
    this.logger.debug(
      `[NodeDetailComponent] Requesting relevant quests. Node: ${nodeId}, Challenge: ${challengeId}`
    );
    this.questsFacade
      .selectOrLoadRelevantQuests(nodeId, challengeId)
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingQuests.set(false))
      )
      .subscribe({
        next: (quests) => {
          this.relevantQuests.set(quests ?? []);
        },
        error: (err) => {
          this.logger.error(
            `[NodeDetailComponent] Error loading relevant quests:`,
            err
          );
          this.questError.set('Failed to load quests.');
        },
      });
  }

  private loadUserSpecificNodeData(nodeId: string, challengeId?: string): void {
    this.logger.debug(
      `[NodeDetailComponent] Placeholder: Loading user-specific data for node ${nodeId}, challenge ${challengeId}`
    );
    this.userFacade
      .selectIsBookmarked(nodeId)
      .pipe(take(1))
      .subscribe((isBookmarked) => {
          this.isNodeBookmarked.set(isBookmarked);
      });
    if (challengeId) {
      this.userChallengeParticipationStatus.set('NotStarted');
    } else {
      this.userChallengeParticipationStatus.set('NotApplicable');
    }
  }

  backToOverview(): void {
    const nodesPath = ROUTES.nodes?.path;
    this.router.navigate([nodesPath ?? '/nodes']);
  }

  handlePrimaryNodeAction(node: NodeFull): void {
    const actionDetails = this.primaryActionDetails();
    this.logger.info(
      `[NodeDetailComponent] Primary action: ${actionDetails.textKey} for node ${node.id}`
    );
    if (actionDetails.type === 'challenge-start' && node.challengeId) {
      this.navigateToChallengeDetail(node.challengeId);
    } else if (actionDetails.type === 'quest-view') {
      this.notificationService.showInfo(
        'Quest bekijken nog niet geïmplementeerd.'
      );
    } else {
      this.nodesFacade.interactWithNode(node.id, 'default_interaction');
      this.notificationService.showInfo(
        `Interactie met ${node.title} uitgevoerd.`
      );
    }
  }

  navigateToChallengeDetail(challengeId: string | null | undefined): void {
    if (challengeId) {
      const challengesPath = ROUTES.challenges?.path;
      this.router.navigate([challengesPath ?? '/challenges', challengeId]);
    }
  }

  navigateToQuest(questId: string | null | undefined): void {
    if (questId) {
      this.logger.info(`Navigating to quest: ${questId}`);
      const questsPath = ROUTES.quests?.path;
      this.router.navigate([questsPath ?? '/quests', questId]);
    }
  }

  startExternalNavigation(node: NodeFull): void {
    const coords = node.location?.coordinates;
    const locationName = node.title ?? 'Node Location';
    if (coords) {
      const geoUri = `geo:${coords.lat},${coords.lng}?q=${coords.lat},${
        coords.lng
      }(${encodeURIComponent(locationName)})`;
      try {
        window.open(geoUri, '_system');
      } catch (e) {
        this.notificationService.showError('Fout bij openen navigatie-app.');
        this.logger.error(`[NodeDetail] Failed to open geo URI:`, e);
      }
    } else {
      this.notificationService.showError(
        'nodes.errors.startLocationUnavailable'
      );
    }
  }

  toggleNodeBookmark(nodeId: string): void {
    this.isNodeBookmarked.update((fav) => !fav);
    this.notificationService.showInfo(
      this.isNodeBookmarked()
        ? 'Node opgeslagen!'
        : 'Node opslaan ongedaan gemaakt.'
    );
  }

  shareNode(node: NodeFull): void {
    this.logger.info('Action: Share node:', node.title);
    this.notificationService.showInfo(
      'Delen van node nog niet geïmplementeerd.'
    );
  }

  formatDuration(seconds: number | undefined): string {
    if (seconds === undefined || seconds === null) return '~?';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    let str = '~';
    if (hours > 0) str += `${hours}u `;
    str += `${minutes}m`;
    return str;
  }
  getNodeTypeIcon(type: NodeType | undefined): AppIcon {
    return type === NodeType.START
      ? AppIcon.Flag
      : type === NodeType.POI
      ? AppIcon.Eye
      : AppIcon.MapPin;
  }
  getNodeStatusIcon(status: NodeStatus | undefined): AppIcon {
    return status === NodeStatus.COMPLETED
      ? AppIcon.CheckCheck
      : AppIcon.CircleDot;
  }
  getChallengeDifficultyIcon(level: DifficultyLevel | undefined): AppIcon {
    return AppIcon.Gauge;
  }
  getChallengeModeIcon(mode: ModeOfCompletion | undefined): AppIcon {
    return AppIcon.Activity;
  }

  openMediaGallery(
    mediaItems: ReadonlyArray<Media> | undefined,
    startIndex: number = 0
  ): void {
    if (mediaItems && mediaItems.length > 0) {
      this.mediaViewerService.openLightbox(mediaItems as Media[], startIndex);
    }
  }
}
