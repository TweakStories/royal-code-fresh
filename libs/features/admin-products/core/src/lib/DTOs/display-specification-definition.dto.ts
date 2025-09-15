import { AppIcon } from "@royal-code/shared/domain";

export interface DisplaySpecificationDefinitionDto {
  readonly id: string;
  readonly specKey: string;
  readonly labelKeyOrText: string;
  readonly icon: AppIcon | string;
  readonly groupKeyOrText: string;
  readonly displayOrder: number;
}