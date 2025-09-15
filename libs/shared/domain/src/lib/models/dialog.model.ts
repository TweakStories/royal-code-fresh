// libs\shared\domain\src\lib\models\dialog.model.ts
// De `ConfirmationDialogResult` hoeft hier niet geïmporteerd te worden, 
// omdat deze alleen gebruikt wordt in de `ConfirmationDialogComponent` (uit ui-notifications), 
// die het correct importeert vanuit `shared/domain`. 

import { ButtonType } from "../types/button.types";


export interface ConfirmationDialogData {
    titleKey?: string;
    messageKey?: string;
    confirmButtonKey?: string;
    confirmButtonType?: ButtonType;
    cancelButtonKey?: string;
}

export type ConfirmationDialogResult = boolean;

export interface ErrorDialogData {
    title: string;
    message: string;
}

export type ErrorDialogResult = 'closed';
