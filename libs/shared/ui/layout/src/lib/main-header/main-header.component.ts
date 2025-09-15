import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon, NavigationItem } from '@royal-code/shared/domain';

@Component({
  selector: 'royal-code-main-header',
  standalone: true,
  imports: [CommonModule, RouterModule, UiIconComponent],
  template: `
    <header class="relative top-0 z-40 w-full bg-background border-b border-border">
      <div class="container-max h-20 px-4 md:px-6 flex items-center justify-between gap-4">
        
        <!-- Slot voor Logo -->
        <div class="flex-shrink-0">
          <ng-content select="[slot='logo']"></ng-content>
        </div>

        <!-- Slot voor Hoofdnavigatie (Desktop) -->
        <nav class="hidden lg:flex flex-grow justify-center">
          <ng-content select="[slot='main-nav-desktop']"></ng-content>
        </nav>

        <!-- Slot voor Acties (Zoeken, Account, Winkelwagen) -->
        <div class="flex items-center gap-2">
          <ng-content select="[slot='actions']"></ng-content>
        </div>

      </div>
      <!-- Slot voor Mega Menu of Sub-navigatie -->
      <ng-content select="[slot='sub-nav']"></ng-content>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainHeaderComponent {}