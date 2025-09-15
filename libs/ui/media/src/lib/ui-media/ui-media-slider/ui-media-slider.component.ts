/**
 * @file ui-media-slider.component.ts
 * @Version 2.3.0 (Definitive & Stable with Correct Syntax)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date HUIDIGE_DATUM
 * @Description A highly configurable, reusable media slider component. This definitive version
 *              corrects all template syntax errors and provides a stable, flexible API.
 */
import {
  Component, ChangeDetectionStrategy, input, computed, signal, output,
  effect, untracked, Injector, inject, InputSignal, OutputEmitterRef, Signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppIcon } from '@royal-code/shared/domain';
import { Image } from '@royal-code/shared/domain';
import { SwipeDirective } from '@royal-code/ui/gestures';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiIconComponent } from '@royal-code/ui/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ObjectFitType, UiImageComponent } from '../media/ui-image.component';

@Component({
  selector: 'royal-code-ui-media-slider',
  standalone: true,
  imports: [ CommonModule, TranslateModule, SwipeDirective, UiButtonComponent, UiIconComponent, UiImageComponent ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative w-full h-full bg-muted overflow-hidden group/slider"
      [style.aspect-ratio]="aspectRatio()"
      libRoyalCodeSwipeable
      (swipeleft)="onSwipe('left')"
      (swiperight)="onSwipe('right')"
      [swipeThreshold]="60"
      (keydown.arrowleft)="handleKeydown($event)"
      (keydown.arrowright)="handleKeydown($event)"
      (click)="handleClick()"
      tabindex="0"
      role="region"
      [attr.aria-roledescription]="'carousel'"
      [attr.aria-label]="('products.imageGallery' | translate)">

      @if (currentImageSignal(); as imgObject) {
        <div class="w-full h-full pointer-events-none">
          <royal-code-ui-image
              class="absolute inset-0 w-full h-full transition-transform duration-300 ease-out group-hover/slider:scale-[1.03]"
              [image]="imgObject"
              [alt]="(imgObject.altText || ('products.genericImageAlt' | translate))"
              [objectFit]="objectFit()"
              [lazyLoad]="lazyLoad()"
              [lazyLoadMargin]="'400px'" />
        </div>
      } @else {
        <div class="absolute inset-0 flex items-center justify-center bg-muted/50 text-secondary pointer-events-none">
          <royal-code-ui-icon [icon]="AppIcon.ImageOff" sizeVariant="xl" />
        </div>
      }

      @if (totalImagesSignal() > 1) {
        <royal-code-ui-button
          type="default"
          sizeVariant="icon"
          [isRound]="true"
          (clicked)="previousImage(); $event.stopPropagation()"
          [extraClasses]="'absolute left-2 top-1/2 -translate-y-1/2 z-10 transition-opacity duration-200 bg-background/60 hover:bg-background/90 text-foreground focus:ring-offset-0 ' + (showArrowsOnHover() ? 'opacity-0 group-hover/slider:opacity-100 focus-visible:opacity-100' : '')"
          [attr.aria-label]="('products.previousImage' | translate)">
          <royal-code-ui-icon [icon]="AppIcon.ChevronLeft" sizeVariant="md" />
        </royal-code-ui-button>

        <royal-code-ui-button
          type="default"
          sizeVariant="icon"
          [isRound]="true"
          (click)="nextImage(); $event.stopPropagation()"
          [extraClasses]="'absolute right-2 top-1/2 -translate-y-1/2 z-10 transition-opacity duration-200 bg-background/60 hover:bg-background/90 text-foreground focus:ring-offset-0 ' + (showArrowsOnHover() ? 'opacity-0 group-hover/slider:opacity-100 focus-visible:opacity-100' : '')"
          [attr.aria-label]="('products.nextImage' | translate)">
          <royal-code-ui-icon [icon]="AppIcon.ChevronRight" sizeVariant="md" />
        </royal-code-ui-button>

        @if(showDots()) {
          <div
            class="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10"
            role="tablist"
            [attr.aria-label]="('products.carouselControls' | translate)">
            @for (_ of paginationDotsSignal(); track $index; let i = $index) {
              <royal-code-ui-button
                [type]="isActiveDot(i) ? 'primary' : 'default'"
                sizeVariant="none"
                (click)="selectImage(i); $event.stopPropagation()"
                [extraClasses]="
                  (isActiveDot(i)
                    ? 'w-6 h-2 sm:w-8 sm:h-2.5 rounded-sm'
                    : 'w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/50 hover:bg-white/80 border-transparent'
                  ) + ' p-0 leading-none focus:ring-offset-0 focus:ring-white/70 transition-all duration-200 ease-out align-middle'
                "
                [attr.aria-label]="('products.viewImageAria' | translate:{ current: i + 1, total: totalImagesSignal() })"
                [attr.aria-selected]="isActiveDot(i)"
                role="tab">
              </royal-code-ui-button> <!-- DE FIX: De knop is nu correct gesloten -->
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`:host { display: block; width: 100%; height: 100%; outline: none; }`],
})
export class UiMediaSliderComponent {
  readonly images: InputSignal<Image[]> = input.required<Image[]>();
  readonly activeIndex: InputSignal<number> = input(0);
  readonly loop: InputSignal<boolean> = input(false);
  readonly openInLightboxOnClick: InputSignal<boolean> = input(true);
  readonly showArrowsOnHover: InputSignal<boolean> = input(false);
  readonly showDots: InputSignal<boolean> = input(true);
  readonly lazyLoad: InputSignal<boolean> = input(true);
  readonly totalImageCount: InputSignal<number | undefined> = input<number | undefined>();
  readonly objectFit: InputSignal<ObjectFitType> = input<ObjectFitType>('cover');
  readonly aspectRatio: InputSignal<string | null> = input<string | null>(null);

  readonly imageClicked: OutputEmitterRef<Image> = output<Image>();
  readonly slideChanged: OutputEmitterRef<number> = output<number>();

  protected readonly currentImageIndexSignal = signal(0);
  protected readonly AppIcon = AppIcon;
  private justSwiped = false;
  
  constructor() {
    const injector = inject(Injector);
    effect(() => {
      const externalIndex = this.activeIndex();
      untracked(() => {
        if (this.currentImageIndexSignal() !== externalIndex && externalIndex >= 0 && externalIndex < this.totalImagesSignal()) {
          this.currentImageIndexSignal.set(externalIndex);
        }
      });
    }, { injector });
    effect(() => {
      this.images();
      untracked(() => {
        if (this.currentImageIndexSignal() !== 0) {
          this.currentImageIndexSignal.set(0);
          this.slideChanged.emit(0);
        }
      });
    }, { injector });
  }

  protected readonly totalImagesSignal: Signal<number> = computed(() => this.totalImageCount() ?? this.images()?.length ?? 0);
  protected readonly paginationDotsSignal: Signal<unknown[]> = computed(() => Array.from({ length: this.totalImagesSignal() }));
  protected readonly currentImageSignal: Signal<Image | undefined> = computed(() => {
    const imagesToUse = this.images();
    if (!imagesToUse?.length) return undefined;
    const index = this.currentImageIndexSignal();
    return imagesToUse[Math.max(0, Math.min(index, imagesToUse.length - 1))];
  });

  protected onSwipe(direction: 'left' | 'right'): void {
    this.justSwiped = true;
    if (direction === 'left') this.nextImage(); else this.previousImage();
  }

  protected handleClick(): void {
    if (this.justSwiped) { this.justSwiped = false; return; }
    const currentImage = this.currentImageSignal();
    if (this.openInLightboxOnClick() && currentImage) { this.imageClicked.emit(currentImage); }
  }

  protected handleKeydown(event: Event): void {
    if (!(event instanceof KeyboardEvent)) return;
    if (this.totalImagesSignal() <= 1) return;
    if (event.key === 'ArrowLeft') { this.previousImage(); event.preventDefault(); }
    else if (event.key === 'ArrowRight') { this.nextImage(); event.preventDefault(); }
  }

  selectImage(index: number): void {
    const total = this.totalImagesSignal();
    if (total === 0) return;
    const newIndex = this.loop() ? (index + total) % total : Math.max(0, Math.min(index, total - 1));
    if (this.currentImageIndexSignal() !== newIndex) {
      this.currentImageIndexSignal.set(newIndex);
      this.slideChanged.emit(newIndex);
    }
  }

  previousImage(): void { this.selectImage(this.currentImageIndexSignal() - 1); }
  nextImage(): void { this.selectImage(this.currentImageIndexSignal() + 1); }
  protected isActiveDot(index: number): boolean { return this.currentImageIndexSignal() === index; }
}