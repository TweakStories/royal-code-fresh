/**
 * @file content-block-dispatcher.component.ts
 * @Version 1.7.0 (Readonly Array Fix for UiListComponent)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description
 *   Renders various content blocks for a guide. This version fixes the TS4104
 *   error by converting the readonly 'items' array from the 'checklist' block
 *   into a mutable copy before passing it to UiListComponent.
 */
import { ChangeDetectionStrategy, Component, input, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContentBlock } from '@royal-code/features/guides/domain';
import { Product } from '@royal-code/features/products/domain';
import { Dictionary } from '@ngrx/entity';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiParagraphComponent } from '@royal-code/ui/paragraph';
import { UiImageComponent } from '@royal-code/ui/media';
import { UiCardComponent } from '@royal-code/ui/cards/card';
import { AppIcon, Image, Media, MediaType } from '@royal-code/shared/domain';
import { UiIconComponent } from '@royal-code/ui/icon';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { CodeBlockComponent } from '@royal-code/ui/code-block';
import { UiListComponent } from '@royal-code/ui/list';

@Component({
  selector: 'droneshop-content-block-dispatcher',
  standalone: true,
  imports: [
    CommonModule, RouterModule, UiTitleComponent, UiParagraphComponent, UiImageComponent,
    UiCardComponent, UiIconComponent, YouTubePlayerModule, CodeBlockComponent, UiListComponent,
  ],
  template: `
    @if (block(); as b) {
      <div class="content-block my-4">
        @switch (b.type) {
          @case ('heading') {
            <royal-code-ui-title
              [level]="b.level === 2 ? TitleTypeEnum.H2 : TitleTypeEnum.H3"
              [text]="b.text"
              [blockStyle]="true"
              [blockStyleType]="'secondary'"
            />
          }
          @case ('paragraph') { <royal-code-ui-paragraph [innerHTML]="b.content" /> }
          @case ('image') {
            <figure class="my-6">
              @defer (on viewport) {
                <royal-code-ui-image [image]="b.image" [alt]="b.image.altText" rounding="lg" />
              } @placeholder { <div class="aspect-video w-full bg-surface-alt rounded-lg animate-pulse"></div> }
              @if(b.caption) { <figcaption class="text-center text-sm text-secondary italic mt-2">{{ b.caption }}</figcaption> }
            </figure>
          }
          @case ('youtube') {
             @defer (on interaction) {
                <div class="aspect-video w-full bg-black rounded-lg overflow-hidden">
                    <youtube-player [videoId]="b.videoId" width="100%" height="100%" />
                </div>
            } @placeholder {
                <div class="aspect-video w-full bg-surface-alt rounded-lg flex flex-col items-center justify-center text-secondary border border-dashed cursor-pointer hover:border-primary">
                    <royal-code-ui-icon [icon]="AppIcon.PlayCircle" sizeVariant="xl" extraClass="mb-2 text-primary" />
                    <p class="font-semibold">{{b.title}}</p>
                </div>
            }
          }
          @case ('callout') {
            <royal-code-ui-card [extraContentClasses]="'!p-4 flex gap-4 items-start ' + calloutBorderClass(b.style)">
                <royal-code-ui-icon [icon]="calloutIcon(b.style)" sizeVariant="lg" [extraClass]="calloutColor(b.style)" />
                <royal-code-ui-paragraph [innerHTML]="b.content" color="muted" />
            </royal-code-ui-card>
          }
          @case ('partsList') {
            <div class="my-6">
              <royal-code-ui-title [level]="TitleTypeEnum.H3" text="Benodigde Onderdelen" [blockStyle]="true" [blockStyleType]="'secondary'" />
              @if (b.introText) { <royal-code-ui-paragraph color="muted" size="sm" [text]="b.introText" extraClasses="mt-2" /> }
              <div class="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                @for(product of randomParts(); track product.id) {
                  <a [routerLink]="['/products', product.id]" target="_blank" class="block group">
                    <royal-code-ui-card extraContentClasses="!p-2 text-center">
                      <royal-code-ui-image [image]="getFirstImage(product.media)" [alt]="product.name" aspectRatio="1" objectFit="contain" rounding="md" />
                      <p class="mt-2 text-xs font-medium truncate group-hover:text-primary">{{ product.name }}</p>
                    </royal-code-ui-card>
                  </a>
                }
                @empty { <royal-code-ui-paragraph color="muted" size="sm">Geen producten gevonden voor onderdelen.</royal-code-ui-paragraph> }
              </div>
            </div>
          }
          @case ('toolsList') {
            <div class="my-6">
              <royal-code-ui-title [level]="TitleTypeEnum.H3" text="Benodigd Gereedschap" [blockStyle]="true" [blockStyleType]="'secondary'" />
              @if (b.introText) { <royal-code-ui-paragraph color="muted" size="sm" [text]="b.introText" extraClasses="mt-2" /> }
              <div class="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                 @for(product of randomTools(); track product.id) {
                    <a [routerLink]="['/products', product.id]" target="_blank" class="block group">
                      <royal-code-ui-card extraContentClasses="!p-2 text-center">
                        <royal-code-ui-image [image]="getFirstImage(product.media)" [alt]="product.name" aspectRatio="1" objectFit="contain" rounding="md" />
                        <p class="mt-2 text-xs font-medium truncate group-hover:text-primary">{{ product.name }}</p>
                      </royal-code-ui-card>
                    </a>
                  }
                  @empty { <royal-code-ui-paragraph color="muted" size="sm">Geen producten gevonden voor gereedschap.</royal-code-ui-paragraph> }
              </div>
            </div>
          }
          @case ('code') {
            <div class="my-6"> <royal-code-ui-code-block [code]="b.content" [language]="b.language" /> </div>
          }
          @case ('checklist') {
            <div class="my-6">
              <royal-code-ui-list
                [list]="b.items.slice()"
                [listType]="'text'"
                [displayPropertyKey]="'text'"
              />
            </div>
          }
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentBlockDispatcherComponent {
  block = input.required<ContentBlock>();
  productMap = input.required<Dictionary<Product>>();
  isStepCompleted = input<boolean>(false); 

  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;

  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  protected readonly randomParts: Signal<Product[]> = computed(() => {
    const products = Object.values(this.productMap()).filter((p): p is Product => !!p);
    if (!products.length) return [];
    return this.shuffleArray(products).slice(0, 20);
  });

  protected readonly randomTools: Signal<Product[]> = computed(() => {
    const products = Object.values(this.productMap()).filter((p): p is Product => !!p);
    if (!products.length) return [];
    return this.shuffleArray(products).slice(0, 8);
  });

  protected getFirstImage(media: readonly Media[] | null | undefined): Image | undefined {
    if (!media) return undefined;
    return media.find((m): m is Image => m.type === MediaType.IMAGE);
  }

  protected calloutIcon(style: 'info' | 'warning' | 'pro-tip'): AppIcon {
    switch (style) {
      case 'info': return AppIcon.Info;
      case 'warning': return AppIcon.AlertTriangle;
      case 'pro-tip': return AppIcon.Lightbulb;
    }
  }

  protected calloutColor(style: 'info' | 'warning' | 'pro-tip'): string {
     switch (style) {
      case 'info': return 'text-info';
      case 'warning': return 'text-error';
      case 'pro-tip': return 'text-primary';
    }
  }

  protected calloutBorderClass(style: 'info' | 'warning' | 'pro-tip'): string {
    if (this.isStepCompleted()) {
      return '!border-success'; 
    }
    if (style === 'warning') {
      return '!border-error';
    }
    return '';
  }
}