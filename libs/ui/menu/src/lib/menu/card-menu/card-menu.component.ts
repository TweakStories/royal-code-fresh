import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output, Signal } from '@angular/core';

import { CardTypeEnum, UiCardComponent } from '../../../../card/src/lib/card/ui-card.component';
import { ListOrientationEnum, ListTypesEnum, UiListComponent } from '../../../../list/src/lib/list/ui-list.component';
import { TitleTypeEnum, UiTitleComponent } from '../../../../title/src/lib/title/ui-title.component';
import { Subject } from 'rxjs';
import { UiGridComponent } from '../../../../grid/src/lib/grid/ui-grid.component';
import { MenuItem } from '../models/menu.model';
// import { MenuService } from '@royal-code/shared/domain/store';

export enum GridTypesEnum {
  TwoLayerGrid_LargeStart = 'twoLayerGridLargeStart',
  TwoLayerGrid_SmallStart = 'twoLayerGridSmallStart',
}

@Component({
    selector: 'royal-code-ui-card-menu',
    imports: [UiCardComponent, UiTitleComponent, UiListComponent, UiGridComponent],  changeDetection: ChangeDetectionStrategy.OnPush,

    template: `<!-- list card -->
    <ng-template #listCardTemplate let-subMenuItem>
      <royal-code-ui-card
        [title]="subMenuItem.title"
        [imageUrl]="subMenuItem.imageUrl"
        [cardType]="CardType.ListCard"
        [size]="TitleTypesEnum.H8"
        (mouseenter)="onCardHover(subMenuItem.id)"
      ></royal-code-ui-card>
    </ng-template>
    
    <!-- product card -->
    <ng-template #cardGridTemplate let-product>
      <royal-code-ui-card
        [title]="product.title"
        [imageUrl]="product.imageUrl"
        [cardType]="CardType.GridCard"
        [size]="TitleTypesEnum.H7"
        [bold]="true"
        [heading]="false"
      ></royal-code-ui-card>
    </ng-template>
    
    <div class="fixed left-0 top-28 w-full">
      <div class="container mx-auto">
        <div class="flex h-full relative">
          <!-- Left Side -->
          <div class="w-1/4 p-8">
            @if (menuItems) {
              @for (menuItem of menuItems(); track menuItem) {
                <div>
                  <royal-code-ui-title
                    [title]="menuItem.title"
                    [type]="TitleTypesEnum.Default"
                    [bold]="true"
                  ></royal-code-ui-title>
                  <royal-code-ui-list
                    [title]="menuItem.title"
                    [list]="menuItem.subMenus || []"
                    [itemTemplate]="listCardTemplate"
                    [listType]="ListTypes.Custom"
                    [listOrientation]="ListOrientation.VerticalSimple"
                    >
                  </royal-code-ui-list>
                </div>
              }
            }
          </div>
    
          <!-- Right Side -->
          @if(menusWithChildMenus$ && menusWithChildMenus$()){
            <div
              class="w-3/4 p-8"
              >
              <button
                (click)="onCloseButtonClick()"
                class="absolute right-1 top-5 hover:bg-accent rounded-full w-12 h-12"
                >
                <span class="material-icons text-4xl">close</span>
              </button>
              @for(menusWithChildMenus of menusWithChildMenus$(); track $index) {
                <royal-code-ui-title
                  [title]="menusWithChildMenus.title"
                  [type]="TitleTypesEnum.H4"
                  [bold]="true"
                  [heading]="false"
                ></royal-code-ui-title>
    
                @if($index === 0) {
                  <h1> large</h1>
                  @if (menusWithChildMenus.relatedMenuItems){
                    <royal-code-ui-grid
                      [maxRows]="2"
                      [maxCols]="5"
                      [maxItems]="7"
                      [colSpan]="colSpanConfig"
                      [rowSpan]="rowSpanConfig"
                      [gap]="0.5"
                      [cellTemplate]="cardGridTemplate"
                      [data]="menusWithChildMenus.relatedMenuItems"
                      >
                    </royal-code-ui-grid>
                  }
                } @else {
                  <h1> small</h1>
                  @if (menusWithChildMenus.relatedMenuItems){
                    <royal-code-ui-grid
                      [data]="menusWithChildMenus.relatedMenuItems"
                      [maxRows]="2"
                      [maxCols]="4"
                      [maxItems]="8"
                      [gap]="0.5"
                      [cellTemplate]="cardGridTemplate"
                      >
                    </royal-code-ui-grid>
                  }
                }
              }
            </div>
          }
        </div>
      </div>
    </div>
    `,
    styles: `.card-menu-dropdown {
      position: fixed;
      top: 10rem;
      left: 0;
      width: 100%;
    }
    `
})
export class CardMenuComponent implements OnDestroy{
  @Input() menuItems?: Signal<MenuItem[]>;
  @Output() closeCardMenuRequest = new EventEmitter<void>();

  menusWithChildMenus$?: Signal<MenuItem[] | undefined>;

  TitleTypesEnum = TitleTypeEnum;
  ListTypes = ListTypesEnum;
  ListOrientation = ListOrientationEnum;
  CardType = CardTypeEnum;
  GridTypes = GridTypesEnum;

  private onDestroy$ = new Subject<void>();

  // Define the colSpan and rowSpan configuration
  colSpanConfig: { [key: number]: number } = { 0: 2, };
  rowSpanConfig: { [key: number]: number } = { 0: 2, };

  // constructor(private menuService: MenuService) {}

  onCardHover(categoryId: number) {
    if (this.menuItems) {
      console.log(categoryId);
      // this.menusWithChildMenus$ = this.menuService
      //   .findSubmenusByMenuId(this.menuItems, categoryId);
      }
  }

  onCloseButtonClick() {
    this.closeCardMenuRequest.emit();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
