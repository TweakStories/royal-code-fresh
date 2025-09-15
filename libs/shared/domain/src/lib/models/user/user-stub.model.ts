/**
 * @file libs/shared/domain/src/lib/models/user/user-stub.model.ts
 * @Version 1.0.3 (Redundancy Removed - Extends AuditableEntityBase Correctly)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-03
 * @Description Een minimale representatie van een gebruiker, geschikt voor algemeen gebruik
 *              zonder afhankelijkheid van de volledige sociale profiel-functionaliteit.
 *              Nu correct uitgebreid met `AuditableEntityBase` zonder redundante velden.
 */
import { Image } from '../media/media.model';
import { AuditableEntityBase } from "../../base/auditable-entity-base.model"; 

/**
 * @interface IUserStub
 * @description Een minimale representatie van een gebruiker, geschikt voor algemeen gebruik
 *              zonder afhankelijkheid van de volledige sociale profiel-functionaliteit.
 *              Voorkomt circulaire afhankelijkheden.
 */
export interface IUserStub extends AuditableEntityBase {
  displayName: string;
  avatar?: Image;
}