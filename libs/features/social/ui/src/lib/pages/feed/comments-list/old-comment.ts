import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';
import { FeedReply, ReactionType, Profile } from '@royal-code/shared/domain'; // Voeg Profile toe
import { FeedFacade } from '../../../state/feed/feed.facade';
import { UiButtonComponent, UiDropdownComponent, UiIconComponent, UiImageComponent } from '@royal-code/ui';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-comments-list',
  standalone: true,
  imports: [CommonModule, UiButtonComponent, UiIconComponent, UiImageComponent, FormsModule, UiDropdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if(replies().length > 0) {
      <div>
        @for (reply of replies(); track reply.id) {
          <div *ngIf="editingReplyId() !== reply.id; else editModeTemplate">
            <div class="flex items-start space-x-3 p-3 w-full group"> <div class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <royal-code-ui-image
                  [src]="reply.author?.avatar || 'https://via.placeholder.com/40'"
                  [alt]="(reply.author?.displayName ?? 'User') + ' avatar'"
                  class="w-full h-full object-cover"
                ></royal-code-ui-image>
              </div>
              <div class="flex-1 flex flex-col space-y-1 bg-card-primary rounded-xs p-2 group-hover:bg-card-secondary transition-colors duration-150">
                 <div class="flex items-center space-x-1">
                  <span class="text-sm font-semibold text-text hover:underline cursor-pointer">{{ reply.author?.displayName ?? 'Unknown User' }}</span>
                  <span class="text-xs text-secondary">
                    • {{ reply.createdAt.formatted || (reply.createdAt.iso | date:'shortTime') }} </span>
                   @if(reply.isEdited) {
                     <span class="text-xs text-secondary">(edited)</span>
                   }
                </div>
                 <p class="text-sm leading-snug text-text">{{ reply.text }}</p>
                 <div class="flex items-center space-x-3 text-xs mt-1">
                   <royal-code-ui-button type="transparent" sizeVariant="xs" textColor="secondary" (clicked)="likeReply(reply)">Like</royal-code-ui-button>
                  <royal-code-ui-button type="transparent" sizeVariant="xs" textColor="secondary" (clicked)="replyToReply(reply)">Reply</royal-code-ui-button>
                   @if(canEditOrDelete(reply)) {
                     <royal-code-ui-button type="transparent" sizeVariant="xs" textColor="secondary" (clicked)="startEdit(reply)">Edit</royal-code-ui-button>
                   }
                   <div class="relative ml-auto">
                       <royal-code-ui-dropdown alignment="right" [offsetY]="2">
                            <button dropdown-trigger class="text-secondary p-1 rounded -m-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity" aria-label="More options">
                                <royal-code-ui-icon
                                [icon]="{ iconLabel: 'More options', iconPath: 'elements', iconFileName: 'more-horizontal.svg' }"
                                [showBackground]="false"
                                sizeVariant="sm"
                                >
                                </royal-code-ui-icon>
                            </button>
                            <div dropdown> <div class="shadow-lg rounded-md py-1 w-32 bg-background border border-[var(--color-border)]">
                                     @if(canEditOrDelete(reply)) {
                                        <royal-code-ui-button type="transparent" text-left text-error" (clicked)="deleteReply(reply)">
                                            Delete
                                        </royal-code-ui-button>
                                     }
                                    <royal-code-ui-button type="transparent" text-left" (clicked)="reportReply(reply)">
                                        Report
                                    </royal-code-ui-button>
                                     </div>
                            </div>
                       </royal-code-ui-dropdown>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <ng-template #editModeTemplate>
          <div class="flex items-start space-x-3 p-3 w-full bg-background text-text">
            <!-- Avatar -->
            <div class="w-10 h-10 rounded-full overflow-hidden">
              <royal-code-ui-image
                [src]="reply.author.avatar || 'https://via.placeholder.com/40'"
                alt="Avatar"
                class="w-full h-full object-cover"
              ></royal-code-ui-image>
            </div>
            <!-- Edit Section -->
            <div class="flex flex-col flex-1 max-w-[80%] space-y-2">
              <!-- Textarea container -->
              <div class="relative bg-card-primary rounded-xs p-2 border border-[var(--color-border)]">
                <textarea
                  class="w-full h-20 text-sm p-2 rounded-md bg-background text-text placeholder:text-secondary resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Schrijf een reactie..."
                  maxlength="500"
                  [(ngModel)]="editingText"
                >{{ editingText() }}</textarea>
                <!-- Inline tools footer -->
                <footer class="flex items-center justify-between mt-2">
                  <!-- Linkerkant: Emoji, GIF, Foto -->
                  <div class="flex items-center space-x-1">
                    <royal-code-ui-button type="transparent" sizeVariant="sm" (clicked)="emojiClicked(reply)">
                      <royal-code-ui-icon
                        [icon]="{ iconLabel: 'emoji', iconPath: '', iconFileName: 'emoji.svg' }"
                        iconSize="w-6 h-6"
                        iconColor="text-secondary"
                        [showBackground]="false"
                      ></royal-code-ui-icon>
                    </royal-code-ui-button>
                    <royal-code-ui-button type="transparent" sizeVariant="sm" (clicked)="gifClicked(reply)">
                      <royal-code-ui-icon
                        [icon]="{ iconLabel: 'gif', iconPath: '', iconFileName: 'gif.svg' }"
                        iconSize="w-6 h-6"
                        [showBackground]="false"
                      ></royal-code-ui-icon>
                    </royal-code-ui-button>
                    <royal-code-ui-button type="transparent" sizeVariant="sm" (clicked)="photoClicked(reply)">
                      <royal-code-ui-icon
                        [icon]="{ iconLabel: 'camera', iconPath: '', iconFileName: 'camera.svg' }"
                        iconSize="w-4 h-4"
                        [showBackground]="false"
                      ></royal-code-ui-icon>
                    </royal-code-ui-button>
                  </div>
                  <!-- Rechterkant: Character counter & Submit button -->
                  <div class="flex items-center space-x-1">
                    <span class="text-xs text-secondary">{{ editingText()?.length || 0 }}/500</span>
                    <royal-code-ui-button type="transparent" sizeVariant="sm" (clicked)="submitEdit(reply)">
                      <royal-code-ui-icon
                        [icon]="{ iconLabel: 'arrow-right', iconPath: '', iconFileName: 'arrow-right.svg' }"
                        iconSize="w-6 h-6"
                        iconColor="text-white"
                        [showBackground]="false"
                      ></royal-code-ui-icon>
                    </royal-code-ui-button>
                  </div>
                </footer>
              </div>
              <!-- Cancel footer (zonder justify-between) -->
              <div class="flex items-center space-x-2">
                <royal-code-ui-button type="transparent" sizeVariant="sm" (clicked)="cancelEdit(reply)">
                  Cancel
                </royal-code-ui-button>
                <span class="text-xs text-gray-500">Press Esc to cancel</span>
              </div>
            </div>
          </div>
        </ng-template>
        }
      </div>
    } @else {
      <p class="p-3 text-sm text-secondary">Nog geen reacties.</p>
    }
  `
})
export class CommentsListComponent {
  feedId = input.required<string>();
  replies = input.required<FeedReply[]>();

  // Injecteer facade en eventueel een service voor huidige gebruiker
  private feedFacade = inject(FeedFacade);
  // private authService = inject(AuthService); // Voorbeeld voor canEditOrDelete

  // Lokale state voor editmodus
  editingReplyId = signal<string | null>(null);
  editingText = signal<string>(''); // Signal om de tekst bij te houden

  // --- CRUD Acties ---

  likeReply(reply: FeedReply): void {
    // FIX: Gebruik de correcte facade-methode
    this.feedFacade.likeFeedItemReply(this.feedId(), reply.id, ReactionType.Like); // Aanname: Like is default
  }

  deleteReply(reply: FeedReply): void {
    // Vraag eventueel om bevestiging
    if (confirm(`Weet je zeker dat je de reactie "${reply.text.substring(0, 20)}..." wilt verwijderen?`)) {
      this.feedFacade.deleteFeedReply(this.feedId(), reply.id);
    }
  }

  replyToReply(reply: FeedReply): void {
    // Nog te implementeren: open bv. een input specifiek voor deze sub-reply
    console.log('Reply to reply:', reply.id);
    // Je zou hier een event kunnen emitten naar de parent component
  }

  reportReply(reply: FeedReply): void {
    console.log('Reporting reply:', reply.id);
    // Implementeer report logica (bv. open modal, stuur data naar backend)
  }

  // --- Edit Logica ---

  startEdit(reply: FeedReply): void {
    // Alleen toestaan als gebruiker mag editen
    if (!this.canEditOrDelete(reply)) return;

    this.editingReplyId.set(reply.id);
    this.editingText.set(reply.text);
    // TODO: Focus op de textarea (kan met @ViewChild of een directive)
  }

  submitEdit(reply: FeedReply): void {
    const newText = this.editingText().trim();
    if (!newText || newText === reply.text) {
      // Annuleer als tekst leeg is of ongewijzigd
      this.cancelEdit(reply);
      return;
    }
    console.log(`Submitting edit for reply ${reply.id} in feed ${this.feedId()}`); // Debug log
    this.feedFacade.editFeedReply(this.feedId(), reply.id, { text: newText, isEdited: true });
    this.editingReplyId.set(null);
    this.editingText.set('');
  }

  cancelEdit(reply: FeedReply): void {
    this.editingReplyId.set(null);
    this.editingText.set('');
  }

  // --- Keyboard Handlers voor Edit ---

  handleEnterKey(event: Event, reply: FeedReply): void {
    // Doe een type assertion binnen de methode
    const keyboardEvent = event as KeyboardEvent;
    // Controleer nu op shiftKey
    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault(); // Voorkom default Enter (nieuwe regel)
      this.submitEdit(reply);
    }
  }
  // Escape key wordt direct afgehandeld in de template met (keydown.escape)="cancelEdit(reply)"

  // --- Hulpfuncties ---

  /**
   * Bepaalt of de huidige gebruiker deze reply mag bewerken of verwijderen.
   * Placeholder - implementeer je eigen logica!
   */
  canEditOrDelete(reply: FeedReply): boolean {
    // Voorbeeld: check of reply.author.id overeenkomt met ingelogde gebruiker
    // const currentUserId = this.authService.getCurrentUserId(); // Haal ID op
    // return reply.author?.id === currentUserId;
    return true; // Tijdelijk: iedereen mag alles bewerken/verwijderen
  }

  // --- Placeholder acties (indien nodig) ---
  emojiClicked(reply: FeedReply): void { console.log('Emoji clicked on reply', reply.id); }
  gifClicked(reply: FeedReply): void { console.log('GIF clicked on reply', reply.id); }
  photoClicked(reply: FeedReply): void { console.log('Photo clicked on reply', reply.id); }
}
