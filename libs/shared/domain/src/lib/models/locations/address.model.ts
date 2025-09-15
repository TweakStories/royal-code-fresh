/**
 * @file address.model.ts
 * @Version 3.1.0 (DEFINITIVE: displayName REMOVED for clarity)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-06
 * @Description
 *   Definitieve versie van de `Address` interface. De `displayName` property is
 *   verwijderd om consistentie te garanderen met backend DTO's die doorgaans
 *   'contactName' als de primaire displaynaam gebruiken. Dit model is de
 *   enige bron van waarheid voor 'Address' door de hele applicatie.
 */
import { AuditableEntityBase } from "../../base/auditable-entity-base.model";

export interface Address extends AuditableEntityBase {
  id: string;
  userId?: string; // Optioneel, kan null zijn voor anonieme bestellingen.
  contactName: string;
  street: string;
  houseNumber: string;
  addressAddition?: string | null;
  city: string;
  postalCode: string;
  countryCode: string;
  phoneNumber?: string | null;
  email?: string | null;
  companyName?: string | null;
  deliveryInstructions?: string | null;
  isDefaultShipping?: boolean; // Optioneel (boolean | undefined)
  isDefaultBilling?: boolean;  // Optioneel (boolean | undefined)
}