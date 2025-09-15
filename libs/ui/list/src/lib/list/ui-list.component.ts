import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  InputSignal,
  OutputEmitterRef,
  ContentChild,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'aanduiding',
  standalone: true,
})
export class DisplayPropertyPipe<T extends object> implements PipeTransform {
  transform(item: T, key: keyof T | string): string {
    if (item && typeof item === 'object' && typeof key === 'string' && key in item) {
      const value = item[key as keyof T];
      return String(value ?? '');
    }
    return '';
  }
}

export const ListTypesEnum = { Text: 'text', Custom: 'custom' } as const;
export type ListType = (typeof ListTypesEnum)[keyof typeof ListTypesEnum];

export const ListOrientationEnum = { VerticalSimple: 'vertical', HorizontalSimple: 'horizontal' } as const;
export type ListOrientation = (typeof ListOrientationEnum)[keyof typeof ListOrientationEnum];

@Component({
  selector: 'royal-code-ui-list',
  standalone: true,
  imports: [CommonModule, DisplayPropertyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul
      [ngClass]="{
        'flex flex-wrap': listOrientation() === ListOrientationEnum.HorizontalSimple,
        'space-y-1': listOrientation() === ListOrientationEnum.VerticalSimple
      }"
    >
      @if (list() && list()!.length > 0) {
        @for (item of list()!; track item; let idx = $index) {
          <li
            (mouseenter)="onItemMouseEnter(item)"
            (click)="onItemMouseClick(item)"
            (keydown.enter)="onItemMouseClick(item)"
            tabindex="0"
            class="text-sm text-secondary hover:text-primary focus:text-primary focus:outline-none focus:underline rounded-sm cursor-pointer transition-colors"
          >
            @if (listType() === ListTypesEnum.Text) {
              <span class="block p-1">{{ item | aanduiding: displayPropertyKey() }}</span>
            } @else if (listType() === ListTypesEnum.Custom && effectiveTemplate) {
              <ng-container
                [ngTemplateOutlet]="effectiveTemplate"
                [ngTemplateOutletContext]="{ $implicit: item, index: idx }"
              ></ng-container>
            }
          </li>
        }
      } @else if (list() && list()!.length === 0) {
          @if (emptyTemplate()) {
            <ng-container [ngTemplateOutlet]="emptyTemplate()!"></ng-container>
          } @else {
            <li class="p-2 text-secondary italic">Geen items gevonden</li>
          }
      } @else {
        <ng-content></ng-content>
      }
    </ul>
  `,
  styles: [':host { display: block; }'],
})
export class UiListComponent<T extends object> {
  readonly list: InputSignal<T[] | undefined> = input<T[] | undefined>(undefined);
  readonly listType: InputSignal<ListType> = input<ListType>(ListTypesEnum.Text);
  readonly listOrientation: InputSignal<ListOrientation> = input<ListOrientation>(ListOrientationEnum.VerticalSimple);
  readonly displayPropertyKey: InputSignal<keyof T | string> = input<keyof T | string>('labelKey');
  readonly itemTemplate: InputSignal<TemplateRef<{ $implicit: T; index: number }> | undefined> = input<TemplateRef<{ $implicit: T; index: number }> | undefined>(undefined);
  readonly emptyTemplate: InputSignal<TemplateRef<void> | undefined> = input<TemplateRef<void> | undefined>(undefined);

  @ContentChild('itemTemplate', { static: false })
  readonly contentTemplate?: TemplateRef<{ $implicit: T; index: number }>;

  readonly itemHover: OutputEmitterRef<T> = output<T>();
  readonly itemClick: OutputEmitterRef<T> = output<T>();

  protected readonly ListOrientationEnum = ListOrientationEnum;
  protected readonly ListTypesEnum = ListTypesEnum;

  get effectiveTemplate(): TemplateRef<{ $implicit: T; index: number }> | undefined {
    return this.itemTemplate() || this.contentTemplate;
  }

  onItemMouseEnter(item: T): void {
    this.itemHover.emit(item);
  }

  onItemMouseClick(item: T): void {
    this.itemClick.emit(item);
  }
}