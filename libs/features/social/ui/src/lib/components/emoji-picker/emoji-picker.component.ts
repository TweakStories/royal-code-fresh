import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { DYNAMIC_OVERLAY_REF, DynamicOverlayRef } from '@royal-code/ui/overlay';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { TranslateModule } from '@ngx-translate/core';
import { EmojiSelectionService } from '@royal-code/features/social/core';

@Component({
  selector: 'lib-emoji-picker',
  standalone: true,
  imports: [PickerComponent, UiButtonComponent, UiIconComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<!-- In emoji-picker.component.ts template -->
<div class="emoji-picker-container flex flex-col h-full w-full
               md:max-w-[352px]
               md:rounded-xs
               md:border border-border
               bg-popover text-popover-foreground
               md:shadow-lg
               overflow-hidden"
         (click)="$event.stopPropagation()"
          tabindex="0"
          (keydown.enter)="$event.stopPropagation()"
          (keydown.space)="$event.stopPropagation()">

     <!-- Header: Alleen zichtbaar op mobiel (<md) -->
    <header class="flex md:hidden items-center justify-between p-2 border-b border-border flex-shrink-0">
       <!-- Back Button -->
       <royal-code-ui-button type="transparent" sizeVariant="icon" (clicked)="closeOverlay()" [title]="'common.buttons.back' | translate" extraClasses="-ml-2">
           <royal-code-ui-icon [icon]="AppIcon.ArrowLeft" sizeVariant="md" />
       </royal-code-ui-button>
       <!-- Title -->
      <span class="text-sm font-medium mx-auto px-2">{{ 'social.picker.selectEmoji' | translate }}</span>
       <!-- Close Button -->
    </header>

    <!-- Picker Component: Vult resterende ruimte -->
    <div class="flex-grow overflow-hidden">
         <emoji-mart
             class="emoji-mart-picker-instance "
             [isNative]="true" locale="nl" theme="auto"
             previewPosition="none" skinTonePosition="none"
             (emojiSelect)="handleEmojiSelect($event)"
         />
     </div>
</div>
`,
styles: [`
  :host { display: block; height: 100%; width: 100%; overflow: hidden; }

  /* Forceer interne emoji-mart container om breedte te vullen */
  /* Optie 1: Target een specifieke interne class (vervang door echte class) */
  :host ::ng-deep .emoji-mart-scroll, /* Probeer de scroll container */
  :host ::ng-deep .emoji-mart /* Of de hoofdcontainer zelf */ {
      width: 100% !important;
      max-width: none !important; /* Verwijder eventuele max-width */
  }

  /* Optie 2: Als er een section is (vervang door echte selector) */
  /* :host ::ng-deep section[style*="width"] { */
  /*    width: 100% !important; */
  /*    max-width: none !important; */
  /* } */

  /* Zorg dat de picker zelf ook flexibel is */
  emoji-mart {
      display: flex;
      flex-direction: column;
      border: none !important;
      height: 100%;
      width: 100%;
  }
 `]
})
export class EmojiPickerComponent {
  private overlayRef = inject<DynamicOverlayRef<void>>(DYNAMIC_OVERLAY_REF);
  private emojiSelectionService = inject(EmojiSelectionService);
  private readonly logPrefix = '[EmojiPickerComponent]';
  readonly AppIcon = AppIcon;

  constructor() { /* ... */ }

  /** Handles emoji selection, emits via service. */
  handleEmojiSelect($event: any): void {
    const nativeEmoji = $event?.emoji?.native;
    if (typeof nativeEmoji === 'string') {
      this.emojiSelectionService.selectEmoji(nativeEmoji);
  }
}

  /** Closes the overlay manually. */
  closeOverlay(): void {
      this.overlayRef.close();
  }
}
