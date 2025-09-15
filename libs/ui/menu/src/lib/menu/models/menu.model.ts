import { Signal } from "@angular/core";

export interface MenuItem {
  id: string;
  imageUrl: string;
  title: string;
  relatedMenuItems?: MenuItem[];
  subMenus?: MenuItem[];
  parentMenus?: MenuItem[];
}

export interface Menu {
  type: 'default';
  data: Signal<MenuItem[]>;
}

export interface MenuCard {
  type: 'card';
  data: Signal<MenuItem[]>;
}

export type MenuData = Menu | MenuCard;
