/**
 * @file account-overview-page.component.ts
 * @Version 6.2.0 (Definitive - Template & Facade Fixes)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-01
 * @Description The definitive "My Account" dashboard. This version corrects
 *              the template to be inline and uses the correct facade property for review counts.
 */
import { ChangeDetectionStrategy, Component, inject, computed, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { UiTitleComponent } from '@royal-code/ui/title';
import { TitleTypeEnum } from '@royal-code/shared/domain';
import { UiButtonComponent } from '@royal-code/ui/button';
import { UiCardComponent } from '@royal-code/ui/cards/card';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { UserFacade } from '@royal-code/store/user';
import { OrdersFacade } from '@royal-code/features/orders/core';
import { WishlistFacade } from '@royal-code/features/wishlist/core';
import { ReviewsFacade } from '@royal-code/features/reviews/core';
import { OrderHistoryListComponent } from '@royal-code/features/orders/ui-plushie';

@Component({
  selector: 'droneshop-account-overview-page',
  standalone: true,
  imports: [
    CommonModule, RouterModule, UiTitleComponent,
    UiButtonComponent, UiCardComponent, UiIconComponent,
    OrderHistoryListComponent, TranslateModule
  ],
  template: `
    <div class="space-y-8">
      <!-- === CATEGORY: User Greeting === -->
      <section>
        @if (userDisplayName(); as displayName) {
          <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="'account.overview.greeting' | translate: { name: displayName }" extraClasses="mb-4" />
        } @else {
          <royal-code-ui-title [level]="TitleTypeEnum.H1" [text]="'account.overview.loadingGreeting' | translate" extraClasses="mb-4" />
        }
      </section>

      <!-- === CATEGORY: Quick Action Cards === -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <!-- Bestellingen Card -->
        <royal-code-ui-card extraContentClasses="flex flex-col items-start gap-2">
          <div class="flex justify-between items-center w-full">
            <h3 class="text-lg font-semibold text-foreground">{{ 'account.overview.ordersCardTitle' | translate }}</h3>
            <royal-code-ui-icon [icon]="AppIcon.Package" sizeVariant="md" extraClass="text-primary" />
          </div>
          <p class="text-sm text-secondary">
            {{ 'account.overview.ordersCardDescription' | translate }}
            @if (totalOrdersCount(); as count) {
              <span class="font-bold text-foreground block">{{ count }} {{ 'account.overview.ordersCountText' | translate: { count: count } }}</span>
            }
          </p>
          <royal-code-ui-button type="outline" sizeVariant="sm" [routerLink]="['/account/orders']" extraClasses="mt-auto">
            {{ 'account.overview.viewOrdersButton' | translate }}
          </royal-code-ui-button>
        </royal-code-ui-card>

        <!-- Adressen Card -->
        <royal-code-ui-card extraContentClasses="flex flex-col items-start gap-2">
          <div class="flex justify-between items-center w-full">
            <h3 class="text-lg font-semibold text-foreground">{{ 'account.overview.addressesCardTitle' | translate }}</h3>
            <royal-code-ui-icon [icon]="AppIcon.MapPin" sizeVariant="md" extraClass="text-primary" />
          </div>
          <p class="text-sm text-secondary">
            {{ 'account.overview.addressesCardDescription' | translate }}
            @if (totalAddressesCount(); as count) {
              <span class="font-bold text-foreground block">{{ count }} {{ 'account.overview.addressesCountText' | translate: { count: count } }}</span>
            }
          </p>
          <royal-code-ui-button type="outline" sizeVariant="sm" [routerLink]="['/account/addresses']" extraClasses="mt-auto">
            {{ 'account.overview.manageAddressesButton' | translate }}
          </royal-code-ui-button>
        </royal-code-ui-card>

        <!-- Mijn Verlanglijst Card -->
        <royal-code-ui-card extraContentClasses="flex flex-col items-start gap-2">
          <div class="flex justify-between items-center w-full">
            <h3 class="text-lg font-semibold text-foreground">{{ 'account.overview.wishlistCardTitle' | translate }}</h3>
            <royal-code-ui-icon [icon]="AppIcon.Heart" sizeVariant="md" extraClass="text-primary" />
          </div>
          <p class="text-sm text-secondary">
            {{ 'account.overview.wishlistCardDescription' | translate }}
            @if (totalWishlistItems(); as count) {
              <span class="font-bold text-foreground block">{{ count }} {{ 'account.overview.wishlistCountText' | translate: { count: count } }}</span>
            }
          </p>
          <royal-code-ui-button type="outline" sizeVariant="sm" [routerLink]="['/account/wishlist']" extraClasses="mt-auto">
            {{ 'account.overview.viewWishlistButton' | translate }}
          </royal-code-ui-button>
        </royal-code-ui-card>

        <!-- Mijn Productreviews Card -->
        <royal-code-ui-card extraContentClasses="flex flex-col items-start gap-2">
          <div class="flex justify-between items-center w-full">
            <h3 class="text-lg font-semibold text-foreground">{{ 'account.overview.reviewsCardTitle' | translate }}</h3>
            <royal-code-ui-icon [icon]="AppIcon.Star" sizeVariant="md" extraClass="text-primary" />
          </div>
          <p class="text-sm text-secondary">
            {{ 'account.overview.reviewsCardDescription' | translate }}
            @if (totalReviews(); as count) {
              <span class="font-bold text-foreground block">{{ count }} {{ 'account.overview.reviewsCountText' | translate: { count: count } }}</span>
            }
          </p>
          <royal-code-ui-button type="outline" sizeVariant="sm" [routerLink]="['/account/reviews']" extraClasses="mt-auto">
            {{ 'account.overview.viewMyReviewsButton' | translate }}
          </royal-code-ui-button>
        </royal-code-ui-card>

      </section>

      <!-- === CATEGORY: Recente Bestellingen === -->
      <section>
        <div class="flex justify-between items-center mb-4">
          <royal-code-ui-title [level]="TitleTypeEnum.H2" text="Recente Bestellingen" />
          <a routerLink="/account/orders" class="text-sm font-semibold text-primary hover:underline">
            Bekijk alles
          </a>
        </div>
        <plushie-order-history-list [orders]="recentOrders()" [isLoading]="isLoadingOrders()" />
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountOverviewPageComponent implements OnInit {
  protected readonly TitleTypeEnum = TitleTypeEnum;
  protected readonly AppIcon = AppIcon;
  protected readonly userFacade = inject(UserFacade);
  private readonly ordersFacade = inject(OrdersFacade);
  private readonly wishlistFacade = inject(WishlistFacade);
  private readonly reviewsFacade = inject(ReviewsFacade);
  protected readonly allOrders = toSignal(this.ordersFacade.orderHistory$, { initialValue: [] });
  protected readonly recentOrders = computed(() => this.allOrders().slice(0, 3));
  protected readonly isLoadingOrders = toSignal(this.ordersFacade.isLoading$, { initialValue: true });
  readonly userDisplayName = computed(() => this.userFacade.profile()?.displayName);
  readonly totalOrdersCount = this.ordersFacade.totalOrdersCount;
  readonly totalWishlistItems = this.wishlistFacade.wishlistCount;
  readonly totalReviews = this.reviewsFacade.totalCount; // DE FIX: Gebruik de correcte property
  readonly totalAddressesCount = computed(() => this.userFacade.addresses().length);

  ngOnInit(): void {
    this.ordersFacade.loadOrderHistory(1, 3);
    this.wishlistFacade.loadWishlist();
  }
}