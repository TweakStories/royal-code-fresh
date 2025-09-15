/**
 * @file admin-user-mapping.service.ts
 * @version 1.1.0 (Corrected DateTime Handling)
 * @author Royal-Code MonorepoAppDevAI
 * @date 2025-08-30
 * @description Provides mapping logic between AdminUser DTOs and AdminUser domain models.
 *              This version corrects the creation of DateTimeInfo objects to use the
 *              DateTimeUtil helper, ensuring serializable state for NgRx.
 */
import { Injectable } from '@angular/core';
import { AdminUserDetailDto, AdminUserListItemDto, AdminUser } from '@royal-code/features/admin-users/domain';
import { DateTimeUtil } from '@royal-code/shared/utils';

@Injectable({ providedIn: 'root' })
export class AdminUserMappingService {

  mapListItemToAdminUser(dto: AdminUserListItemDto): AdminUser {
    return {
      id: dto.id,
      displayName: dto.displayName,
      fullName: dto.fullName, 
      email: dto.email,
      roles: dto.roles || [],
      isLockedOut: dto.isLockedOut,
      // --- DE FIX: Gebruik DateTimeUtil voor serialiseerbare objecten ---
      createdAt: DateTimeUtil.createDateTimeInfo(dto.createdAt),
      firstName: '', 
      lastName: '',
      middleName: null,
      bio: null,
      emailConfirmed: false,
      lockoutEnd: null,
      accessFailedCount: 0,
    };
  }

mapDetailDtoToAdminUser(dto: AdminUserDetailDto): AdminUser {
    return {
        id: dto.id,
        displayName: dto.displayName,
        fullName: `${dto.firstName || ''} ${dto.lastName || ''}`.trim(),
        email: dto.email,
        roles: dto.roles || [],
        isLockedOut: dto.isLockedOut,
        // --- DE FIX: Gebruik DateTimeUtil voor serialiseerbare objecten ---
        createdAt: DateTimeUtil.createDateTimeInfo(), // DTO heeft geen createdAt, dus we nemen 'nu' als fallback
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,
        bio: dto.bio,
        emailConfirmed: dto.emailConfirmed,
        // --- DE FIX: Gebruik DateTimeUtil voor serialiseerbare objecten ---
        lockoutEnd: dto.lockoutEnd ? DateTimeUtil.createDateTimeInfo(dto.lockoutEnd) : null,
        accessFailedCount: dto.accessFailedCount,
    };
}

}