/**
 * @file libs/ui/avatar-renderer/src/lib/components/avatar-renderer.component.ts
 * @Version 1.2.2 - Consistent import for AvatarConfigService and refined property access.
 * @Author ChallengerAppDevAI
 * @Description Standalone Angular component for rendering a 3D avatar using Babylon.js.
 */
import {
  Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, InputSignal,
  effect, inject, input, signal, OnChanges, SimpleChanges, ChangeDetectionStrategy,
  Injector, computed, Signal, NgZone,
  PLATFORM_ID
} from '@angular/core';

import {
  Engine, Scene, ArcRotateCamera, HemisphericLight, DirectionalLight, Vector3, Color3, Color4,
  SceneLoader, AbstractMesh, AnimationGroup, CubeTexture, TransformNode, ShadowGenerator, Nullable, Matrix
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import {
  AvatarSkin, AvatarBackground, AvatarAnimation, BackgroundKind, AvatarAssetType, AvatarAssetBase, Vector3 as DomainVector3
} from '@royal-code/shared/domain';
import { Observable, filter, forkJoin, map, of, switchMap, take, tap } from 'rxjs';
import { LoggerService } from '@royal-code/core/core-logging';
import { AvatarViewConfig, InitialCameraConfig, SceneLightingConfig } from '../models/avatar-rendering.model';
import { AvatarConfigService } from '@royal-code/features/avatar';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'royal-code-ui-avatar-renderer',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #avatarCanvas class="w-full h-full block outline-none" tabindex="-1"></canvas>`,
  styles: [` :host { display: block; width: 100%; height: 100%; overflow: hidden; } `]
})
export class UiAvatarRendererComponent implements AfterViewInit, OnDestroy, OnChanges {
  readonly viewConfig: InputSignal<AvatarViewConfig | undefined> = input<AvatarViewConfig>();

  @ViewChild('avatarCanvas', { static: true }) private avatarCanvasRef!: ElementRef<HTMLCanvasElement>;

  private logger = inject(LoggerService);
  private avatarConfigService = inject(AvatarConfigService); // SERVICE NU HIER GEINJECTEERD
  private ngZone = inject(NgZone);
  private injector = inject(Injector);
  private readonly platformId: Object;
  private readonly logPrefix = '[UiAvatarRenderer]';

  private engine: Nullable<Engine> = null;
  private scene: Nullable<Scene> = null;
  private camera: Nullable<ArcRotateCamera> = null;
  private currentSkinRoot: Nullable<TransformNode> = null;
  private currentSkinMeshes: AbstractMesh[] = [];
  private currentSkinAnimations: AnimationGroup[] = [];
  private currentBackgroundAsset: Nullable<TransformNode | CubeTexture> = null;
  private shadowGenerator: Nullable<ShadowGenerator> = null;
  private defaultLight: Nullable<HemisphericLight | DirectionalLight> = null;

  readonly isLoading = signal(false);

  constructor() {
    this.platformId = inject(PLATFORM_ID);
    this.logger.debug(`${this.logPrefix} Instance created.`);
    effect(() => {
      const config = this.viewConfig();
      this.logger.debug(`${this.logPrefix} Effect: viewConfig changed.`, config);
      if (this.engine && this.scene) {
        this.isLoading.set(true);
        this.updateBabylonSceneFromConfig(config)
            .catch(e => this.logger.error(`${this.logPrefix} Error in scene update effect:`, e))
            .finally(() => this.isLoading.set(false));
      } else if (!config) {
          this.cleanupSceneContent();
      }
    }, { injector: this.injector });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['viewConfig']) {
      this.logger.debug(`${this.logPrefix} ngOnChanges: viewConfig input changed.`);
    }
  }

  ngAfterViewInit(): void {
    this.logger.debug(`${this.logPrefix} ngAfterViewInit: Initializing Babylon.js scene.`);
    if (!this.avatarCanvasRef?.nativeElement) {
      this.logger.error(`${this.logPrefix} Canvas element not found!`);
      return;
    }
    this.initBabylon();
    const initialConfig = this.viewConfig();
    if (initialConfig && this.engine && this.scene) {
        this.isLoading.set(true);
        this.updateBabylonSceneFromConfig(initialConfig)
            .catch(e => this.logger.error(`${this.logPrefix} Error during initial scene setup:`, e))
            .finally(() => this.isLoading.set(false));
    }
    this.ngZone.runOutsideAngular(() => {
        this.engine?.runRenderLoop(() => {
            this.scene?.render();
        });
    });
    // Voeg window event listener alleen toe in de browser
    if (isPlatformBrowser(this.platformId)) { // << HIER TOEVOEGEN CHECK
      window.addEventListener('resize', this.onWindowResize);
    }
  }

  ngOnDestroy(): void {
    this.logger.debug(`${this.logPrefix} ngOnDestroy: Cleaning up.`);
    // Verwijder window event listener en Babylon.js cleanup alleen in de browser
    if (isPlatformBrowser(this.platformId)) { // << HIER TOEVOEGEN CHECK
      window.removeEventListener('resize', this.onWindowResize);
      this.engine?.stopRenderLoop();
      this.cleanupSceneContent();
      this.scene?.dispose();
      this.engine?.dispose();
    } else {
      this.logger.debug(`${this.logPrefix} Skipping Babylon.js cleanup on server.`); // << Log voor SSR
    }
  }

  private initBabylon(): void {
    const canvas = this.avatarCanvasRef.nativeElement;
    this.engine = new Engine(canvas, true, { stencil: true, antialias: true, preserveDrawingBuffer: true }, true);
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0, 0, 0, 0);
    this.camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 5, Vector3.Zero(), this.scene);
    this.camera.lowerRadiusLimit = 1;
    this.camera.upperRadiusLimit = 20;
    this.camera.wheelPrecision = 50;
    this.logger.info(`${this.logPrefix} Babylon.js engine and scene initialized.`);
  }

  private onWindowResize = (): void => {
    this.engine?.resize();
  };

  private cleanupSceneContent(): void {
    this.logger.debug(`${this.logPrefix} Cleaning up existing scene content.`);
    this.scene?.stopAllAnimations();
    this.currentSkinRoot?.dispose(false, true);
    this.currentSkinRoot = null;
    this.currentSkinMeshes = [];
    this.currentSkinAnimations = [];
    if (this.currentBackgroundAsset) {
      if (this.currentBackgroundAsset instanceof TransformNode) this.currentBackgroundAsset.dispose(false, true);
      else if (this.currentBackgroundAsset instanceof CubeTexture) this.currentBackgroundAsset.dispose();
      this.currentBackgroundAsset = null;
    }
    if (this.scene) this.scene.environmentTexture = null;
    this.defaultLight?.dispose();
    this.defaultLight = null;
    this.shadowGenerator?.dispose();
    this.shadowGenerator = null;
  }

  private async updateBabylonSceneFromConfig(config?: AvatarViewConfig): Promise<void> {
    if (!this.scene || !this.engine) {
      this.logger.warn(`${this.logPrefix} Scene or Engine not ready for update.`);
      return;
    }
    this.cleanupSceneContent();

    if (!config) {
      this.logger.info(`${this.logPrefix} No viewConfig provided, scene remains empty.`);
      return;
    }

    this.logger.info(`${this.logPrefix} Updating scene with new config.`, config);
    this.applyCameraConfig(config.cameraConfig);

    const backgroundAsset = config.backgroundId ? await this.getAssetDetailsFromService<AvatarBackground>(config.backgroundId, AvatarAssetType.Background) : undefined;
    await this.applyBackgroundAndLighting(backgroundAsset, config.lightingConfig);

    if (config.skinId) {
      const skinAsset = await this.getAssetDetailsFromService<AvatarSkin>(config.skinId, AvatarAssetType.Skin);
      if (skinAsset?.uri) {
        this.logger.info(`${this.logPrefix} Loading skin model from: ${skinAsset.uri}`);
        try {
          const { meshes, animationGroups } = await SceneLoader.ImportMeshAsync(null, "", skinAsset.uri, this.scene);
          if (meshes.length > 0) {
            this.currentSkinRoot = new TransformNode(`skin_${skinAsset.id}_root`, this.scene);
            meshes.forEach(mesh => mesh.parent = this.currentSkinRoot);
            this.currentSkinMeshes = meshes;
            this.currentSkinAnimations = animationGroups;

            // Gebruik de properties van AvatarAssetBase die AvatarSkin extend
            this.applyAssetBaseTransforms(this.currentSkinRoot, skinAsset);

            if (config.enableShadows !== false && this.shadowGenerator) {
              meshes.forEach(mesh => {
                mesh.receiveShadows = true;
                if (this.shadowGenerator) this.shadowGenerator.addShadowCaster(mesh, true);
              });
            }
            this.logger.info(`${this.logPrefix} Skin "${skinAsset.nameKeyOrText}" loaded.`);

            const animIdToPlay = config.animationId || skinAsset.defaultAnimationId;
            if (animIdToPlay) {
              const animationAsset = await this.getAssetDetailsFromService<AvatarAnimation>(animIdToPlay, AvatarAssetType.Animation);
              if (animationAsset?.clipName) {
                 const animGroup = this.currentSkinAnimations.find(ag => this.isAnimationClipMatch(ag.name, animationAsset.clipName));
                 if (animGroup) {
                    animGroup.start(animationAsset.isLooping, 1.0, animGroup.from, animGroup.to, false);
                    this.logger.info(`${this.logPrefix} Started animation "${animationAsset.clipName}".`);
                 } else {
                    this.logger.warn(`${this.logPrefix} Animation clip "${animationAsset.clipName}" not found. Available:`, this.currentSkinAnimations.map(ag=>ag.name));
                 }
              }
            }
          }
        } catch (error) { this.logger.error(`${this.logPrefix} Error loading skin model "${skinAsset.uri}":`, error); }
      } else { this.logger.warn(`${this.logPrefix} Skin URI for skinId "${config.skinId}" is missing or skinAsset not found.`); }
    }
  }

  // Aangepaste transformatie functie: Werkt met de properties zoals gedefinieerd in JOUW AvatarAssetBase.
  // Zorg dat scaleFactor, defaultPositionOffset, defaultRotationRad op AvatarAssetBase staan.
  private applyAssetBaseTransforms(node: TransformNode, asset: AvatarAssetBase): void {
    // Type guard om te checken of de properties bestaan, omdat ze optioneel kunnen zijn op AvatarAssetBase
    if ('scaleFactor' in asset && asset.scaleFactor !== undefined) {
        const scale = asset.scaleFactor as number;
        node.scaling = new Vector3(scale, scale, scale);
    }
    if ('defaultPositionOffset' in asset && asset.defaultPositionOffset) {
        const offset = asset.defaultPositionOffset as DomainVector3; // Gebruik de geimporteerde DomainVector3
        node.position = new Vector3(offset.x ?? 0, offset.y ?? 0, offset.z ?? 0);
    }
    if ('defaultRotationRad' in asset && asset.defaultRotationRad) {
        const rotation = asset.defaultRotationRad as DomainVector3; // Gebruik de geimporteerde DomainVector3
        node.rotation = new Vector3(rotation.x ?? 0, rotation.y ?? 0, rotation.z ?? 0);
    }
  }

  private isAnimationClipMatch(groupName: string, targetClipName: string): boolean {
    return groupName === targetClipName || groupName.endsWith(`|${targetClipName}`) || groupName.startsWith(`${targetClipName}|`) || groupName.includes(targetClipName);
  }

  private applyCameraConfig(camConfig?: InitialCameraConfig): void {
    if (!this.camera || !this.avatarCanvasRef?.nativeElement) return;
    const targetOffset = camConfig?.targetOffset;
    const target = targetOffset ? new Vector3(targetOffset.x, targetOffset.y, targetOffset.z) : new Vector3(0, 1.0, 0);

    this.camera.target = target;
    this.camera.alpha = camConfig?.alpha ?? (Math.PI / 2);
    this.camera.beta = camConfig?.beta ?? (Math.PI / 2.5);
    this.camera.radius = camConfig?.radius ?? 3;
    this.camera.lowerRadiusLimit = camConfig?.lowerRadiusLimit ?? 1;
    this.camera.upperRadiusLimit = camConfig?.upperRadiusLimit ?? 10;
    this.camera.wheelPrecision = camConfig?.wheelPrecision ?? 60;
    if (camConfig?.panningSensibility !== undefined) this.camera.panningSensibility = camConfig.panningSensibility;

    const isInteractive = this.viewConfig()?.interactive !== false;
    if (isInteractive) {
        this.camera.attachControl(this.avatarCanvasRef.nativeElement, false);
    } else {
        this.camera.detachControl();
    }
    this.logger.debug(`${this.logPrefix} Camera config applied. Interactive: ${isInteractive}`);
  }

  private async applyBackgroundAndLighting(backgroundAsset?: AvatarBackground, lightingOverride?: SceneLightingConfig): Promise<void> {
    if (!this.scene) return;
    const effectiveLighting: SceneLightingConfig = {
      clearColor: lightingOverride?.clearColor,
      ambientLightIntensity: lightingOverride?.ambientLightIntensity ?? backgroundAsset?.ambientLightIntensity ?? 0.5,
      ambientLightColor: lightingOverride?.ambientLightColor ?? "#FFFFFF",
      hemisphericLight: lightingOverride?.hemisphericLight ?? backgroundAsset?.directionalLightConfig as any, // Cast als de structuur matcht
      directionalLight: lightingOverride?.directionalLight ?? backgroundAsset?.directionalLightConfig,
      environmentTextureUrl: lightingOverride?.environmentTextureUrl ?? (backgroundAsset?.kind === BackgroundKind.SkyboxHdri ? backgroundAsset.uri : undefined),
      environmentTextureIntensity: lightingOverride?.environmentTextureIntensity ?? 1.0,
      environmentTextureRotationY: lightingOverride?.environmentTextureRotationY ?? 0,
    };

    if (effectiveLighting.clearColor) {
      try { this.scene.clearColor = Color4.FromHexString(effectiveLighting.clearColor); }
      catch (e) { this.logger.warn(`${this.logPrefix} Invalid clearColor hex: ${effectiveLighting.clearColor}`); }
    } else { this.scene.clearColor = new Color4(0,0,0,0); }

    if (backgroundAsset?.kind === BackgroundKind.SceneModel && backgroundAsset.uri) {
      try {
        const result = await SceneLoader.ImportMeshAsync(null, "", backgroundAsset.uri, this.scene);
        if (result.meshes.length > 0) {
          const bgRoot = new TransformNode(`background_${backgroundAsset.id}_root`, this.scene);
          result.meshes.forEach(mesh => { mesh.parent = bgRoot; mesh.isPickable = false; if (this.viewConfig()?.enableShadows !== false) mesh.receiveShadows = true; });
          this.currentBackgroundAsset = bgRoot;
          this.applyAssetBaseTransforms(bgRoot, backgroundAsset); // Pas transforms toe
          this.logger.info(`${this.logPrefix} Background scene "${backgroundAsset.nameKeyOrText}" loaded.`);
        }
      } catch (e) { this.logger.error(`${this.logPrefix} Failed to load background scene: ${backgroundAsset.uri}`, e); }
    }

    if (effectiveLighting.environmentTextureUrl) {
        try {
          const hdrTexture = new CubeTexture(effectiveLighting.environmentTextureUrl, this.scene);
          hdrTexture.gammaSpace = false;
          hdrTexture.rotationY = effectiveLighting.environmentTextureRotationY ?? 0;
          hdrTexture.level = effectiveLighting.environmentTextureIntensity ?? 1.0;
          this.scene.environmentTexture = hdrTexture;
          if (backgroundAsset?.uri === effectiveLighting.environmentTextureUrl && backgroundAsset?.kind === BackgroundKind.SkyboxHdri) {
              this.currentBackgroundAsset = hdrTexture;
          }
          this.logger.info(`${this.logPrefix} HDRI applied: ${effectiveLighting.environmentTextureUrl}`);
        } catch (e) { this.logger.error(`${this.logPrefix} Failed to load HDRI: ${effectiveLighting.environmentTextureUrl}`, e); }
    }

    if (!this.scene.environmentTexture) {
      this.logger.debug(`${this.logPrefix} No env texture, setting manual lights.`);
      if (effectiveLighting.hemisphericLight) {
        const hemiDirection = effectiveLighting.hemisphericLight.direction;
        const hemi = new HemisphericLight("hemiLight", hemiDirection ? new Vector3(hemiDirection.x, hemiDirection.y, hemiDirection.z) : Vector3.Up(), this.scene);
        if (effectiveLighting.hemisphericLight.skyColor) hemi.diffuse = Color3.FromHexString(effectiveLighting.hemisphericLight.skyColor);
        if (effectiveLighting.hemisphericLight.groundColor) hemi.groundColor = Color3.FromHexString(effectiveLighting.hemisphericLight.groundColor);
        hemi.intensity = effectiveLighting.hemisphericLight.intensity ?? 0.7;
        this.defaultLight = hemi;
      } else if (effectiveLighting.ambientLightIntensity !== undefined) {
        this.scene.ambientColor = effectiveLighting.ambientLightColor ? Color3.FromHexString(effectiveLighting.ambientLightColor) : new Color3(1,1,1);
        this.scene.ambientColor = this.scene.ambientColor.scale(effectiveLighting.ambientLightIntensity);
      }

      if (effectiveLighting.directionalLight) {
        const dirDirection = effectiveLighting.directionalLight.direction;
        const dirLight = new DirectionalLight("dirLight", dirDirection ? new Vector3(dirDirection.x, dirDirection.y, dirDirection.z) : new Vector3(-0.5, -1, -0.5), this.scene);
        if (effectiveLighting.directionalLight.color) dirLight.diffuse = Color3.FromHexString(effectiveLighting.directionalLight.color);
        dirLight.intensity = effectiveLighting.directionalLight.intensity ?? 1.0;
        if (this.viewConfig()?.enableShadows !== false && effectiveLighting.directionalLight.castShadows !== false) {
          this.shadowGenerator = new ShadowGenerator(effectiveLighting.directionalLight.shadowGeneratorMapSize ?? 1024, dirLight);
          this.shadowGenerator.useExponentialShadowMap = true;
        }
        if (!this.defaultLight) this.defaultLight = dirLight;
      }
    }
    if (!this.scene.environmentTexture && !this.defaultLight && this.scene.lights.length === 0) {
        this.defaultLight = new HemisphericLight("fallbackHemiLight", Vector3.Up(), this.scene);
        this.defaultLight.intensity = 0.6;
        this.logger.warn(`${this.logPrefix} No lights or env texture, added fallback HemisphericLight.`);
    }
  }

  // Moet `AvatarAssetBase` als return type hebben, of een union van specifieke types
  private async getAssetDetailsFromService<T extends AvatarAssetBase>(assetId: string, type: AvatarAssetType): Promise<T | undefined> {
    let observable$: Observable<T | undefined>;
    switch (type as string) { // Cast naar string voor de switch
      case AvatarAssetType.Skin:
        observable$ = this.avatarConfigService.getSkinById(assetId) as unknown as Observable<T | undefined>;
        break;
      case AvatarAssetType.Background:
        observable$ = this.avatarConfigService.getBackgroundById(assetId) as unknown as Observable<T | undefined>;
        break;
      case AvatarAssetType.Animation:
        observable$ = this.avatarConfigService.getAnimationById(assetId) as unknown as Observable<T | undefined>;
        break;
      default:
        this.logger.warn(`${this.logPrefix} getAssetDetailsFromService: Unsupported asset type ${type}`);
        return undefined;
    }
    try {
      return await observable$.pipe(take(1)).toPromise();
    } catch (error) {
      this.logger.error(`${this.logPrefix} Failed to fetch asset details for ID ${assetId}, Type ${type}`, error);
      return undefined;
    }
  }
}
