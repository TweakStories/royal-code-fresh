/**
 * @fileoverview Displays a single chat message with appropriate styling.
 * @version 4.1.0 (Definitive & Robust)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-30
 * @Description
 *   The definitive, clean implementation. This component is fully agnostic of
 *   session types and relies on a simple, robust comparison between the message's `senderId`
 *   and the `currentUserId` input to determine message alignment and styling.
 */
import { Component, ChangeDetectionStrategy, InputSignal, computed, input, Signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AppIcon } from '@royal-code/shared/domain';
import { DateTimeInfo } from '@royal-code/shared/base-models';
import { UiIconComponent } from '@royal-code/ui/icon';
import { UiProfileImageComponent } from '@royal-code/ui/media';
import { Message, MessageStatus } from '@royal-code/features/chat/domain';

@Component({
  selector: 'lib-chat-message-item',
  standalone: true,
  imports: [ CommonModule, DatePipe, UiIconComponent, UiProfileImageComponent, TranslateModule ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (message(); as msg) {
      <div class="chat-message-item flex mb-2" [ngClass]="{ 'justify-end': isCurrentUserSender(), 'justify-start': !isCurrentUserSender() }">
        
        <!-- Avatar for incoming messages -->
        @if (!isCurrentUserSender()) {
          <div class="flex-shrink-0 mr-2 self-end" aria-hidden="true">
             <royal-code-ui-profile-image [source]="msg.senderProfile?.avatar" [displayName]="msg.senderProfile?.displayName || 'AI'" size="sm" />
          </div>
        }

        <!-- Message Bubble -->
         <div class="message-bubble max-w-[75%] p-3 sm:p-4 rounded-xl shadow-sm" 
              [ngClass]="{ 
                'bg-primary text-primary-on rounded-br-none': isCurrentUserSender(), 
                'bg-surface-alt border border-border text-foreground rounded-bl-none': !isCurrentUserSender() 
              }">
          
          <!-- Content -->
          @if (msg.content && msg.content.trim() !== '') {
            <p class="text-sm whitespace-pre-wrap break-words leading-relaxed" [ngClass]="{ 'text-primary-on': isCurrentUserSender(), 'text-foreground': !isCurrentUserSender() }">
              {{ msg.content }}
            </p>
          }

          <!-- Timestamp & Status -->
          <div class="flex items-center mt-1.5 text-xs" [ngClass]="{ 'text-primary-on/70 justify-end': isCurrentUserSender(), 'text-secondary justify-start': !isCurrentUserSender() }">
            <span>{{ (isDateTimeInfo(msg.createdAt) ? msg.createdAt.iso : msg.createdAt) | date:'shortTime' }}</span>
            @if (isCurrentUserSender() && msg.status && msg.status !== 'sent') {
              <royal-code-ui-icon [icon]="getStatusIcon(msg.status)" sizeVariant="xs" extraClass="ml-1.5" [title]="msg.status === 'failed' && msg.error ? msg.error.message : ''"></royal-code-ui-icon>
            }
          </div>
        </div>

      </div>
    }
  `
})
export class ChatMessageItemComponent {
  readonly message: InputSignal<Message> = input.required<Message>();
  readonly currentUserId: InputSignal<string | null | undefined> = input<string | null>();

  readonly isCurrentUserSender: Signal<boolean> = computed(() => {
    const msg = this.message();
    const cUserId = this.currentUserId();
    return !!msg?.senderId && !!cUserId && msg.senderId === cUserId;
  });

  isDateTimeInfo(value: any): value is DateTimeInfo {
    return typeof value === 'object' && value !== null && 'iso' in value;
  }

  getStatusIcon(status: Message['status']): AppIcon {
    switch (status) {
      case MessageStatus.SENDING: return AppIcon.Clock;
      case MessageStatus.SENT: return AppIcon.Check;
      case MessageStatus.FAILED: return AppIcon.AlertCircle;
      default: return AppIcon.CircleDot;
    }
  }
}