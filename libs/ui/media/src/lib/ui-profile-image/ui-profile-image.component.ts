/**
 * @file ui-profile-image.component.ts
 * @Version 1.2.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2024-05-23
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2024-05-23
 * @PromptSummary Full refactor of UiProfileImageComponent for enterprise-level comments, improved API, and direct integration with UiImageComponent's new data model.
 * @Description A standalone UI component for displaying user profile images.
 *              It intelligently renders an image from a provided `Image` object or a simple URL string.
 *              As a fallback, it displays the user's initials. The component supports
 *              multiple sizes and an optional online status indicator.
 */
import { Component, ChangeDetectionStrategy, InputSignal, Signal, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Image, MediaType } from '@royal-code/shared/domain';
import { UiImageComponent } from '../ui-media/media/ui-image.component';

/**
 * @enum ProfileImageSize
 * @description Defines the standard preset sizes for the profile image component.
 */
export type ProfileImageSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * @enum OnlineStatus
 * @description Defines the possible online status states for the user, used for the status indicator.
 */
export type OnlineStatus = 'online' | 'offline' | 'busy' | 'away';

@Component({
  selector: 'royal-code-ui-profile-image',
  standalone: true,
  imports: [CommonModule, UiImageComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- De hoofdcontainer die de grootte en relatieve positionering beheert. -->
    <div [ngClass]="containerClasses()" class="overflow-visible">
      <!-- Toont de afbeelding als er een geldig Image object is en er geen laadfout is opgetreden. -->
      @if (imageToRender() && !imageError()) {
        <royal-code-ui-image
          [image]="imageToRender()"
          [alt]="altText()"
          [rounded]="true"
          objectFit="cover"
          (imageError)="handleImageError()"
        />
      } @else {
        <!-- Fallback: Toont een container met de initialen van de gebruiker. -->
        <div [ngClass]="initialsContainerClasses()">
          <span [ngClass]="initialsTextClasses()">
            {{ userInitials() }}
          </span>
        </div>
      }

      <!-- Optionele statusindicator die de online status van de gebruiker weergeeft. -->
      @if (showStatus() && status()) {
        <div
          class="status-indicator absolute rounded-full border-2 border-background"
          [ngClass]="[statusIndicatorSizeClass(), statusIndicatorPositionClass(), statusIndicatorColorClass()]"
          [title]="statusTooltip()"
          role="status"
          [attr.aria-label]="statusTooltip()">
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      position: relative;
      border-radius: 9999px; /* Zorgt voor een perfect ronde vorm, ongeacht de grootte. */
      vertical-align: middle;
    }
  `]
})
export class UiProfileImageComponent {
  /**
   * @description De bron voor de afbeelding. Accepteert een volledig `Image` domeinobject
   *              of een simpele URL-string voor maximale flexibiliteit.
   */
  readonly source: InputSignal<Image | string | null | undefined> = input<Image | string | null | undefined>(null);

  /**
   * @description De weergavenaam van de gebruiker. Wordt gebruikt voor de alt-tekst
   *              en als basis voor de initialen-fallback.
   */
  readonly displayName: InputSignal<string | null | undefined> = input<string | null | undefined>('User');

  /**
   * @description De gewenste grootte van de profielafbeelding.
   * @default 'md'
   */
  readonly size: InputSignal<ProfileImageSize> = input<ProfileImageSize>('md');

  /**
   * @description Bepaalt of de online statusindicator getoond moet worden.
   * @default false
   */
  readonly showStatus: InputSignal<boolean> = input(false);

  /**
   * @description De online status van de gebruiker, bepaalt de kleur van de indicator.
   * @default 'offline'
   */
  readonly status: InputSignal<OnlineStatus | undefined> = input<OnlineStatus | undefined>('offline');

  /**
   * @description Interne state-signal om bij te houden of het laden van de afbeelding is mislukt.
   */
  readonly imageError = signal(false);

  /**
   * @description Converteert de `source` input naar een consistent `Image` object.
   *              Deze abstractielaag maakt de component API flexibel en robuust.
   * @returns {Image | undefined} Het `Image` object dat aan de `ui-image` component wordt doorgegeven.
   */
  readonly imageToRender: Signal<Image | undefined> = computed(() => {
    const sourceValue = this.source();
    // Case 1: De bron is een geldige URL-string.
    if (typeof sourceValue === 'string' && sourceValue.trim() !== '') {
      return {
        type: MediaType.IMAGE,
        id: sourceValue, // Gebruik de URL als een unieke identifier voor dit simpele geval.
        variants: [{ url: sourceValue }],
        altText: this.altText()
      };
    }
    // Case 2: De bron is al een geldig Image-object met varianten.
    if (typeof sourceValue === 'object' && sourceValue && sourceValue.variants?.length > 0) {
      return sourceValue;
    }
    // In alle andere gevallen is er geen renderbare afbeelding.
    return undefined;
  });

  /**
   * @description Genereert de alt-tekst voor de afbeelding voor toegankelijkheid.
   * @returns {string} De alt-tekst.
   */
  readonly altText = computed(() => `${this.displayName() ?? 'User'}'s profile image`);

  /**
   * @description Berekent de initialen van de gebruiker op basis van de `displayName`.
   * @returns {string} De berekende initialen (bv. "JD" voor "John Doe").
   */
  readonly userInitials = computed(() => {
    const name = this.displayName()?.trim();
    if (!name) { return '?'; }
    const parts = name.split(' ').filter(part => part.length > 0);
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    } else if (parts.length === 1 && parts[0].length > 1) {
      return `${parts[0][0]}${parts[0][1]}`.toUpperCase();
    } else if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
    return '?';
  });

  /**
   * @description Bepaalt de Tailwind CSS klassen voor de hoofdcontainer op basis van de `size` input.
   * @returns {string} Een string met CSS-klassen.
   */
  readonly containerClasses = computed(() => {
    const sizeMap: Record<ProfileImageSize, string> = {
      xs: 'w-6 h-6', sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12', xl: 'w-16 h-16'
    };
    return `relative inline-block rounded-full ${sizeMap[this.size()]}`;
  });

  /**
   * @description Bepaalt de CSS klassen voor de fallback-container met initialen.
   * @returns {string} Een string met CSS-klassen.
   */
  readonly initialsContainerClasses = computed(() =>
    'w-full h-full rounded-full flex items-center justify-center bg-secondary text-secondary-foreground'
  );

  /**
   * @description Bepaalt de CSS klassen voor de tekst van de initialen, afhankelijk van de `size`.
   * @returns {string} Een string met CSS-klassen.
   */
  readonly initialsTextClasses = computed(() => {
    const sizeMap: Record<ProfileImageSize, string> = {
      xs: 'text-[0.625rem]', sm: 'text-xs', md: 'text-sm', lg: 'text-base', xl: 'text-lg'
    };
    return `font-semibold select-none leading-none ${sizeMap[this.size()]}`;
  });

  /**
   * @description Bepaalt de grootte-klasse voor de statusindicator.
   * @returns {string} Een string met CSS-klassen.
   */
  readonly statusIndicatorSizeClass = computed(() => {
    const sizeMap: Record<ProfileImageSize, string> = {
      xs: 'w-1.5 h-1.5', sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3', xl: 'w-3.5 h-3.5'
    };
    return sizeMap[this.size()];
  });

  /**
   * @description Bepaalt de positie-klasse voor de statusindicator, afhankelijk van de `size`.
   * @returns {string} Een string met CSS-klassen.
   */
  readonly statusIndicatorPositionClass = computed(() => {
    const positionMap: Record<ProfileImageSize, string> = {
      xs: 'bottom-0 right-0', sm: 'bottom-0 right-0', md: 'bottom-0.5 right-0.5',
      lg: 'bottom-0.5 right-0.5', xl: 'bottom-1 right-1',
    };
    return `absolute ${positionMap[this.size()]}`;
  });

  /**
   * @description Bepaalt de kleur-klasse voor de statusindicator op basis van de `status` input.
   * @returns {string} Een string met een Tailwind CSS `bg-*` klasse.
   */
  readonly statusIndicatorColorClass = computed(() => {
    switch (this.status()) {
      case 'online': return 'bg-success';
      case 'busy': return 'bg-destructive';
      case 'away': return 'bg-warning';
      case 'offline': default: return 'bg-muted-foreground';
    }
  });

  /**
   * @description Genereert de tooltip-tekst voor de statusindicator.
   * @returns {string} De geformatteerde status (bv. "Online").
   */
  readonly statusTooltip = computed(() => {
    const currentStatus = this.status();
    if (!currentStatus) return '';
    return currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1);
  });

  /**
   * @description Callback-methode die wordt aangeroepen wanneer de `ui-image` component een laadfout rapporteert.
   *              Het zet de interne `imageError` state op `true`, wat de fallback-UI activeert.
   */
  handleImageError(): void {
    this.imageError.set(true);
  }
}
