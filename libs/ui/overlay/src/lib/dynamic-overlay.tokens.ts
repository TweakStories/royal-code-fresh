/**
 * @file dynamic-overlay.tokens.ts
 * @Version 3.0.0 (Definitive Fix: Interface-based Ref)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-07-24
 * @Description
 *   Vervangt de `DynamicOverlayRef` klasse met een `interface` om de hardnekkige
 *   `_overlayRef is read-only` fout te omzeilen. Dit patroon is robuuster voor DI.
 */
import { ConnectedPosition, OverlayConfig } from '@angular/cdk/overlay';
import { ElementRef, InjectionToken, Type } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * @description Injection token voor de data die aan de overlay wordt meegegeven.
 */
export const DYNAMIC_OVERLAY_DATA = new InjectionToken<any>('DYNAMIC_OVERLAY_DATA');

/**
 * @description De interface die de publieke API van een overlay referentie definieert.
 *              Componenten in de overlay gebruiken dit om zichzelf te sluiten en te communiceren.
 */
export interface DynamicOverlayRef<R = any, T = any> {
  /**
   * @description Een observable die een waarde uitzendt en voltooit wanneer de overlay wordt gesloten.
   */
  readonly afterClosed$: Observable<R | undefined>;

  /**
   * @description De data die is meegegeven bij het openen van de overlay.
   */
  readonly data: T | null;

  /**
   * @description De instantie van de component die binnen deze overlay is geladen.
   *              Gebruik dit om inputs in te stellen of outputs te subscriben.
   */
  componentInstance?: any; // <<-- VOEG DEZE REGEL TOE

  /**
   * @description Sluit de overlay en geeft optioneel een resultaat terug.
   * @param result Het resultaat dat wordt uitgezonden door `afterClosed$`.
   */
  close(result?: R): void;
}

/**
 * @description Injection token voor de `DynamicOverlayRef` instantie.
 */
export const DYNAMIC_OVERLAY_REF = new InjectionToken<DynamicOverlayRef<any>>('DYNAMIC_OVERLAY_REF');

export interface DynamicOverlayConfig<D = any> {
    component: Type<any>;
    data?: D;
    panelClass?: string | string[];
    backdropType?: 'dark' | 'transparent' | 'none';
    closeOnClickOutside?: boolean;
    mobileFullscreen?: boolean;
    positionStrategy?: 'global-center' | 'connected';
    origin?: ElementRef | HTMLElement;
    connectedPosition?: ConnectedPosition[];
    width?: string | number;
    maxWidth?: string | number;
    height?: string | number;
    overlayConfigOptions?: Partial<OverlayConfig>;
    disableCloseOnEscape?: boolean;
}
