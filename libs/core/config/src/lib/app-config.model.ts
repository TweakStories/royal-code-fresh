export interface AppConfig {
  production: boolean;
  apiUrl: string;
  backendUrl: string;
  mediaUpload: {
    maxFiles: number;
    allowedImageTypes: string[];
    maxSizeMb: number;
  };
}
