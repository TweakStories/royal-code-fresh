import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  Signal,
  TemplateRef,
} from '@angular/core';

import { CardMenuComponent } from './card-menu/card-menu.component';
import { HttpClientModule } from '@angular/common/http';
import { ListMenuComponent } from './list-menu/list-menu.component';
import { MenuData, MenuItem } from './models/menu.model';

export enum MenuTypesEnum {
  List,
  Card,
}

@Component({
  selector: 'royal-code-ui-menu',
  imports: [
    CardMenuComponent,
    ListMenuComponent,
    HttpClientModule
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div>
    @if(type === MenuTypesEnum.List){
    <royal-code-ui-list-menu [menu]="data"></royal-code-ui-list-menu>
    } @if(type === MenuTypesEnum.Card){
    <royal-code-ui-card-menu
      [menuItems]="menuData"
    ></royal-code-ui-card-menu>
    }
  </div> `,
})
export class UiMenuComponent {
  @Input() type: MenuTypesEnum = MenuTypesEnum.List;
  @Input() data?: Signal<MenuData>;
  @Input() customTemplate?: TemplateRef<unknown>;

  MenuTypesEnum = MenuTypesEnum;

  constructor(private eRef: ElementRef) {}

  get menuData(): Signal<MenuItem[]> | undefined {
    if (this.data) {
      return this.data().data;
    }
    return undefined;
  }
}
