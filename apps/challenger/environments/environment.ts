// environment.ts
export const environment = {
  production: false,
  apiUrl: '/api',
  mediaUpload: {
    maxFiles: 50,
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSizeMb: 10
  }
};
