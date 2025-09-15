/**
 * @file wishlist-button.component.ts
 * @Version 5.1.0 (FIXED - TypeScript Compiler Issues Resolved)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-10
 * @Description A smart, reusable button for adding/removing items from the wishlist,
 *              with fixed imports to resolve TypeScript compiler issues.
 */
import { ChangeDetectionStrategy, Component, inject, input, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { WishlistFacade } from '@royal-code/features/wishlist/core';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { filter as rxFilter } from 'rxjs/operators';
import { UiButtonComponent } from '@royal-code/ui/button';

@Component({
  selector: 'royal-code-ui-wishlist-button',
  standalone: true,
  imports: [CommonModule, UiButtonComponent, UiIconComponent, TranslateModule],
  template: `
    <royal-code-ui-button
      type="outline"
      [attr.aria-label]="(isInWishlist() ? 'wishlist.removeFromWishlist' : 'wishlist.addToWishlist') | translate"
      (clicked)="toggleItem()">
      <royal-code-ui-icon
        [icon]="AppIcon.Heart"
        extraClass="transition-colors"
        [class.text-red-500]="isInWishlist()"
        [class.fill-red-500]="isInWishlist()"
      />
    </royal-code-ui-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiWishlistButtonComponent {
  private readonly wishlistFacade = inject(WishlistFacade);

  readonly productId = input.required<string>();
  readonly variantId = input<string | undefined>();

  protected readonly AppIcon = AppIcon;

  private readonly productId$: Observable<string> = toObservable(this.productId).pipe(rxFilter(Boolean));
  private readonly variantId$: Observable<string | undefined> = toObservable(this.variantId);

  readonly isInWishlist: Signal<boolean> = this.wishlistFacade.isProductInWishlist(
    this.productId$,
    this.variantId$
  );

  toggleItem(): void {
    this.wishlistFacade.toggleWishlistItem({
      productId: this.productId(),
      variantId: this.variantId(),
    });
  }
}