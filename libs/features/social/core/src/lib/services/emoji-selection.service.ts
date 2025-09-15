/**
 * @fileoverview Service acting as a communication channel for emoji selections
 * between the emoji picker overlay and the component that opened it.
 * @path libs/features/social/src/lib/services/emoji-selection.service.ts
 */
import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { LoggerService } from '@royal-code/core/core-logging'; // Optioneel: voor logging

/**
 * @Injectable EmojiSelectionService
 * @description
 * Facilitates communication between the dynamically opened EmojiPickerComponent
 * and the component that needs to receive the selected emoji (e.g., CommentInputComponent),
 * without requiring the picker to close immediately after selection.
 */
@Injectable({
  providedIn: 'root' // Provided globally, or change to 'feature' or provide in a specific module/component if needed
})
export class EmojiSelectionService {
  private logger = inject(LoggerService, { optional: true }); // Maak logger optioneel
  private readonly logPrefix = '[EmojiSelectionService]';

  /** Private Subject to push selected emojis into the stream. */
  private emojiSelectedSource = new Subject<string>();

  /** Public Observable stream that components can subscribe to for receiving selected emojis. */
  emojiSelected$ = this.emojiSelectedSource.asObservable();

  /**
   * Method called by the EmojiPickerComponent when an emoji is selected.
   * Pushes the selected emoji onto the stream.
   * @param emoji - The native emoji character string that was selected.
   */
  selectEmoji(emoji: string): void {
    this.logger?.debug(`${this.logPrefix} Broadcasting selected emoji: ${emoji}`);
    this.emojiSelectedSource.next(emoji);
  }
}
