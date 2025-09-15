/**
 * @file admin-roles.models.ts
 * @version 3.0.0 (With Permissions)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-07-29
 * @description Models and Payloads for role and permission management.
 */

export interface Permission {
  readonly value: string;
  readonly description: string;
}

export interface Role {
  readonly id: string;
  name: string;
  permissions?: readonly Permission[]; // Permissions for a specific role
}

export interface CreateRolePayload {
  name: string;
}

export interface UpdateRolePayload {
  id: string;
  name: string;
}

export interface UpdateRolePermissionsPayload {
  roleId: string;
  permissions: string[]; // Array of permission values
}