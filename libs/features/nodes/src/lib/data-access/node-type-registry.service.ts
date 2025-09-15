// libs/nodes/data-access/src/lib/services/node-type-registry.service.ts (NIEUW of AANVULLEN)

import { Injectable, Type } from '@angular/core';
import { IconOptions as LeafletIconOptions } from 'leaflet';
import { DynamicOverlayConfig } from '@royal-code/ui/overlay';

// --- Import Overlay Components ---
// Importeer de *echte* overlay componenten hier
import { NodeChallengeInfoOverlayComponent } from '../components/node-challenge-info-overlay/node-challenge-info-overlay.component';
import { NodeType } from '@royal-code/shared/domain';
// Importeer placeholders (maak deze basis componenten aan in de respectievelijke features)

/**
 * @enum NodeInteractionType
 * @description Defines the primary interaction type when a user clicks a node marker.
 */
export enum NodeInteractionType {
  Overlay = 'overlay', // Opens a component in a dynamic overlay.
  Popup = 'popup',     // Shows a simple Leaflet popup (content defined here).
  Navigate = 'navigate', // Navigates using Angular Router.
  CustomAction = 'customAction', // Triggers a specific action defined in the container.
  None = 'none'        // No specific interaction defined (e.g., passive nodes like hazards).
}

/**
 * @interface NodeTypeConfig
 * @description Configuration object defining the UI representation and interaction
 *              behavior for a specific NodeType.
 */
export interface NodeTypeConfig {
  /** The node type this config applies to. */
  type: NodeType;

  /** Leaflet Icon options for the map marker. */
  iconOptions: LeafletIconOptions;

  /** The primary interaction type for this node. */
  interactionType: NodeInteractionType;

  /** Configuration for the overlay interaction (only if interactionType is 'Overlay'). */
  overlay?: {
    /** The component type to render in the overlay. */
    component: Type<any>;
    /** Default configuration for the DynamicOverlayService (can be overridden). */
    defaultOverlayConfig?: Partial<Omit<DynamicOverlayConfig, 'component' | 'data'>>;
    /** Optional function to generate default data payload based on the node. */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultData?: (node: any /* NodeSummary | NodeFull */) => any;
  };

  /** Function to generate content for a simple Leaflet popup (only if interactionType is 'Popup'). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  popupContent?: (node: any /* NodeSummary | NodeFull */) => string | HTMLElement;

  /** Function to generate the Angular Router navigation link array (only if interactionType is 'Navigate'). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigationTarget?: (node: any /* NodeSummary | NodeFull */) => any[];

  /** Identifier for a custom action to be handled by the container (only if interactionType is 'CustomAction'). */
  customActionIdentifier?: string;
}


// --- Icon Helper ---
const createIconOptions = (url: string, size: [number, number] = [32, 32]): LeafletIconOptions => ({
    iconUrl: `assets/nodes/${url}`, // Zorg dat deze assets bestaan!
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]], // Center bottom
    popupAnchor: [0, -size[1]]
});

// --- Default Overlay Configs (DRY) ---
const DEFAULT_INFO_OVERLAY_CONFIG: Partial<Omit<DynamicOverlayConfig, 'component' | 'data'>> = {
    maxWidth: '420px', mobileFullscreen: true, positionStrategy: 'global-center', backdropType: 'transparent', closeOnClickOutside: true, panelClass: ['node-info-overlay-panel', 'm-4', 'rounded-xs']
};
const FULLSCREEN_SHOP_OVERLAY_CONFIG: Partial<Omit<DynamicOverlayConfig, 'component' | 'data'>> = {
    width: '100vw', height: '100vh', mobileFullscreen: true, positionStrategy: 'global-center', backdropType: 'dark', closeOnClickOutside: false, panelClass: ['shop-overlay-panel'] // Geen margin/radius
};
const DEFAULT_POPUP_OVERLAY_CONFIG: Partial<Omit<DynamicOverlayConfig, 'component' | 'data'>> = {
    maxWidth: '300px', backdropType: 'transparent', closeOnClickOutside: true, positionStrategy: 'connected' // Needs origin in container
};

// --- Configurations Array ---
const NODE_TYPE_CONFIGURATIONS: ReadonlyArray<NodeTypeConfig> = [
    // --- Challenge & Quest ---
    {
      type: NodeType.START,
      iconOptions: createIconOptions('node-challenge-start.webp', [36, 36]),
      interactionType: NodeInteractionType.Overlay,
      overlay: { component: NodeChallengeInfoOverlayComponent, defaultOverlayConfig: DEFAULT_INFO_OVERLAY_CONFIG }
    },
    {
      type: NodeType.CHECKPOINT,
      iconOptions: createIconOptions('node-checkpoint.webp'),
      interactionType: NodeInteractionType.Overlay, // Of misschien Popup voor snelle check?
      overlay: { component: NodeChallengeInfoOverlayComponent, defaultOverlayConfig: DEFAULT_INFO_OVERLAY_CONFIG } // Of specifieke CheckpointOverlay
    },
    {
      type: NodeType.FINISH, // Gebruik de FINISH enum waarde
      iconOptions: createIconOptions('node-finish.webp'),
      interactionType: NodeInteractionType.Overlay, // Of CustomAction 'triggerChallengeFinish'
      overlay: { component: NodeChallengeInfoOverlayComponent, defaultOverlayConfig: DEFAULT_INFO_OVERLAY_CONFIG } // Of ChallengeCompleteOverlay
    },
    {
      type: NodeType.QUEST, // Gebruik QUEST enum waarde
      iconOptions: createIconOptions('node-quest.webp'),
      interactionType: NodeInteractionType.Overlay,
      overlay: { component: NodeChallengeInfoOverlayComponent, defaultOverlayConfig: DEFAULT_INFO_OVERLAY_CONFIG } // Placeholder component
    },
    {
      type: NodeType.DISCOVERY,
      iconOptions: createIconOptions('node-dungeon.webp'), // Maak icoon
      interactionType: NodeInteractionType.Overlay,
      // overlay: { component: DungeonInfoOverlayComponent, defaultOverlayConfig: ... }
    },

    // --- Exploration & World ---
    {
      type: NodeType.POI,
      iconOptions: createIconOptions('node-poi.webp'),
      interactionType: NodeInteractionType.Overlay,
      overlay: { component: NodeChallengeInfoOverlayComponent, defaultOverlayConfig: DEFAULT_POPUP_OVERLAY_CONFIG } // Placeholder, popup-achtige stijl
    },
    {
      type: NodeType.DISCOVERY,
      iconOptions: createIconOptions('node-discovery.webp'), // Maak icoon (ster/sparkles)
      interactionType: NodeInteractionType.CustomAction, // Container handelt af (animatie + state update)
      customActionIdentifier: 'activateDiscoveryNode'
    },
    {
      type: NodeType.WAYPOINT,
      iconOptions: createIconOptions('node-waypoint.webp'), // Maak icoon (bv. kompasroos)
      interactionType: NodeInteractionType.Overlay, // Voor fast travel opties
      // overlay: { component: WaypointInteractionOverlayComponent, ... }
    },

    // --- Economy & Resource ---
    {
      type: NodeType.RESOURCE,
      iconOptions: createIconOptions('node-resource.webp'), // Maak icoon (pickaxe/plant)
      interactionType: NodeInteractionType.Overlay, // Om te verzamelen / info te tonen
      overlay: { component: NodeChallengeInfoOverlayComponent, defaultOverlayConfig: DEFAULT_POPUP_OVERLAY_CONFIG } // Placeholder
    },
    {
      type: NodeType.VENDOR, // Consistent met enum
      iconOptions: createIconOptions('node-shop.webp'),
      interactionType: NodeInteractionType.Overlay,
      overlay: { component: NodeChallengeInfoOverlayComponent, defaultOverlayConfig: FULLSCREEN_SHOP_OVERLAY_CONFIG } // Gebruik fullscreen config! Placeholder
    },
    // { type: NodeType.TRADING_POST, ... }, // Toekomst

    // --- Social & Community ---
    // { type: NodeType.COMMUNITY_HUB, ... },
    // { type: NodeType.GUILD_HALL, ... },

    // --- Strategy & Conflict ---
    // { type: NodeType.TERRITORY_CONTROL, ... },
    // { type: NodeType.WATCHTOWER, ... },
    // { type: NodeType.ARENA, ... },

    // --- Utility & Environmental ---
    // { type: NodeType.EVENT_SPAWN, ... },
    // { type: NodeType.SANCTUARY, interactionType: NodeInteractionType.Popup, popupContent: (n) => `Safe Zone: ${n.title}` },
    // { type: NodeType.HAZARD, interactionType: NodeInteractionType.Popup, popupContent: (n) => `Warning: ${n.title} - ${n.description}` },

    // --- Fallback ---
    {
      type: NodeType.UNKNOWN,
      iconOptions: createIconOptions('node-default.webp', [24, 24]),
      interactionType: NodeInteractionType.None,
    }
];

@Injectable({ providedIn: 'root' })
export class NodeTypeRegistryService {
    private configMap = new Map<NodeType, NodeTypeConfig>(
        NODE_TYPE_CONFIGURATIONS.map(config => [config.type, config])
    );
    private defaultUnknownConfig = NODE_TYPE_CONFIGURATIONS.find(c => c.type === NodeType.UNKNOWN)!;

    /** Haalt de volledige configuratie op, met fallback naar UNKNOWN. */
    getConfig(type: NodeType | undefined): NodeTypeConfig {
        return this.configMap.get(type ?? NodeType.UNKNOWN) ?? this.defaultUnknownConfig;
    }

    /** Haalt alleen de Leaflet Icon Options op, met fallback. */
    getIconOptions(type: NodeType | undefined): LeafletIconOptions {
        return this.getConfig(type).iconOptions;
    }

    /** Haalt de interactie-specifieke configuratie op. */
    getInteractionConfig(type: NodeType | undefined): {
        interactionType: NodeInteractionType;
        component?: Type<any>;
        defaultOverlayConfig?: Partial<Omit<DynamicOverlayConfig, 'component' | 'data'>>;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        popupContent?: (node: any) => string | HTMLElement;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        navigationTarget?: (node: any) => any[];
        customActionIdentifier?: string;
      } {
        const config = this.getConfig(type);
        return {
            interactionType: config.interactionType,
            component: config.overlay?.component,
            defaultOverlayConfig: config.overlay?.defaultOverlayConfig,
            popupContent: config.popupContent,
            navigationTarget: config.navigationTarget,
            customActionIdentifier: config.customActionIdentifier
        };
    }
}