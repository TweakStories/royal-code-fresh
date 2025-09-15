// libs/features/social/ui/reaction-picker/reaction-picker.component.ts
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';

import { LoggerService } from '@royal-code/core/core-logging';
import { AppIcon, ReactionSummary, ReactionType } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { DynamicOverlayRef, DYNAMIC_OVERLAY_REF } from '@royal-code/ui/overlay';
@Component({
  selector: 'royal-code-reaction-picker',
  standalone: true,
  imports: [UiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="flex flex-nowrap items-center space-x-1 bg-background shadow-md rounded-full p-1 border border-[var(--color-border)]">
  @for(reaction of reactionTypes(); track reaction) {
      <button
          class="p-1 rounded-full hover:scale-125 focus:scale-125 focus:outline-none transition-transform duration-150 ease-out"
          (click)="select(reaction)"
          [title]="reaction"
          [attr.aria-label]="'Select reaction: ' + reaction">
          <royal-code-ui-icon
            [icon]="getAppIcon(reaction)"
            sizeVariant="md">
        </royal-code-ui-icon>
      </button>
  }
</div>

  `,
})
export class ReactionPickerComponent {
  private overlayRef = inject<DynamicOverlayRef<ReactionType>>(DYNAMIC_OVERLAY_REF);
  private logger = inject<LoggerService>(LoggerService);

  readonly reactionTypes = signal<ReactionType[]>([
        ReactionType.Like, ReactionType.Love, ReactionType.Haha,
        ReactionType.Wow, ReactionType.Sad, ReactionType.Angry
  ]);

  /** Roept close aan op de overlay ref met de geselecteerde reactie */
  select(reaction: ReactionType): void {
    this.overlayRef.close(reaction);
  }

/**
   * Maps a ReactionType enum value to the corresponding Lucide icon name.
   * @param reactionType The type of reaction.
   * @returns The string name of the Lucide icon.
   */
  /**
   * Maps a ReactionType enum value to the corresponding AppIcon enum value.
   * @param reactionType The type of reaction.
   * @returns The AppIcon enum value.
   */
  getAppIcon(reactionType: ReactionType): AppIcon { // <-- Return type is nu AppIcon
    switch (reactionType) {
      case ReactionType.Like: return AppIcon.ThumbsUp;
      case ReactionType.Love: return AppIcon.Heart;
      case ReactionType.Haha: return AppIcon.SmilePlus;
      case ReactionType.Wow:  return AppIcon.Sparkles;
      case ReactionType.Sad:  return AppIcon.Frown;
      case ReactionType.Angry:return AppIcon.Angry;
      default:
        this.logger.error(`[getAppIcon] Unknown ReactionType: ${reactionType}. Falling back to ThumbsUp.`);
        return AppIcon.ThumbsUp; // Fallback naar een enum waarde
    }
  }
  /** Berekent het totale aantal reacties */
  getTotalReactionCount(reactions?: readonly ReactionSummary[]): number { // Gebruik readonly type
    return reactions?.reduce((sum, r) => sum + (r.count || 0), 0) ?? 0;
  }

}
