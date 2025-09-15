/**
 * @file ui-full-width-image-card.component.ts
 * @Version 9.4.0 (FIX: Tailwind JIT Gradient Bug)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description
 *   Een full-width kaartcomponent.
 *   - FIX: lost een Tailwind JIT compiler probleem op door de conditionele
 *     gradient-richting te scheiden van de statische kleur-stops (`from-`, `via-`, `to-`),
 *     waardoor de gradient nu altijd correct wordt gerenderd.
 */
import { ChangeDetectionStrategy, Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiImageComponent } from '@royal-code/ui/media';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { AppIcon, CardRounding } from '@royal-code/shared/domain';
import { SafeHtmlPipe } from '@royal-code/shared/utils';

@Component({
  selector: 'royal-code-ui-full-width-image-card',
  standalone: true,
  imports: [CommonModule, RouterModule, UiImageComponent, UiButtonComponent, TranslateModule, YouTubePlayerModule, SafeHtmlPipe],
  template: `
    <a [routerLink]="route()" [queryParams]="queryParams()"
       class="relative block group/full-card h-full w-full overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
       [ngClass]="borderRadiusClass()"
       [attr.target]="openInNewTab() ? '_blank' : null"
       [attr.rel]="openInNewTab() ? 'noopener' : null">

      <!-- Laag 1: Achtergrond -->
       @if (youtubeVideoId(); as videoId) {
        @if (videoId.length > 0) {
          <iframe
            [src]="'https://www.youtube.com/embed/' + videoId + '?autoplay=1&controls=0&showinfo=0&rel=0&loop=1&mute=1&playlist=' + videoId | safeHtml:'resourceUrl'"
            class="absolute inset-0 w-full h-full object-cover"
            width="100%"
            height="100%"
            allow="autoplay; encrypted-media"
            frameborder="0"
            title="Background Video"
            loading="lazy"
          ></iframe>
        }
      } @else {
        <royal-code-ui-image [src]="imageUrl()" [alt]="titleKey() | translate" objectFit="cover" extraClasses="absolute inset-0 w-full h-full group-hover/full-card:scale-105 transition-transform duration-300 z-0" [rounding]="'none'" />
      }

      <!-- DE FIX: Gradient met gescheiden klassen om JIT compiler te helpen -->
      <div class="absolute inset-0 z-10 from-black/80 via-black/60 to-transparent" [ngClass]="{
        'bg-gradient-to-r': textAlign() === 'left',
        'bg-gradient-to-l': textAlign() === 'right',
        'bg-gradient-to-t': textAlign() === 'center'
      }"></div>

      <!-- Laag 3: Content met variabele padding -->
      <div [ngClass]="padding()" class="absolute bottom-0 left-0 right-0 flex flex-col items-start text-left z-20 text-white">
        <h2 class="text-3xl font-bold mb-1 text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.8)]">{{ titleKey() | translate }}</h2>
        <p class="max-w-lg text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] mb-4">{{ subtitleKey() | translate }}</p>
        <ng-content></ng-content> <!-- Voor extra elementen zoals de pijl -->
        @if (buttonTextKey()) {
          <royal-code-ui-button type="primary" sizeVariant="lg" (clicked)="$event.preventDefault(); $event.stopPropagation(); navigateToRoute()">
            {{ buttonTextKey() | translate }}
          </royal-code-ui-button>
        }
      </div>
    </a>
  `,
  styles: [`
    :host { display: block; }
    .youtube-player-full-width { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none; }
    .youtube-player-full-width > div, .youtube-player-full-width > div > iframe { width: 100% !important; height: 100% !important; position: absolute; top: 0; left: 0; object-fit: cover; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiFullWidthImageCardComponent {
  readonly imageUrl = input<string | undefined>(undefined); 
  readonly youtubeVideoId = input<string | undefined>(undefined);
  readonly titleKey = input<string>('');
  readonly subtitleKey = input<string>('');
  readonly buttonTextKey = input<string | undefined>();
  readonly route = input.required<string | string[]>();
  readonly queryParams = input<{[key: string]: any} | undefined>();
  readonly textAlign = input<'left' | 'right' | 'center'>('left');
  readonly rounding: InputSignal<CardRounding> = input<CardRounding>('xs');
  readonly openInNewTab = input(false);
  readonly padding = input<string>('p-4');

  readonly AppIcon = AppIcon;

  private readonly router = inject(Router);

  readonly borderRadiusClass: Signal<string> = computed(() => {
    const roundingValue = this.rounding();
    return roundingValue && roundingValue !== 'none' ? `rounded-${roundingValue}` : 'rounded-xs';
  });

  navigateToRoute(): void {
    const targetRoute = this.route();
    if (this.openInNewTab()) {
      window.open(this.router.serializeUrl(this.router.createUrlTree(Array.isArray(targetRoute) ? targetRoute : [targetRoute], { queryParams: this.queryParams() })), '_blank');
    } else {
      this.router.navigate(Array.isArray(targetRoute) ? targetRoute : [targetRoute], { queryParams: this.queryParams() });
    }
  }
}