/**
 * @file ui-document.component.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2024-05-23
 * @GeneratedBy Royal-Code MonorepoAppDevAI
 * @GeneratedDate 2024-05-23
 * @PromptSummary Initial generation of the UiDocumentComponent for displaying links to documents and archives.
 * @Description A standalone Angular component for rendering a link to a document or archive file.
 *              It displays a relevant icon, file name, and file size, providing a consistent
 *              user interface for downloadable media. It accepts a `DocumentMedia` or `ArchiveMedia` object.
 */
import { Component, ChangeDetectionStrategy, input, computed, Signal, InputSignal } from '@angular/core';

import { DocumentMedia, ArchiveMedia } from '@royal-code/shared/domain';
import { AppIcon } from '@royal-code/shared/domain'; // Importeer de gedeelde icon enum
import { UiIconComponent } from '@royal-code/ui/icon'; // Importeer de UI Icon component

/** De component accepteert een union van de relevante media types. */
export type DownloadableMedia = DocumentMedia | ArchiveMedia;

@Component({
  selector: 'royal-code-ui-document',
  standalone: true,
  imports: [UiIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- De container is een klikbare link die het bestand opent/downloadt. -->
    <a
      [href]="document().url"
      target="_blank"
      rel="noopener noreferrer"
      [download]="document().originalFilename || ''"
      class="rc-document-wrapper group flex items-center gap-4 p-4 bg-muted border border-border rounded-xs transition-colors hover:bg-border/50 hover:border-primary/50"
      [attr.aria-label]="'Download ' + (document().title || document().originalFilename)">

      <!-- Icoon dat het bestandstype representeert. -->
      <div class="flex-shrink-0 text-primary group-hover:scale-110 transition-transform">
        <royal-code-ui-icon [icon]="fileIcon()" sizeVariant="xl" />
      </div>

      <!-- Bestandsinformatie: titel en grootte. -->
      <div class="flex-grow min-w-0">
        <p class="font-semibold text-foreground truncate" [title]="document().title || document().originalFilename">
          {{ document().title || document().originalFilename || 'Onbekend document' }}
        </p>
        @if (formattedFileSize()) {
          <p class="text-sm text-muted-foreground">
            {{ formattedFileSize() }}
          </p>
        }
      </div>

      <!-- Download-icoon aan de rechterkant. -->
      <div class="flex-shrink-0 text-muted-foreground/70 group-hover:text-primary transition-colors">
        <royal-code-ui-icon [icon]="AppIcon.Download" sizeVariant="lg" />
      </div>
    </a>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class UiDocumentComponent {
  /** Het DocumentMedia of ArchiveMedia domeinobject. */
  readonly document: InputSignal<DownloadableMedia> = input.required<DownloadableMedia>();

  /** Exposeert de AppIcon enum voor intern gebruik. */
  protected readonly AppIcon = AppIcon;

  /**
   * @description Bepaalt welk icoon getoond moet worden op basis van de file extension.
   * @returns Een `AppIcon` enum waarde.
   */
  readonly fileIcon: Signal<AppIcon> = computed(() => {
    const extension = this.document().fileExtension?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return AppIcon.FilePdf;
      case 'doc':
      case 'docx':
        return AppIcon.FileWord;
      case 'xls':
      case 'xlsx':
        return AppIcon.FileSpreadsheet;
      case 'ppt':
      case 'pptx':
        return AppIcon.FilePpt;
      case 'zip':
      case 'rar':
      case '7z':
        return AppIcon.FileArchive;
      case 'txt':
        return AppIcon.FileText;
      default:
        return AppIcon.File; // Generiek bestandsicoon
    }
  });

  /**
   * @description Formatteert de bestandsgrootte in bytes naar een leesbaar formaat (KB, MB, GB).
   * @returns Een geformatteerde string of null als de grootte onbekend is.
   */
  readonly formattedFileSize: Signal<string | null> = computed(() => {
    const bytes = this.document().fileSizeBytes;
    if (bytes === undefined || bytes === null || bytes === 0) {
      return null;
    }

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString(), 10);
    return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
  });
}
