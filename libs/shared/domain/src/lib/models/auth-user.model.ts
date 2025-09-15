export interface AuthUser {
  id: string;
  userName: string;
  email: string;
  phoneNumber: string;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd: Date;
  lockoutEnabled: boolean;
  accessFailedCount: number;
  roles: Roles[];
}

export enum Roles {
  Default = 'default',
  Administrator = 'administrator',
  User = 'User'
}
