/**
 * @file auditable-entity-base.model.ts
 * @Version 1.0.2 (Corrected property names for backend consistency)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2024-06-23
 * @Description Definieert de basisinterface voor entiteiten die auditinformatie bevatten,
 *              zoals aanmaak- en laatste wijzigingsgegevens. Deze interface komt overeen
 *              met de backend <c>BaseAuditableEntity</c> om consistentie te garanderen.
 *              Auditvelden zijn hier optioneel gemaakt om flexibiliteit te bieden bij
 *              gedeeltelijke DTO's of creatiepayloads, en de namen matchen nu exact de backend.
 */
import { DateTimeInfo } from './common.model';

/**
 * @interface AuditableEntityBase
 * @description Basisinterface voor frontend-modellen die auditinformatie weerspiegelen
 *              van de backend <c>BaseAuditableEntity</c>.
 */
export interface AuditableEntityBase {
  /**
   * @property id
   * @description De unieke identifier van de entiteit. Matcht <c>BaseEntity.Id</c> van de backend.
   */
  id: string; // Backend int Id wordt typisch string in TypeScript voor JSON-compatibiliteit (GUIDs zijn al string)

  /**
   * @property createdAt
   * @description Optioneel: Tijdstempel van wanneer de entiteit is aangemaakt.
   *              Komt overeen met backend <c>Created</c>.
   */
  createdAt?: DateTimeInfo;

  /**
   * @property createdBy
   * @description Optioneel: Identifier van de gebruiker die de entiteit heeft aangemaakt.
   *              Komt overeen met backend <c>CreatedBy</c>.
   */
  createdBy?: string | null;

  /**
   * @property lastModified
   * @description Optioneel: Tijdstempel van de laatste wijziging van de entiteit.
   *              Komt overeen met backend <c>LastModified</c>.
   */
  lastModified?: DateTimeInfo; // ~ Hernoemd van 'updatedAt' naar 'lastModified'

  /**
   * @property lastModifiedBy
   * @description Optionele identifier van de gebruiker die de entiteit voor het laatst heeft gewijzigd.
   *              Komt overeen met backend <c>LastModifiedBy</c>.
   */
  lastModifiedBy?: string | null; // ~ Hernoemd van 'updatedBy' naar 'lastModifiedBy'
}
