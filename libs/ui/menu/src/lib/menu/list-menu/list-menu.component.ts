import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  Signal,
} from '@angular/core';

import { Router } from '@angular/router';
import { CardTypeEnum, UiCardComponent } from '@royal-code/ui/cards/card';
import {
  ListOrientationEnum,
  ListTypesEnum,
  UiListComponent,
} from '@royal-code/ui/list';
import { MenuData, MenuItem } from '../models/menu.model';
import { TitleTypeEnum } from '@royal-code/shared/domain';

@Component({
  selector: 'royal-code-ui-list-menu',
  template: `<!-- list card -->
    <ng-template #listCardTemplate let-subMenuItem>
      <royal-code-ui-card
        [title]="subMenuItem.title"
        [imageUrl]="subMenuItem.imageUrl"
        [cardType]="CardType.ListCard"
        [size]="TitleTypesEnum.H8"
        (mouseenter)="onMenuHover(subMenuItem.id, 'left')"
      ></royal-code-ui-card>
    </ng-template>

    <div class="container mx-auto">
      <div class="flex h-full relative">
        <!-- Categories left side -->
        <div class="w-1/3 p-8">
          @if (menu) {
          <royal-code-ui-list
            [list]="menu().data()"
            [itemTemplate]="listCardTemplate"
            [listType]="ListTypes.Custom"
            [listOrientation]="ListOrientation.VerticalSimple"
          >
          </royal-code-ui-list>
          }
        </div>
        <div class="w-1/3 p-8">
          <!--  Subcategories middle -->
          @if(menusChild) {
          <royal-code-ui-list
            [list]="menusChild()"
            [listType]="ListTypes.Text"
            [listOrientation]="ListOrientation.VerticalSimple"
            (itemHover)="onMenuHover($event.id, 'middle')"
          >
            >
          </royal-code-ui-list>
          }
        </div>

        <div class="w-1/3 p-8">
          <!--  Subcategories right -->
          @if(menusSubChild) {
          <royal-code-ui-list
            [list]="menusSubChild()"
            [itemTemplate]="listCardTemplate"
            [listType]="ListTypes.Text"
            [listOrientation]="ListOrientation.VerticalSimple"
            (itemClick)="onMenuClick($event.id)"
          >
          </royal-code-ui-list>
          }
        </div>
      </div>
    </div> `,
  styles: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiCardComponent, UiListComponent],
})
export class ListMenuComponent {
  @Input() menu?: Signal<MenuData>;
  @Output() closeCardMenuRequest = new EventEmitter<void>();

  TitleTypesEnum = TitleTypeEnum;
  ListTypes = ListTypesEnum;
  ListOrientation = ListOrientationEnum;
  CardType = CardTypeEnum;

  menusChild?: Signal<MenuItem[]>;
  menusSubChild?: Signal<MenuItem[]>;

  constructor(private router: Router) {}

  onMenuHover(menuItemId: string, level: 'left' | 'middle' | 'right'): void {
    if (this.menu) {
      if (level === 'left') {
        // this.menusChild = this.menuService.findSubmenusByMenuId(
        //   this.menu().data,
        //   menuItemId
        // ) as Signal<MenuItem[]>;
      } else if (level === 'middle') {
        //   this.menusSubChild = this.menuService.findSubmenusByMenuId(
        //     this.menusChild as Signal<MenuItem[]>,
        //     menuItemId
        //   ) as Signal<MenuItem[]>;
      }
    }
  }

  onMenuClick(menuItemId: string) {
    this.router.navigate(['/category', menuItemId]);
  }

  onCloseButtonClick() {
    this.closeCardMenuRequest.emit();
  }
}
