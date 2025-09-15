import { Injectable, Injector, inject } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { DYNAMIC_OVERLAY_DATA, DYNAMIC_OVERLAY_REF, DynamicOverlayConfig, DynamicOverlayRef } from './dynamic-overlay.tokens';

@Injectable({ providedIn: 'root' })
export class DynamicOverlayService {
    public readonly overlay = inject(Overlay);
    private rootInjector = inject(Injector);

       open<R = any, C = any>(config: DynamicOverlayConfig<any>): DynamicOverlayRef<R, C> {
        // --- DE DEFINITIEVE, VEREENVOUDIGDE LOGICA ---
        const overlayConfig = new OverlayConfig({
            hasBackdrop: true,
            backdropClass: 'royal-code-dark-backdrop', // Onze betrouwbare backdrop class
            panelClass: ['dynamic-overlay-panel', ...(Array.isArray(config.panelClass) ? config.panelClass : config.panelClass ? [config.panelClass] : [])],
            positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
            scrollStrategy: this.overlay.scrollStrategies.block(),
            width: config.width,
            maxWidth: config.maxWidth,
            height: config.height,
        });

        const overlayRef = this.overlay.create(overlayConfig);
        const afterClosedSubject = new Subject<R | undefined>();
        
        const dynamicOverlayRef: DynamicOverlayRef<R, C> = {
            data: config.data ?? null,
            afterClosed$: afterClosedSubject.asObservable().pipe(take(1)),
            close: (result?: R) => {
                afterClosedSubject.next(result);
                afterClosedSubject.complete();
                overlayRef.dispose();
            },
            componentInstance: undefined,
        };

        const injector = Injector.create({
            providers: [
                { provide: DYNAMIC_OVERLAY_DATA, useValue: dynamicOverlayRef.data },
                { provide: DYNAMIC_OVERLAY_REF, useValue: dynamicOverlayRef },
            ],
            parent: this.rootInjector,
        });

        // GEEN DynamicOverlayContainerComponent meer. Render de content component DIRECT.
        const portal = new ComponentPortal(config.component, null, injector);
        const componentRef = overlayRef.attach(portal);
        dynamicOverlayRef.componentInstance = componentRef.instance as C;

        if (config.closeOnClickOutside !== false) {
            overlayRef.backdropClick().pipe(take(1)).subscribe(() => dynamicOverlayRef.close());
        }

        return dynamicOverlayRef;
    }
}