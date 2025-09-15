// libs/models-state/src/lib/models/user-application-settings.ts

export type MediaGalleryView = 'sidebarView' | 'infiniteGridView';

export interface ApplicationSettings {
  mapViewSelected: boolean;
  mediaGalleryView: MediaGalleryView;
  // Add other settings as needed
}
