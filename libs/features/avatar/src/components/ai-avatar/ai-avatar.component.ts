// libs/features/avatar/components/ai-avatar/ai-avatar.component.ts
/**
 * @fileoverview Renders an interactive 3D AI Avatar or user's equipment
 * using Babylon.js. Allows for dynamic model loading, environment changes,
 * and interaction events.
 *
 * @Component AiAvatarComponent
 * @description Displays a 3D character or equipment set within a Babylon.js scene.
 *              Reacts to input changes for display mode, model, and environment.
 * @version 2.0.1 - Removed explicit wheelPrecision for camera zoom; clarified position/scale comments.
 * @author ChallengerAppDevAI
 */
import {
  Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, InputSignal,
  OutputEmitterRef, effect, inject, input, output, signal, OnChanges, SimpleChanges, ChangeDetectionStrategy
} from '@angular/core';

import {
  Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, Color3, Color4,
  SceneLoader, AbstractMesh, AnimationGroup, StandardMaterial, MeshBuilder, CubeTexture, PointerEventTypes, PickingInfo, Texture,
  ShadowGenerator,
  DirectionalLight,
  TransformNode,
  Mesh
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF'; // Importeer de GLTF loader voor Babylon
import { LoggerService } from '@royal-code/core/core-logging';

// Interfaces (AvatarModelConfig, WorldLightingConfig, AvatarDisplayMode, SceneInteractionEvent)
// blijven hetzelfde als in de door jou aangeleverde frontend-code.md

export interface AvatarModelConfig {
  modelUrl: string;
  environmentSceneUrl?: string;
  scale?: number;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number }; // In radialen
  defaultAnimationClipName?: string;
}

export interface WorldLightingConfig {
  ambientLightIntensity?: number;
  hemisphericLight?: {
    direction?: { x: number; y: number; z: number };
    skyColor?: string;
    groundColor?: string;
    intensity?: number;
  };
  directionalLight?: {
    direction?: { x: number; y: number; z: number };
    intensity?: number;
    color?: string;
  };
  environmentTextureUrl?: string;
}

export type AvatarDisplayMode = 'avatar' | 'equipment';

export interface SceneInteractionEvent {
  type: 'click' | 'hover' | 'custom';
  targetName?: string;
  position?: { x: number; y: number; z: number };
}

@Component({
  selector: 'royal-code-ai-avatar',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #avatarCanvas class="w-full h-full block"></canvas>`,
  styles: [`
    :host { display: block; width: 100%; height: 100%; overflow: hidden; }
    canvas { display: block; width: 100%; height: 100%; touch-action: none; /* Voor pointer events */ }
  `]
})
export class AiAvatarComponent implements AfterViewInit, OnDestroy, OnChanges {
  // --- Inputs ---
  readonly avatarConfig: InputSignal<AvatarModelConfig | undefined> = input<AvatarModelConfig>();
  readonly lightingConfig: InputSignal<WorldLightingConfig | undefined> = input<WorldLightingConfig>();
  readonly displayMode: InputSignal<AvatarDisplayMode> = input<AvatarDisplayMode>('avatar');
  readonly interactive: InputSignal<boolean> = input<boolean>(false);

  // --- Outputs ---
  readonly sceneInteraction: OutputEmitterRef<SceneInteractionEvent> = output<SceneInteractionEvent>();
  readonly sceneReady: OutputEmitterRef<void> = output<void>();

  @ViewChild('avatarCanvas', { static: true }) private avatarCanvasRef!: ElementRef<HTMLCanvasElement>;

  private logger = inject(LoggerService);
  private readonly logPrefix = '[AiAvatarComponent-Babylon]';

  private engine: Engine | null = null;
  private scene: Scene | null = null;
  private camera: ArcRotateCamera | null = null;

  private currentAvatarMeshes: AbstractMesh[] = [];
  private currentEnvironmentMesh: TransformNode | null = null;
  private currentAnimationGroups: AnimationGroup[] = [];
  private defaultAnimation: AnimationGroup | null = null;
  private shadowGenerator: ShadowGenerator | null = null;


  constructor() {
    this.logger.debug(`${this.logPrefix} Instance created.`);
    effect(() => {
      const config = this.avatarConfig();
      const lightConfig = this.lightingConfig();
      const mode = this.displayMode();
      this.logger.debug(`${this.logPrefix} Effect: Input change detected. Config: ${!!config}, Light: ${!!lightConfig}, Mode: ${mode}. Renderer exists: ${!!this.engine}`);
      if (this.engine && this.scene) {
        this._fullSceneUpdate();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.logger.debug(`${this.logPrefix} ngOnChanges detected:`, changes);
    if (!this.engine || !this.scene) {
        this.logger.warn(`${this.logPrefix} ngOnChanges: Engine or Scene not ready, skipping update.`);
        return;
    }

    let needsFullUpdate = false;
    if (changes['avatarConfig'] || changes['lightingConfig'] || changes['displayMode']) {
        needsFullUpdate = true;
    }

    if (needsFullUpdate) {
        this._fullSceneUpdate();
    }

    if (changes['interactive']) {
        this.setupCameraControls();
    }
  }

  private _fullSceneUpdate(): void {
    this.logger.info(`${this.logPrefix} Performing full scene update.`);
    if (!this.scene) {
        this.logger.error(`${this.logPrefix} _fullSceneUpdate called but scene is null.`);
        return;
    }
    this.cleanupSceneContent();
    this.setupLighting();
    this.loadEnvironmentScene();
    this.loadAvatarModel();
    this.updateCameraForDisplayMode();
  }


  ngAfterViewInit(): void {
    this.logger.debug(`${this.logPrefix} ngAfterViewInit: Initializing Babylon.js scene.`);
    if (!this.avatarCanvasRef?.nativeElement) {
      this.logger.error(`${this.logPrefix} Canvas element not found!`);
      return;
    }
    this.initBabylon();
    this._fullSceneUpdate(); // Eerste scene opbouw
    this.setupCameraControls();

    this.engine?.runRenderLoop(() => {
      this.scene?.render();
    });

    window.addEventListener('resize', this.onWindowResize);
    this.sceneReady.emit();
  }

  ngOnDestroy(): void {
    this.logger.debug(`${this.logPrefix} ngOnDestroy: Cleaning up Babylon.js resources.`);
    window.removeEventListener('resize', this.onWindowResize);
    this.engine?.stopRenderLoop();
    this.scene?.dispose();
    this.engine?.dispose();
    this.engine = null;
    this.scene = null;
    this.currentAvatarMeshes = [];
    this.currentAnimationGroups = [];
    this.shadowGenerator?.dispose();
    this.shadowGenerator = null;
  }

  private initBabylon(): void {
    const canvas = this.avatarCanvasRef.nativeElement;
    this.engine = new Engine(canvas, true, { stencil: true, antialias: true }, true);
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0, 0, 0, 0); // Transparante achtergrond voor de scene

    this.camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 7.0, new Vector3(0, 1.5, 0), this.scene);
    // De tweede parameter 'noPreventDefault' (default is false) bepaalt of preventDefault wordt aangeroepen.
    // 'false' (of weglaten) betekent dat Babylon.js preventDefault() zal aanroepen voor events die het afhandelt (zoals wheel, pointerdrag),
    // wat het scrollen van de pagina ZOU MOETEN voorkomen.
    // Als de pagina nog steeds scrollt, kan dit een dieper liggend probleem zijn in de event bubbling/capturing van de Angular app.
    this.camera.attachControl(canvas, false); // false = preventDefault wordt WEL gedaan door Babylon
    this.camera.lowerRadiusLimit = 1;
    this.camera.upperRadiusLimit = 50;
    // this.camera.wheelPrecision = 50; // Verwijderd: Gebruik Babylon.js default (3.0) voor potentieel betere gevoeligheid.
                                      // Een hogere waarde maakt het zoomen minder gevoelig.
    this.logger.info(`${this.logPrefix} Babylon ArcRotateCamera initialized. Target Y: 1.5, Radius: 7.0, UpperRadius: 50. Default wheelPrecision wordt gebruikt.`);
  }

  private setupCameraControls(): void {
    if (!this.camera || !this.avatarCanvasRef?.nativeElement) return;
    if (this.interactive()) {
      // Herbevestig attachControl, zorg dat noPreventDefault op false staat (of weggelaten wordt)
      // om pagina-scroll te proberen te voorkomen.
      this.camera.attachControl(this.avatarCanvasRef.nativeElement, false);
      this.logger.debug(`${this.logPrefix} Camera controls enabled (noPreventDefault=false).`);
    } else {
      this.camera.detachControl();
      this.logger.debug(`${this.logPrefix} Camera controls disabled.`);
    }
  }

  private cleanupSceneContent(): void {
    this.currentAvatarMeshes.forEach(mesh => mesh.dispose(false, true));
    this.currentAvatarMeshes = [];
    this.currentEnvironmentMesh?.dispose(false, true);
    this.currentEnvironmentMesh = null;
    this.currentAnimationGroups.forEach(ag => ag.stop().dispose());
    this.currentAnimationGroups = [];
    this.defaultAnimation = null;
    this.logger.debug(`${this.logPrefix} Scene content (models, animations) cleaned up.`);
  }

  private async loadEnvironmentScene(): Promise<void> {
    if (!this.scene) return;
    const envSceneUrl = this.avatarConfig()?.environmentSceneUrl;

    if (this.currentEnvironmentMesh) {
        this.currentEnvironmentMesh.dispose(false, true);
        this.currentEnvironmentMesh = null;
    }

    if (envSceneUrl) {
      this.logger.info(`${this.logPrefix} Loading environment scene from: ${envSceneUrl}`);
      try {
        const result = await SceneLoader.ImportMeshAsync(null, "", envSceneUrl, this.scene);
        if (result.meshes.length > 0) {
          const envRoot = new TransformNode("__environmentRoot__", this.scene);
          result.meshes.forEach(mesh => {
            mesh.parent = envRoot;
            mesh.isPickable = false;
            mesh.receiveShadows = true;
          });
          this.currentEnvironmentMesh = envRoot;
          // BELANGRIJK VOOR POSITIONERING: Het environment model wordt op (0,0,0) geplaatst zonder schaling.
          // De grootte en 'grondniveau' van de environment moeten correct zijn in het 3D-model zelf.
          this.logger.debug(`${this.logPrefix} Environment scene loaded. Staat op (0,0,0).`);
        }
      } catch (error) {
        this.logger.error(`${this.logPrefix} Error loading environment scene:`, error);
      }
    } else if (this.lightingConfig()?.environmentTextureUrl && this.scene) {
        const hdrTexture = new CubeTexture(this.lightingConfig()!.environmentTextureUrl!, this.scene);
        this.scene.environmentTexture = hdrTexture;
        this.logger.info(`${this.logPrefix} Loaded HDRI environment texture: ${this.lightingConfig()!.environmentTextureUrl}`);
    }
  }

  private async loadAvatarModel(): Promise<void> {
    if (!this.scene) return;
    const config = this.avatarConfig();

    this.currentAvatarMeshes.forEach(mesh => mesh.dispose(false, true));
    this.currentAvatarMeshes = [];
    this.currentAnimationGroups.forEach(ag => ag.stop().dispose());
    this.currentAnimationGroups = [];
    this.defaultAnimation = null;

    if (!config || !config.modelUrl) {
      this.logger.warn(`${this.logPrefix} No avatar model URL.`);
      return;
    }

    this.logger.info(`${this.logPrefix} Loading avatar model from: ${config.modelUrl}`);
    try {
      const result = await SceneLoader.ImportMeshAsync(null, "", config.modelUrl, this.scene);
      if (result.meshes.length > 0) {
        this.currentAvatarMeshes = result.meshes;
        const rootMesh = result.meshes[0];

        // SCALING: Avatar wordt geschaald volgens config.scale (default 0.25).
        // Als de avatar en "wereld" even groot lijken, pas config.scale aan in de `home.component.ts`
        // of pas de grootte van het environment model aan in 3D software.
        const desiredScale = config.scale ?? 0.25;
        rootMesh.scaling = new Vector3(desiredScale, desiredScale, desiredScale);
        this.logger.info(`${this.logPrefix} Avatar model scale set to: ${desiredScale}. Pas dit aan in config indien nodig.`);

        // POSITIONERING: Avatar positie wordt gezet via config.position.
        // Voorbeeld uit home.component.ts is y: -0.8. Dit is CRUCIAAL om de avatar
        // correct OP de environment te plaatsen (ervan uitgaande dat environment op y=0 is).
        // Als avatar "achter" de wereld staat, check de Z-waarde in config.position en camera setup.
        rootMesh.position = new Vector3(
          config.position?.x ?? 0,
          config.position?.y ?? 0, // In home.component.ts is dit -0.8
          config.position?.z ?? 0
        );
        this.logger.info(`${this.logPrefix} Avatar model position set to (X:${rootMesh.position.x}, Y:${rootMesh.position.y}, Z:${rootMesh.position.z}). Pas config.position aan in home.component.ts om de avatar correct te plaatsen t.o.v. de environment.`);

        if (config.rotation) {
          rootMesh.rotationQuaternion = null;
          rootMesh.rotation = new Vector3(config.rotation.x, config.rotation.y, config.rotation.z);
        }

        result.meshes.forEach(mesh => {
          mesh.isPickable = this.interactive();
          mesh.receiveShadows = true;
          if (this.shadowGenerator && mesh instanceof Mesh) {
             this.shadowGenerator.addShadowCaster(mesh, true);
          }
        });

        this.currentAnimationGroups = result.animationGroups;
        if (this.currentAnimationGroups.length > 0) {
          // ... (animatielogica blijft hetzelfde) ...
          this.logger.debug(`${this.logPrefix} Available animation groups:`, this.currentAnimationGroups.map(ag => ag.name));
          let animToPlay: AnimationGroup | undefined;
          if (config.defaultAnimationClipName) {
            animToPlay = this.currentAnimationGroups.find(ag => ag.name === config.defaultAnimationClipName);
          }
          if (!animToPlay) {
            animToPlay = this.currentAnimationGroups.find(ag => ag.name.toLowerCase().includes("idle"));
            if (!animToPlay) animToPlay = this.currentAnimationGroups[0];
          }

          if (animToPlay) {
            this.defaultAnimation = animToPlay;
            this.defaultAnimation.start(true, 1.0, this.defaultAnimation.from, this.defaultAnimation.to, false);
            this.logger.info(`${this.logPrefix} Playing animation: ${animToPlay.name}`);
          } else {
            this.logger.warn(`${this.logPrefix} No animation to play for ${config.modelUrl}.`);
          }
        } else {
          this.logger.warn(`${this.logPrefix} No animation groups found in ${config.modelUrl}.`);
        }
        this.updateCameraForDisplayMode();
      }
    } catch (error) {
      this.logger.error(`${this.logPrefix} Error loading avatar model:`, error);
    }
  }

  private setupLighting(): void {
    // ... (lighting setup blijft hetzelfde) ...
    if (!this.scene) return;
    const lightsToRemove = this.scene.lights.filter(light => {
        return !(this.currentEnvironmentMesh && this.currentEnvironmentMesh.getDescendants(true).includes(light as any));
    });
    lightsToRemove.forEach(light => light.dispose());
    this.shadowGenerator?.dispose();
    this.shadowGenerator = null;

    if (this.scene.environmentTexture) {
        this.logger.info(`${this.logPrefix} Using environment texture for lighting. Adding subtle HemisphericLight.`);
        const hemi = new HemisphericLight("subtleHemiLight", new Vector3(0, 1, 0), this.scene);
        hemi.intensity = this.lightingConfig()?.hemisphericLight?.intensity ?? 0.2;
        hemi.diffuse = Color3.FromHexString(this.lightingConfig()?.hemisphericLight?.skyColor ?? '#ffffff');
        hemi.groundColor = Color3.FromHexString(this.lightingConfig()?.hemisphericLight?.groundColor ?? '#404040');
        return;
    }

    const config = this.lightingConfig();
    this.logger.debug(`${this.logPrefix} Setting up lighting. Config:`, config);

    const hemiIntensity = config?.hemisphericLight?.intensity ?? 0.8;
    const hemiDirection = config?.hemisphericLight?.direction ?? { x: 0, y: 1, z: 0 };
    const skyColor = config?.hemisphericLight?.skyColor ?? '#ffffff';
    const groundColor = config?.hemisphericLight?.groundColor ?? '#404040';

    const hemisphericLight = new HemisphericLight(
      "hemisphericLight",
      new Vector3(hemiDirection.x, hemiDirection.y, hemiDirection.z),
      this.scene
    );
    hemisphericLight.intensity = hemiIntensity;
    hemisphericLight.diffuse = Color3.FromHexString(skyColor);
    hemisphericLight.groundColor = Color3.FromHexString(groundColor);
    this.logger.debug(`${this.logPrefix} Hemispheric light added.`);

    if (config?.directionalLight) {
      const dirLightConfig = config.directionalLight;
      const dirIntensity = dirLightConfig.intensity ?? 1.0;
      const dirDirection = dirLightConfig.direction ?? { x: -0.5, y: -1, z: -0.5 };
      const dirColor = dirLightConfig.color ?? '#ffffff';

      const directionalLight = new DirectionalLight(
        "directionalLight",
        new Vector3(dirDirection.x, dirDirection.y, dirDirection.z),
        this.scene
      );
      directionalLight.intensity = dirIntensity;
      directionalLight.diffuse = Color3.FromHexString(dirColor);

      if (!this.shadowGenerator) {
        this.shadowGenerator = new ShadowGenerator(1024, directionalLight);
        this.shadowGenerator.useExponentialShadowMap = true;
      }
      this.logger.debug(`${this.logPrefix} Directional light added/updated.`);
    }
  }

  private updateCameraForDisplayMode(): void {
    // ... (camera update for display mode blijft hetzelfde) ...
    if (!this.camera || this.currentAvatarMeshes.length === 0) return;

    const mode = this.displayMode();
    this.logger.debug(`${this.logPrefix} Updating camera for display mode: ${mode}`);

    const avatarRootMesh = this.currentAvatarMeshes[0];
    let targetY = avatarRootMesh.position.y;
    try {
        const boundingInfo = avatarRootMesh.getHierarchyBoundingVectors(true);
        const modelHeight = boundingInfo.max.y - boundingInfo.min.y;
        targetY = boundingInfo.min.y + modelHeight / 2; // Midden van de avatar
        // Als de avatar's Y positie (origin) op -0.8 staat (zoals in home.component), en de avatar is 1.6 units hoog,
        // dan is min.y = -0.8, max.y = 0.8. Het midden is dan 0. Dit is een goed target voor de camera.
    } catch(e) {
        this.logger.warn(`${this.logPrefix} Could not get bounding vectors for camera target, using root mesh Y. Dit kan problemen geven met "wereld loopt verticaal mee" als Y niet correct is.`);
    }
    this.camera.target.set(avatarRootMesh.position.x, targetY, avatarRootMesh.position.z);

    if (mode === 'equipment') {
      this.camera.radius = 2.0;
      this.camera.beta = Math.PI / 2.2;
      this.logger.info(`${this.logPrefix} Camera for EQUIPMENT: Radius=2.0, Beta=${this.camera.beta}, TargetY=${targetY}`);
    } else {
      this.camera.radius = 7.0;
      this.camera.beta = Math.PI / 2.5;
      this.camera.alpha = Math.PI / 2;
      this.logger.info(`${this.logPrefix} Camera for AVATAR: Radius=7.0, Beta=${this.camera.beta}, TargetY=${targetY}`);
    }
  }

  private onWindowResize = (): void => {
    this.engine?.resize();
    this.logger.debug(`${this.logPrefix} Window resized.`);
  };
}
