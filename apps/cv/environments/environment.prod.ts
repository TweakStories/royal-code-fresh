// environment.prod.ts

export const environment = {
  production: true,
  apiUrl: 'https://jouw-productie-api.com/api',
  mediaUpload: {
    maxFiles: 4,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxSizeMb: 10
  }
};
