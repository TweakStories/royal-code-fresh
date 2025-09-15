import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  input
} from '@angular/core';
import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  Vector3, Color3,
  MeshBuilder,
  StandardMaterial
} from '@babylonjs/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { NodeType } from '@royal-code/shared/domain';

@Component({
  selector: 'lib-node-marker',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas [attr.id]="markerId()" class="w-[50px] h-[50px]"></canvas>`
})
export class NodeMarkerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  nodeType = input.required<NodeType>();
  markerId = input<string>(); // Bijvoorbeeld "babylon-canvas-<nodeId>"
  modelScaling = input<number>(0.5);

  private engine!: Engine;
  private scene!: Scene;

  ngAfterViewInit(): void {
    this.engine = new Engine(this.canvasRef.nativeElement, true, { preserveDrawingBuffer: true, stencil: true });
    this.scene = new Scene(this.engine);
    const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 2, 3, Vector3.Zero(), this.scene);
    camera.attachControl(this.canvasRef.nativeElement, false);
    new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);

    // Maak een rode disc als testmarker
    const disc = MeshBuilder.CreateDisc("disc", { radius: 1, tessellation: 32 }, this.scene);
    const redMat = new StandardMaterial("redMat", this.scene);
    redMat.diffuseColor = new Color3(1, 0, 0);
    disc.material = redMat;
    disc.rotation.x = Math.PI / 2;

    this.engine.runRenderLoop(() => {
      disc.rotation.z += 0.01;
      this.scene.render();
    });

    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  ngOnDestroy(): void {
    this.scene.dispose();
    this.engine.dispose();
  }
}
