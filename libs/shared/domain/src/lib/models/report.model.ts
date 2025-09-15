import { AuditableEntityBase } from "../base/auditable-entity-base.model";

export interface Report extends AuditableEntityBase {
    id: string;
    reporterId: string; // Gebruiker die de melding heeft gedaan
    targetId: string; // ID van het bericht of de reactie die gerapporteerd is
    targetType: TargetType;
    reason: string; // Reden voor melding (bijv. spam, ongepast taalgebruik)
  }

  export enum TargetType {
    MESSAGE = 'message',
    COMMENT = 'comment',
  }
