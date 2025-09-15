/**
 * @file ui-button.component.ts (Shared UI)
 * @version 8.1.0 (Definitive Centering & Feature-Complete Button - Final Fix)
 * @Author Roy van de Wetering & Royal-Code MonorepoAppDevAI
 * @Date 2025-08-04
 * @Description
 *   De definitieve, feature-complete en robuuste knopcomponent. Lost de
 *   visuele bug op waarbij iconen niet correct werden gecentreerd door de
 *   onnodige 'flex-grow' span te verwijderen.
 */
import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  output,
  OutputEmitterRef,
  booleanAttribute
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon, ThemeHueName, ButtonType, ButtonSizeVariant, HtmlButtonType, ContentAlignType } from '@royal-code/shared/domain';



@Component({
  selector: 'royal-code-ui-button',
  standalone: true,
  imports: [CommonModule, RouterModule, UiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="htmlType()"
      [disabled]="disabled() || loading()"
      [ngClass]="buttonClasses()"
      [style.background-image]="gradientStyle()"
      [style.background-color]="backgroundColor() || null"
      (click)="onClick($event)">
      @if (loading()) {
        <span class="animate-spin h-4 w-4 border-2 border-current border-r-transparent rounded-full" [attr.aria-hidden]="true"></span>
      } @else {
        @if (icon()) {
          <royal-code-ui-icon [icon]="icon()!" [sizeVariant]="iconSize()" [colorClass]="iconColorClass()" [extraClass]="iconClasses()" [attr.aria-hidden]="true" />
        }
        <!-- FIX: De onnodige span is verwijderd -->
        <ng-content />
      }
    </button>
  `
})
export class UiButtonComponent {
  readonly type = input<ButtonType>('default');
  readonly sizeVariant = input<ButtonSizeVariant>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly outline = input(false, { transform: booleanAttribute });
  readonly extraClasses = input<string>('');
  readonly htmlType = input<HtmlButtonType>('button');
  readonly isRound = input(false, { transform: booleanAttribute });
  readonly isAnimated = input(false, { transform: booleanAttribute });
  readonly useHueGradient = input(false, { transform: booleanAttribute });
  readonly enableNeonEffect = input(false, { transform: booleanAttribute });
  readonly isSelected = input(false, { transform: booleanAttribute });
  readonly isFullWidth = input(false, { transform: booleanAttribute });
  readonly backgroundColor = input<string | null>(null);
  readonly contentAlign = input<ContentAlignType>('center');
  readonly icon = input<AppIcon | undefined>(undefined);
  readonly iconPosition = input<'left' | 'right'>('left');
  readonly iconColorClass = input<string>('text-current');

  readonly clicked: OutputEmitterRef<MouseEvent> = output<MouseEvent>();

  private readonly sizeMap = {
    xs: 'py-1 px-2 text-xs',
    sm: 'py-2 px-3 text-sm',
    md: 'py-2.5 px-4 text-sm',
    lg: 'py-2.5 px-6 text-base',
    xl: 'py-2.5 px-8 text-lg',
    icon: 'h-10 w-10 p-0',
    dot: 'h-7 w-7 p-0',
    none: ''
  } as const;


  private readonly themeName = computed<ThemeHueName | 'primary' | null>(() => {
    const type = this.type();
    if (type.startsWith('theme-')) return type.substring(6) as ThemeHueName;
    return type === 'primary' ? 'primary' : null;
  });

  readonly gradientStyle = computed(() => {
    const theme = this.themeName();
    const useGradient = this.useHueGradient() && theme && theme !== 'primary' && !this.outline();
    return useGradient
      ? `linear-gradient(to bottom right, var(--color-btn-${theme}-grad-start), var(--color-btn-${theme}-grad-end))`
      : null;
  });

readonly buttonClasses = computed(() => {
    const type = this.type();
    const theme = this.themeName();
    const extraClasses = this.extraClasses();
    const isOutline = this.outline();
    const hasGradient = !!this.gradientStyle();

    const base = [
      'inline-flex', 'items-center', `justify-${this.contentAlign()}`,
      'font-semibold', 'transition-all',
      'focus-visible:outline-none', 'focus-visible:ring-2',
      'focus-visible:ring-ring', 'focus-visible:ring-offset-2',
      this.isRound() ? 'rounded-full' : 'rounded-xs',
      this.isAnimated() ? 'hover:scale-105 active:scale-100' : '',
      this.isFullWidth() ? 'w-full' : ''
    ];

    const typeClasses = this.getTypeClasses(type, theme, isOutline, hasGradient, this.backgroundColor());
    const sizeClasses = this.getSizeClasses();
    const stateClasses = this.getStateClasses(theme);

    return [...base, ...typeClasses, sizeClasses, ...stateClasses, extraClasses]
      .filter(Boolean)
      .join(' ');
  });


  private getTypeClasses(
    type: ButtonType,
    theme: ThemeHueName | 'primary' | null,
    isOutline: boolean,
    hasGradient: boolean,
    explicitBackgroundColor: string | null
  ): string[] {
    if (type === 'none') return [];
    if (isOutline) return this.getOutlineClasses(theme);
    return this.getFilledClasses(type, theme, hasGradient, explicitBackgroundColor);
  }

  private getOutlineClasses(theme: ThemeHueName | 'primary' | null): string[] {
    const classes = ['bg-transparent', 'border'];
    if (theme === 'primary') {
      classes.push('border-primary', 'text-primary', 'hover:bg-primary', 'hover:text-primary-on');
    } else if (theme) {
      classes.push(`border-theme-${theme}`, `text-theme-${theme}`, `hover:bg-theme-${theme}`, `hover:text-theme-${theme}-on`);
    } else {
      classes.push('border-border', 'text-foreground', 'hover:bg-accent', 'hover:text-accent-on');
    }
    return classes;
  }

  private getFilledClasses(
    type: ButtonType,
    theme: ThemeHueName | 'primary' | null,
    hasGradient: boolean,
    explicitBackgroundColor: string | null
  ): string[] {
    if (explicitBackgroundColor) {
      return theme ? [`text-theme-${theme}-on`, 'border', 'border-transparent'] : ['text-primary-on', 'border', 'border-transparent'];
    }

    if (type === 'transparent') {
      return ['bg-transparent', 'text-secondary', 'hover:bg-hover', 'hover:text-primary', 'border', 'border-transparent'];
    }
    if (type === 'default') {
      return ['bg-background-secondary', 'text-foreground-default', 'border', 'border-border', 'hover:bg-hover'];
    }
    
    if (hasGradient) {
      return theme ? [`text-theme-${theme}-on`] : ['text-primary-on'];
    } else if (theme === 'primary') {
      return ['bg-primary', 'text-primary-on', 'hover:bg-primary-hover', 'border', 'border-transparent'];
    } else if (theme) {
      return [`bg-theme-${theme}`, `text-theme-${theme}-on`, `hover:bg-theme-${theme}-hover`, 'border', 'border-transparent'];
    }

    return ['bg-background-secondary', 'text-foreground-default', 'border', 'border-border', 'hover:bg-hover'];
  }

  private getSizeClasses(): string {
    const size = this.sizeVariant();
    return size === 'none' ? '' : this.sizeMap[size];
  }

  private getStateClasses(theme: ThemeHueName | 'primary' | null): string[] {
    const classes: string[] = [];
    if (this.disabled() || this.loading()) {
      classes.push('opacity-50', 'cursor-not-allowed');
    } else {
      if (this.enableNeonEffect() && theme) {
        classes.push('neon-effect-target', `neon-${theme}`);
      }
      if (this.isSelected()) {
        classes.push('ring-2', 'ring-offset-2', 'ring-primary');
      }
    }
    return classes;
  }

  protected iconSize = computed((): 'xs' | 'sm' | 'md' | 'lg' | 'xl' => {
    const size = this.sizeVariant();
    switch (size) {
      case 'xs': return 'xs';
      case 'sm': return 'sm';
      case 'md': return 'sm';
      case 'lg': return 'md';
      case 'xl': return 'lg';
      default: return 'sm';
    }
  });

  protected iconClasses = computed((): string => {
    const position = this.iconPosition();
    return position === 'left' ? 'mr-2' : 'ml-2';
  });

  onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}