/**
 * @file media-uploader.component.ts
 * @Version 4.1.0 (Dumb Component - Compiler Fixes)
 * @Author Royal-Code MonorepoAppDevAI & User
 * @Date 2025-08-08
 * @Description
 *   Een 'domme' presentatiecomponent die bestanden selecteert en deze doorgeeft
 *   via een output. Het bevat geen state management of API-logica meer.
 *   Deze versie lost de compilerfouten met `allowedTypes` en `transform` op.
 */
import { Component, ChangeDetectionStrategy, output, inject, ElementRef, viewChild, input, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiIconComponent } from '@royal-code/ui/icon';
import { AppIcon } from '@royal-code/shared/domain';
import { NotificationService } from '@royal-code/ui/notifications';
import { APP_CONFIG } from '@royal-code/core/config';

@Component({
  selector: 'media-uploader',
  standalone: true,
  imports: [CommonModule, UiIconComponent],
  template: `
    <div
      class="border-2 border-dashed border-border rounded-xs p-6 text-center cursor-pointer hover:border-primary hover:bg-hover transition-colors"
      (click)="triggerFileInput()"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)">
      <input #fileInput type="file" class="hidden" multiple [attr.accept]="allowedTypesAcceptAttribute()" (change)="onFileSelected($event)">
      <royal-code-ui-icon [icon]="AppIcon.Upload" sizeVariant="lg" extraClass="text-secondary mx-auto mb-2" />
      <p class="text-sm text-foreground">Sleep bestanden hierheen of <span class="font-semibold text-primary">klik om te bladeren</span></p>
      <p class="text-xs text-secondary mt-1">PNG, JPG, WEBP tot {{ maxFileSizeMb() }}MB</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaUploaderComponent {
  readonly filesSelected = output<File[]>();
  readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  private readonly notificationService = inject(NotificationService);
  private readonly appConfig = inject(APP_CONFIG);

  protected readonly AppIcon = AppIcon;
  readonly maxFileSizeMb = input(10);
  // DE FIX: Declaratie is nu een zuivere string[]
  readonly allowedTypes = input<string[]>(['image/jpeg', 'image/png', 'image/webp']);

  // DE FIX: Nieuwe computed property die de array omzet naar een string voor de 'accept' attribuut
  readonly allowedTypesAcceptAttribute: Signal<string> = computed(() => {
    return this.allowedTypes().join(',');
  });

  triggerFileInput(): void {
    this.fileInput().nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
      input.value = ''; // Reset input
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement)?.classList.add('border-primary', 'bg-hover');
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement)?.classList.remove('border-primary', 'bg-hover');
  }

  onDrop(event: DragEvent): void {
    this.onDragLeave(event); // Reuse leave logic to remove styles
    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  private handleFiles(files: FileList): void {
    const validFiles: File[] = [];
    // DE FIX: Lees de toegestane types direct uit de input (wat nu een string[] is)
    const allowedTypesArray = this.allowedTypes(); 
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!allowedTypesArray.includes(file.type)) {
        this.notificationService.showError(`Bestandstype '${file.type}' is niet toegestaan.`);
        continue;
      }
      if (file.size > (this.maxFileSizeMb() * 1024 * 1024)) {
        this.notificationService.showError(`Afbeelding '${file.name}' is te groot.`);
        continue;
      }
      validFiles.push(file);
    }
    
    if (validFiles.length > 0) {
      this.filesSelected.emit(validFiles);
    }
  }
}