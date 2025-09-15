// --- VERVANG VOLLEDIG BESTAND ---
/**
 * @file story-card.component.ts
 * @Version 2.0.0 (FIXED: Uses Centralized CoreDescriptionBlock)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   Story card component die nu de gecentraliseerde CoreDescriptionBlock
 *   interface importeert om typefouten op te lossen.
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { YouTubePlayerModule } from '@angular/youtube-player';

// UI Imports
import { UiImageComponent } from '@royal-code/ui/media';
import { UiTitleComponent } from '@royal-code/ui/title';
import { StoryCardData, TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiButtonComponent } from '@royal-code/ui/button';
import { SafeHtmlPipe } from '@royal-code/shared/utils';

@Component({
  selector: 'royal-code-ui-story-card',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule, YouTubePlayerModule,
    UiImageComponent, UiTitleComponent, UiParagraphComponent, UiButtonComponent, SafeHtmlPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (data(); as s) {
      <div class="relative rounded-lg overflow-hidden shadow-lg border border-border bg-surface-alt">
        <div class="grid grid-cols-1 md:grid-cols-2" [ngClass]="{ 'md:grid-flow-col': s.textAlign === 'left' }">
          <!-- Media Kolom (Image of YouTube Video) -->
          <div class="relative min-h-[250px] md:min-h-[400px] flex items-center justify-center bg-muted"
               [ngClass]="{ 'md:order-2': s.textAlign === 'right' }">
            @if (s.youtubeVideoId; as videoId) {
              @if (videoId.length > 0) {
                <iframe
                  class="absolute inset-0 w-full h-full object-cover"
                  [src]="'https://www.youtube.com/embed/' + videoId + '?controls=0&showinfo=0&rel=0&autoplay=0&mute=1' | safeHtml:'resourceUrl'"
                  frameborder="0"
                  allow="autoplay; encrypted-media"
                  allowfullscreen
                  title="Story Section Video"
                ></iframe>
              }
            } @else if (s.imageUrl) {
              <royal-code-ui-image [src]="s.imageUrl" [alt]="s.titleKey | translate" objectFit="cover" class="w-full h-full"/>
            }
          </div>

          <!-- Content Kolom -->
          <div class="p-8 lg:p-12 flex flex-col justify-center" [ngClass]="{ 'text-right': s.textAlign === 'right', 'text-left': s.textAlign === 'left' }">
            <royal-code-ui-title
              [level]="TitleTypeEnum.H3"
              [text]="s.titleKey | translate"
              extraClasses="!text-2xl !font-bold !mb-4"
            />
            <royal-code-ui-paragraph
              [text]="s.subtitleKey | translate"
              size="md"
              color="foreground"
              extraClasses="leading-relaxed mb-6"
            />

            <!-- Gedetailleerde Content Blokken -->
            @if (s.detailedContentBlocks && s.detailedContentBlocks.length > 0) {
              <div class="mt-4 space-y-3">
                @for (block of s.detailedContentBlocks; track $index) {
                  @switch (block.type) {
                    @case ('bullet-list') {
                      @if (block.bulletPoints && block.bulletPoints.length > 0) {
                        <ul class="list-disc list-inside text-sm text-foreground space-y-1"
                            [ngClass]="{'list-disc-right': s.textAlign === 'right'}">
                          @for (point of block.bulletPoints; track $index) {
                            <li>{{ point }}</li>
                          }
                        </ul>
                      }
                    }
                    @case ('media-embed') {
                      @if (block.youtubeVideoId) {
                        <div class="aspect-video w-full rounded-md overflow-hidden bg-muted">
                          <iframe
                            [src]="'https://www.youtube.com/embed/' + block.youtubeVideoId + '?controls=0&showinfo=0&rel=0&autoplay=0&mute=1' | safeHtml:'resourceUrl'"
                            frameborder="0"
                            allow="autoplay; encrypted-media"
                            allowfullscreen
                            class="w-full h-full"
                            title="Media Embed Video">
                          </iframe>
                        </div>
                      }
                    }
                    @default {
                      <!-- Handle other block types here if necessary -->
                    }
                  }
                }
              </div>
            }

            <!-- Optionele CTA knop -->
            @if (s.ctaTextKey && s.relatedProductRoute) {
              <div [ngClass]="{ 'text-right': s.textAlign === 'right', 'text-left': s.textAlign === 'left' }" class="mt-6">
                <royal-code-ui-button [type]="'outline'" [routerLink]="s.relatedProductRoute">
                  {{ s.ctaTextKey | translate }}
                </royal-code-ui-button>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .list-disc-right {
      text-align: right;
      list-style-position: inside;
      padding-right: 1.5em;
    }
  `]
})
export class UiStoryCardComponent {
  data = input.required<StoryCardData>();
  protected readonly TitleTypeEnum = TitleTypeEnum;
}