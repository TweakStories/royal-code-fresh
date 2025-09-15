/**
 * @file libs/features/avatar/src/lib/services/avatar-config.service.ts
 * @Version 1.1.0 - Initial mock implementation for avatar asset configuration.
 * @Author ChallengerAppDevAI
 * @Description This service is responsible for providing access to available avatar
 *              appearance assets such as skins, backgrounds, animations, etc.
 *              In this initial version, it returns mock data. In a production
 *              scenario, this service would fetch configuration from a backend API
 *              or static JSON configuration files. It serves as the single source
 *              of truth for what avatar customization options are available.
 */
import { Injectable, inject } from '@angular/core';
import { Observable, of, map } from 'rxjs';
import {
  AvatarSkin,
  AvatarBackground,
  AvatarEquipmentItem,
  AvatarPose,
  AvatarAnimation,
  AvatarAssetBase,
  AvatarAssetType,
  VisemeMap,
  VoiceProfile,
  MaterialDefinition,
  AppContext,
  Vector3 // Zorg dat Vector3 hier ook bekend is als het in modellen gebruikt wordt die de service retourneert
} from '@royal-code/shared/domain';
import { LoggerService } from '@royal-code/core/core-logging';

// Importeer de mock data (pas het pad aan naar waar je mock-avatar-data.ts daadwerkelijk staat)
// Idealiter staat deze mock data in een mock-specifieke file binnen deze library,
// of wordt het geïnjecteerd, maar voor nu gebruiken we de app-specifieke mock.
import { ALL_MOCK_AVATAR_ASSETS_PLUSHIE } from 'apps/plushie-paradise/src/app/features/home/mock-avatar-data';

@Injectable({
  providedIn: 'root', // Of 'providedIn: LibsFeaturesAvatarModule' als je een module hebt
})
export class AvatarConfigService {
  private logger = inject(LoggerService);
  private readonly logPrefix = '[AvatarConfigService]';

  // Gebruik de Plushie Paradise specifieke mock data als basis
  private mockAssets: ReadonlyArray<AvatarAssetBase> = ALL_MOCK_AVATAR_ASSETS_PLUSHIE;

  constructor() {
    this.logger.info(`${this.logPrefix} Initialized. Total mock assets: ${this.mockAssets.length}`);
  }

  /**
   * @method getAvailableSkins
   * @description Retrieves an observable of all available AvatarSkin assets,
   *              optionally filtered by application context.
   * @param {AppContext} [context] - Optional: Filter skins by application context.
   * @returns {Observable<AvatarSkin[]>} An observable array of avatar skins.
   */
  getAvailableSkins(context?: AppContext): Observable<AvatarSkin[]> {
    this.logger.debug(`${this.logPrefix} getAvailableSkins called. Context: ${context}`);
    return of(this.mockAssets).pipe(
      map(assets =>
        assets.filter(asset =>
          asset.assetType === AvatarAssetType.Skin &&
          (!context || asset.appContexts.includes(context) || asset.appContexts.includes(AppContext.SHARED))
        ) as AvatarSkin[]
      )
    );
  }

  /**
   * @method getSkinById
   * @description Retrieves a specific AvatarSkin by its ID.
   * @param {string} skinId - The ID of the skin to retrieve.
   * @returns {Observable<AvatarSkin | undefined>} An observable of the found skin or undefined.
   */
  getSkinById(skinId: string): Observable<AvatarSkin | undefined> {
    this.logger.debug(`${this.logPrefix} getSkinById called for ID: ${skinId}`);
    return this.getAvailableSkins().pipe( // Kan context meegeven indien nodig
      map(skins => skins.find(skin => skin.id === skinId))
    );
  }

  /**
   * @method getAvailableBackgrounds
   * @description Retrieves an observable of all available AvatarBackground assets.
   * @param {AppContext} [context] - Optional: Filter backgrounds by application context.
   * @returns {Observable<AvatarBackground[]>} An observable array of avatar backgrounds.
   */
  getAvailableBackgrounds(context?: AppContext): Observable<AvatarBackground[]> {
    this.logger.debug(`${this.logPrefix} getAvailableBackgrounds called. Context: ${context}`);
    return of(this.mockAssets).pipe(
      map(assets =>
        assets.filter(asset =>
          asset.assetType === AvatarAssetType.Background &&
          (!context || asset.appContexts.includes(context) || asset.appContexts.includes(AppContext.SHARED))
        ) as AvatarBackground[]
      )
    );
  }

  /**
   * @method getBackgroundById
   * @description Retrieves a specific AvatarBackground by its ID.
   * @param {string} backgroundId - The ID of the background.
   * @returns {Observable<AvatarBackground | undefined>}
   */
  getBackgroundById(backgroundId: string): Observable<AvatarBackground | undefined> {
     this.logger.debug(`${this.logPrefix} getBackgroundById called for ID: ${backgroundId}`);
    return this.getAvailableBackgrounds().pipe( // Kan context meegeven indien nodig
      map(bgs => bgs.find(bg => bg.id === backgroundId))
    );
  }

  /**
   * @method getAvailableAnimations
   * @description Retrieves an observable of all available AvatarAnimation assets.
   * @param {AppContext} [context] - Optional: Filter animations by application context.
   * @param {string[]} [tags] - Optional: Filter animations by tags.
   * @returns {Observable<AvatarAnimation[]>} An observable array of avatar animations.
   */
  getAvailableAnimations(context?: AppContext, tags?: string[]): Observable<AvatarAnimation[]> {
    this.logger.debug(`${this.logPrefix} getAvailableAnimations called. Context: ${context}, Tags: ${tags}`);
    return of(this.mockAssets).pipe(
      map(assets =>
        assets.filter(asset =>
          asset.assetType === AvatarAssetType.Animation &&
          (!context || asset.appContexts.includes(context) || asset.appContexts.includes(AppContext.SHARED)) &&
          (!tags || tags.length === 0 || ((asset as AvatarAnimation).tag && tags.includes((asset as AvatarAnimation).tag!)))
        ) as AvatarAnimation[]
      )
    );
  }

  /**
   * @method getAnimationById
   * @description Retrieves a specific AvatarAnimation by its ID.
   * @param {string} animationId - The ID of the animation.
   * @returns {Observable<AvatarAnimation | undefined>}
   */
  getAnimationById(animationId: string): Observable<AvatarAnimation | undefined> {
    this.logger.debug(`${this.logPrefix} getAnimationById called for ID: ${animationId}`);
    return this.getAvailableAnimations().pipe( // Kan context/tags meegeven
      map(anims => anims.find(anim => anim.id === animationId))
    );
  }

  /**
   * @method getVisemeMapById
   * @description Retrieves a specific VisemeMap by its ID.
   * @param {string} visemeMapId - The ID of the viseme map.
   * @returns {Observable<VisemeMap | undefined>}
   */
  getVisemeMapById(visemeMapId: string): Observable<VisemeMap | undefined> {
    this.logger.debug(`${this.logPrefix} getVisemeMapById called for ID: ${visemeMapId}`);
    return of(this.mockAssets).pipe(
      map(assets => assets.find(asset => asset.assetType === AvatarAssetType.VisemeMap && asset.id === visemeMapId) as VisemeMap | undefined)
    );
  }

   /**
   * @method getVoiceProfileById
   * @description Retrieves a specific VoiceProfile by its ID.
   * @param {string} voiceProfileId - The ID of the voice profile.
   * @returns {Observable<VoiceProfile | undefined>}
   */
  getVoiceProfileById(voiceProfileId: string): Observable<VoiceProfile | undefined> {
    this.logger.debug(`${this.logPrefix} getVoiceProfileById called for ID: ${voiceProfileId}`);
    return of(this.mockAssets).pipe(
      map(assets => assets.find(asset => asset.assetType === AvatarAssetType.VoiceProfile && asset.id === voiceProfileId) as VoiceProfile | undefined)
    );
  }

  // TODO: Implement getAvailableEquipmentItems, getEquipmentItemById, getAvailablePoses, getPoseById
  // in a similar fashion if/when needed, filtering this.mockAssets.
}