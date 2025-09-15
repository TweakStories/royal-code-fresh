// --- VERVANG VOLLEDIG BESTAND ---
/**
 * @file ui-title.component.ts
 * @Version 5.3.1 (FIXED: Centralized Enum)
 * @Author Royal-Code MonorepoAppDevAI
 * @Description
 *   A flexible UI component for rendering titles.
 *   - FIX: Now imports TitleTypeEnum from the shared domain library to prevent dependency issues.
 */
import {
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
  booleanAttribute,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicTitleDirective } from '@royal-code/shared/utils';
import { TitleTypeEnum } from '@royal-code/shared/domain'; // <<< FIX: Gecentraliseerde import

@Component({
  selector: 'royal-code-ui-title',
  standalone: true,
  imports: [DynamicTitleDirective, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      libRoyalCodeDynamicTitle
      [tag]="renderedTag()"
      [ngClass]="finalClasses()"
      [id]="id()"
      [attr.title]="truncate() ? text() : null">
      @if (text()) {
        {{ text() }}
      } @else {
        <ng-content></ng-content>
      }
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class UiTitleComponent {
  readonly level = input<TitleTypeEnum>(TitleTypeEnum.Default);
  readonly text = input<string | null | undefined>('');
  readonly id = input<string | undefined>(undefined);
  readonly extraClasses = input<string>('');
  readonly blockStyle = input(false, { transform: booleanAttribute });
  readonly blockStyleType = input<'primary' | 'secondary'>('primary');

  readonly heading = input(true, { transform: booleanAttribute });
  readonly bold = input(false, { transform: booleanAttribute });
  readonly center = input(false, { transform: booleanAttribute });
  readonly truncate = input(false, { transform: booleanAttribute });
  readonly fullWidth = input(false, { transform: booleanAttribute });

  readonly renderedTag = computed(() => {
    const currentLevel = this.level();
    if (currentLevel !== TitleTypeEnum.Default) return currentLevel;
    return this.heading() ? 'h2' : 'p';
  });

  readonly finalClasses = computed(() => {
    const tag = this.renderedTag();
    const sizeClass = {
      h1: 'text-2xl', h2: 'text-xl', h3: 'text-lg',
      h4: 'text-base', h5: 'text-sm', h6: 'text-sm', p: 'text-base'
    }[tag] || 'text-base';

    const baseClasses = [
      this.fullWidth() ? 'w-full' : '',
      this.center() ? 'text-center' : '',
      this.truncate() ? 'truncate' : '',
      sizeClass,
      this.extraClasses()
    ].filter(Boolean);

    if (this.blockStyle()) {
      const type = this.blockStyleType();
      const blockBase = 'font-bold tracking-wide py-2 px-4 rounded-xs';
      
      if (type === 'primary') {
        return [
          'inline-block',
          blockBase,
          'bg-primary text-black',
          ...baseClasses
        ].join(' ');
      }
      
      if (type === 'secondary') {
        return [
          'block',
          blockBase,
          'bg-surface-alt text-foreground',
          'border-l-4 border-primary',
          ...baseClasses
        ].join(' ');
      }
    }
    
    return [
      'block',
      'text-foreground',
      this.bold() ? 'font-bold' : 'font-semibold',
      ...baseClasses
    ].join(' ');
  });
}