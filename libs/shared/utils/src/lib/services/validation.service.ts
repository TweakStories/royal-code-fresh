/**
 * @file validation.service.ts
 * @Version 1.0.0
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-08-07
 * @Description A reusable service to extract user-friendly validation errors from a FormGroup.
 */
import { Injectable, inject } from '@angular/core';
import { FormGroup, AbstractControl, FormArray } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ValidationError } from '@royal-code/shared/domain';

@Injectable({ providedIn: 'root' })
export class ValidationService {
  private readonly translate = inject(TranslateService);

  /**
   * Recursively traverses a FormGroup and returns a list of all validation errors.
   * @param formGroup The FormGroup to inspect.
   * @param controlLabels A map of control names/paths to their translation keys.
   * @returns An array of ValidationError objects.
   */
  public getFormErrors(formGroup: FormGroup, controlLabels: Record<string, string>): ValidationError[] {
    const errors: ValidationError[] = [];
    this.findErrorsRecursive(formGroup, controlLabels, errors);
    return errors;
  }

  private findErrorsRecursive(
    control: AbstractControl,
    labels: Record<string, string>,
    errorList: ValidationError[],
    path = ''
  ): void {
    if (control instanceof FormGroup) {
      Object.keys(control.controls).forEach(key => {
        const newPath = path ? `${path}.${key}` : key;
        this.findErrorsRecursive(control.get(key) as AbstractControl, labels, errorList, newPath);
      });
    } else if (control instanceof FormArray) {
      control.controls.forEach((c, index) => {
        const newPath = `${path}[${index}]`; // We gebruiken dit pad niet direct voor labels, maar het is goed voor debuggen
        this.findErrorsRecursive(c, labels, errorList, newPath);
      });
    }

    if (control.invalid && control.errors) {
      const labelKey = labels[path] || path;
      const label = this.translate.instant(labelKey);
      
      Object.keys(control.errors).forEach(errorKey => {
        // Alleen de eerste fout per veld tonen om de gebruiker niet te overweldigen.
        if (!errorList.some(e => e.label === label)) {
           errorList.push({
            label,
            message: this.getErrorMessageForError(errorKey),
          });
        }
      });
    }
  }

  private getErrorMessageForError(errorKey: string): string {
    // Deze switch kan worden uitgebreid met meer specifieke validatieregels
    switch (errorKey.toLowerCase()) {
      case 'required':
        return this.translate.instant('common.errors.validation.requiredField');
      case 'email':
        return this.translate.instant('common.errors.validation.invalidEmail');
      case 'min':
        // Hier zou je de error value kunnen gebruiken: `control.errors['min'].min`
        return this.translate.instant('common.errors.validation.minValue');
      case 'priceinvalid':
         return this.translate.instant('admin.products.form.priceCannotBeHigherThanOriginal');
      default:
        return this.translate.instant('common.errors.validation.invalidField');
    }
  }
}