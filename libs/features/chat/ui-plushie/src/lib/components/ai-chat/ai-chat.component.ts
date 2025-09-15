/**
 * @fileoverview Component for displaying an AI chat interface.
 * @version 8.1.0 (Definitive Angular v20+ Signal Refactor & SSR Safe - Complete Guards)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   The definitive, architecturally correct implementation of the AI chat component.
 *   This version is fully refactored to Angular v20+ signal syntax and is now
 *   robustly SSR-safe by conditionally executing ALL browser-specific APIs (`window`,
 *   `requestAnimationFrame`, `MutationObserver`) only on the client. It ensures
 *   perfect synchronization with the backend's data by deriving `currentUserId`
 *   from authenticated user or anonymous guest ID.
 */
import {
  Component, ChangeDetectionStrategy, inject, OnInit, Signal, computed,
  ElementRef, ViewChild, AfterViewInit, effect, input, booleanAttribute,
  PLATFORM_ID, OnDestroy, // <<< OnDestroy toegevoegd voor opruimen
  AfterViewChecked
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { take } from 'rxjs';

import { ChatInputComponent, ChatMessageSubmitData } from '../chat-input/chat-input.component';
import { ChatMessageItemComponent } from '../chat-message-item/chat-message-item.component';
import { AuthFacade } from '@royal-code/store/auth';
import { UiIconComponent } from '@royal-code/ui/icon';
import { ChatFacade } from '@royal-code/features/chat/core';
import { AppIcon } from '@royal-code/shared/domain';
import { Message, MessageStatus } from '@royal-code/features/chat/domain';

@Component({
  selector: 'royal-code-ai-chat',
  standalone: true,
  imports: [ CommonModule, TranslateModule, ChatInputComponent, ChatMessageItemComponent, UiIconComponent ],
  host: { '[class.auto-grow]': 'autoGrow()', },
  template: `
    <div class="ai-chat-interface flex flex-col h-full bg-card border border-border shadow-md overflow-hidden">
      <header class="flex-shrink-0 h-12 px-3 flex items-center border-b border-border bg-card-secondary ">
        <royal-code-ui-icon [icon]="AppIcon.Sparkles" sizeVariant="md" colorClass="text-primary mr-2"></royal-code-ui-icon>
        <h3 class="text-md font-semibold text-foreground truncate">{{ aiConversationName() | translate }}</h3>
      </header>

      <div class="message-area p-3 space-y-2 sm:space-y-3" #messageArea>
        @for (message of messages(); track message.id) {
          <lib-chat-message-item
            [message]="message"
            [currentUserId]="currentUserId()"
          />
        }
      </div>

      <footer class="flex-shrink-0 border-t border-border">
        <lib-chat-input (submitted)="handleSendMessage($event)" [isSending]="isActuallySendingMessage()" [placeholder]="inputPlaceholder()" />
      </footer>
    </div>
  `,
  styles: [`:host { display: flex; flex-direction: column; height: 500px; min-height: 300px; } :host(.auto-grow) { height: 100%; } .message-area { flex-grow: 1; overflow-y: auto; min-height: 0; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiChatComponent implements OnInit, AfterViewInit, OnDestroy, AfterViewChecked  { // <<< OnDestroy toegevoegd
  readonly autoGrow = input(false, { transform: booleanAttribute });

  private readonly chatFacade = inject(ChatFacade);
  private readonly authFacade = inject(AuthFacade);
  private readonly platformId = inject(PLATFORM_ID);

  @ViewChild('messageArea') private messageAreaRef?: ElementRef<HTMLDivElement>;
  private messageListScrollableElement?: HTMLDivElement;
  private observer?: MutationObserver;
  private shouldScrollToBottom = false;

  readonly AppIcon = AppIcon;
  readonly messages = this.chatFacade.aiConversationMessages;
  readonly isLoadingMessages = this.chatFacade.isAiChatLoading;
  
  readonly currentUserId: Signal<string | null> = computed(() => {
    return this.authFacade.currentUser()?.id ?? this.chatFacade.anonymousGuestId() ?? 'anonymous-user';
  });

  readonly isActuallySendingMessage = computed(() => {
    const uId = this.currentUserId();
    return this.messages().some(m => m.status === MessageStatus.SENDING && m.senderId === uId);
  });

  readonly aiConversationName = computed(() => this.chatFacade.aiConversation()?.name || 'chat.aiCoachDefaultName');
  readonly inputPlaceholder = computed(() => 'chat.input.typeYourQuestion');

  constructor() {
    effect(() => {
      this.messages(); 
      this.shouldScrollToBottom = true; // <<< Vlag zetten, niet direct scrollen
    });
  }


  ngOnInit(): void {
    if (this.authFacade.isAuthenticated()) {
      this.chatFacade.ensureAiConversationIsActiveAndLoaded().pipe(take(1)).subscribe();
    }
  }

  ngAfterViewInit(): void {
    // DE FIX: Conditioneer browser-specifieke API's
    if (isPlatformBrowser(this.platformId)) {
      this.messageListScrollableElement = this.messageAreaRef?.nativeElement;
      this.scrollToBottom();

      if (this.messageListScrollableElement) {
        // Observer om automatisch naar beneden te scrollen bij nieuwe berichten
        this.observer = new MutationObserver(() => {
          this.scrollToBottom();
        });
        this.observer.observe(this.messageListScrollableElement, { childList: true, subtree: true });
      }
    } else {
      // Loggen dat de initiële scroll en observer worden overgeslagen tijdens SSR.
      console.debug('[AiChatComponent] Skipping scrollToBottom and MutationObserver setup on server (SSR).');
    }
  }

    ngAfterViewChecked(): void {
    // DE FIX: Scroll pas als de vlag is gezet EN in de browser-omgeving.
    if (this.shouldScrollToBottom && isPlatformBrowser(this.platformId)) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false; // Reset de vlag
    }
  }


  ngOnDestroy(): void {
    // DE FIX: Conditioneer opruimen van MutationObserver
    if (isPlatformBrowser(this.platformId) && this.observer) {
      this.observer.disconnect();
    }
  }

  handleSendMessage(data: ChatMessageSubmitData): void {
    if (this.isActuallySendingMessage() || !data.text.trim()) return;

    const payloadForFacade = {
        content: data.text,
        media: data.files,
        gifUrl: data.gifUrl ?? undefined,
        aiPersonaId: '3f2e1a0b-c8d7-4e6f-9a1b-0c2d3e4f5a6b' // Hardcoded AI Persona ID.
    };
    this.chatFacade.sendMessageToAiBot(payloadForFacade);
  }

  private scrollToBottom(): void {
    // DE FIX: Conditioneer browser-specifieke API's
    if (isPlatformBrowser(this.platformId)) {
      if (this.messageAreaRef?.nativeElement) {
        requestAnimationFrame(() => {
          const element = this.messageAreaRef!.nativeElement;
          element.scrollTop = element.scrollHeight;
        });
      }
    }
  }
}