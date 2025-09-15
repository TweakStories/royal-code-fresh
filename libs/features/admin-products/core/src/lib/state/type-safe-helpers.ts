/**
 * @file type-safe-helpers.ts
 * @Version 1.0.0 (NEW - TYPE SAFETY IMPROVEMENTS)
 * @Author Royal-Code MonorepoAppDevAI
 * @Date 2025-09-04  
 * @Description Type-safe helpers and error handling for the product form
 */

import { AbstractControl, FormGroup, FormArray } from "@angular/forms";
import { CreateProductPayload, UpdateProductPayload, CreateVariantOverrideDto } from "@royal-code/features/products/domain";

// === TYPE GUARDS ===
export function isValidProductPayload(payload: any): payload is CreateProductPayload | UpdateProductPayload {
  return payload && 
         typeof payload.name === 'string' && 
         payload.name.trim().length > 0 &&
         typeof payload.type === 'string';
}

export function isValidVariantOverride(override: any): override is CreateVariantOverrideDto {
  return override && 
         Array.isArray(override.tempAttributeValueIds) &&
         override.tempAttributeValueIds.length > 0 &&
         typeof override.price === 'number' &&
         override.price > 0;
}

export function hasValidVariantAttributes(attributes: any[]): boolean {
  return attributes.every(attr => 
    attr.tempId && 
    attr.nameKeyOrText && 
    Array.isArray(attr.values) && 
    attr.values.length > 0
  );
}

// === VALIDATION HELPERS ===
export class ProductFormValidator {
  static validatePayloadBeforeSubmit(payload: CreateProductPayload | UpdateProductPayload): ValidationResult {
    const errors: string[] = [];
    
    // Basic validation
    if (!payload.name?.trim()) {
      errors.push('Product name is required');
    }
    
    if (payload.name && payload.name.length > 255) {
      errors.push('Product name must be less than 255 characters');
    }
    
    // Variant validation
    if (payload.variantAttributes && payload.variantAttributes.length > 0) {
      if (!hasValidVariantAttributes(payload.variantAttributes)) {
        errors.push('All variant attributes must have valid names and values');
      }
      
      // Check for duplicate attribute names
      const attributeNames = payload.variantAttributes.map(a => a.nameKeyOrText);
      const duplicates = attributeNames.filter((name, index) => attributeNames.indexOf(name) !== index);
      if (duplicates.length > 0) {
        errors.push(`Duplicate attribute names found: ${duplicates.join(', ')}`);
      }
    }
    
    // Variant overrides validation
    if (payload.variantOverrides && payload.variantOverrides.length > 0) {
      const invalidOverrides = payload.variantOverrides.filter(o => !isValidVariantOverride(o));
      if (invalidOverrides.length > 0) {
        errors.push(`${invalidOverrides.length} variant override(s) have invalid data`);
      }
      
      // Check for duplicate SKUs
      const skus = payload.variantOverrides.map(o => o.sku).filter(Boolean);
      const duplicateSkus = skus.filter((sku, index) => skus.indexOf(sku) !== index);
      if (duplicateSkus.length > 0) {
        errors.push(`Duplicate SKUs found: ${duplicateSkus.join(', ')}`);
      }
      
      // Ensure at least one default variant
      const hasDefault = payload.variantOverrides.some(o => o.isDefault);
      if (!hasDefault) {
        errors.push('At least one variant must be set as default');
      }
    }
    
    // Physical product validation
    if (payload.physicalProductConfig) {
      const config = payload.physicalProductConfig;
      
      if (config.pricing) {
        if (!config.pricing.price || config.pricing.price <= 0) {
          errors.push('Product price must be greater than 0');
        }
        
        if (config.pricing.originalPrice && config.pricing.price && config.pricing.originalPrice < config.pricing.price) {
          errors.push('Original price cannot be lower than sale price');
        }
      }
      
      if (config.manageStock && (!payload.variantOverrides || payload.variantOverrides.length === 0)) {
        if (!config.stockQuantity || config.stockQuantity < 0) {
          errors.push('Stock quantity is required when managing stock');
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static validateVariantCombination(combination: any, index: number): ValidationResult {
    const errors: string[] = [];
    const prefix = `Variant ${index + 1}:`;
    
    if (!combination.sku?.trim()) {
      errors.push(`${prefix} SKU is required`);
    }
    
    if (!combination.price || combination.price <= 0) {
      errors.push(`${prefix} Price must be greater than 0`);
    }
    
    if (combination.originalPrice && combination.originalPrice < combination.price) {
      errors.push(`${prefix} Original price cannot be lower than sale price`);
    }
    
    if (!combination.attributes || !Array.isArray(combination.attributes) || combination.attributes.length === 0) {
      errors.push(`${prefix} Must have at least one attribute assignment`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// === ERROR HANDLING HELPERS ===
export class ProductFormErrorHandler {
  static handleApiError(error: any, context: string): string {
    console.error(`[ProductForm] API Error in ${context}:`, error);
    
    if (error?.status === 400) {
      if (error.error?.errors) {
        // Validation errors from backend
        const validationErrors = Object.values(error.error.errors).flat();
        return `Validation failed: ${validationErrors.join(', ')}`;
      }
      return error.error?.message || 'Invalid request data';
    }
    
    if (error?.status === 409) {
      return error.error?.message || 'Conflict: Resource already exists or has been modified';
    }
    
    if (error?.status === 422) {
      return error.error?.message || 'Business rule validation failed';
    }
    
    if (error?.status >= 500) {
      return 'Server error. Please try again later.';
    }
    
    return error?.message || 'An unexpected error occurred';
  }
  
  static extractValidationErrors(error: any): Record<string, string[]> {
    const errors: Record<string, string[]> = {};
    
    if (error?.error?.errors) {
      return error.error.errors;
    }
    
    if (error?.error?.message) {
      errors['general'] = [error.error.message];
    }
    
    return errors;
  }
}

// === SAFE CONVERSION HELPERS ===
export class SafeConverters {
  static toNumber(value: any, fallback: number = 0): number {
    const num = Number(value);
    return isNaN(num) ? fallback : num;
  }
  
  static toPositiveNumber(value: any, fallback: number = 0): number {
    const num = this.toNumber(value, fallback);
    return Math.max(0, num);
  }
  
  static toString(value: any, fallback: string = ''): string {
    return value != null ? String(value).trim() : fallback;
  }
  
  static toArray<T>(value: any, fallback: T[] = []): T[] {
    return Array.isArray(value) ? value : fallback;
  }
  
  static toNullableArray<T>(value: any): T[] | null {
    return Array.isArray(value) && value.length > 0 ? value : null;
  }
  
  static toBoolean(value: any, fallback: boolean = false): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    if (typeof value === 'number') return value !== 0;
    return fallback;
  }
}

// === FORM UTILITIES ===
export class FormUtils {
  static markFormGroupTouched(formGroup: AbstractControl): void {
    Object.keys((formGroup as any).controls || {}).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.markFormGroupTouched(control);
        }
      }
    });
  }
  
  static findFormErrors(formGroup: AbstractControl, errors: any[] = [], prefix: string = ''): any[] {
    Object.keys((formGroup as any).controls || {}).forEach(key => {
      const control = formGroup.get(key);
      const fieldName = prefix ? `${prefix}.${key}` : key;
      
      if (control && control.errors) {
        Object.keys(control.errors).forEach(errorKey => {
          errors.push({
            field: fieldName,
            error: errorKey,
            message: this.getErrorMessage(errorKey, fieldName)
          });
        });
      }
      
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.findFormErrors(control, errors, fieldName);
      }
    });
    
    return errors;
  }
  
  private static getErrorMessage(errorKey: string, fieldName: string): string {
    const fieldDisplayName = fieldName.split('.').pop() || fieldName;
    
    switch (errorKey) {
      case 'required':
        return `${fieldDisplayName} is required`;
      case 'email':
        return `${fieldDisplayName} must be a valid email`;
      case 'min':
        return `${fieldDisplayName} is too small`;
      case 'max':
        return `${fieldDisplayName} is too large`;
      case 'pattern':
        return `${fieldDisplayName} has invalid format`;
      default:
        return `${fieldDisplayName} is invalid`;
    }
  }
}

// === TYPES ===
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Usage in ProductFormComponent:
/*
// Add to your component:

// Types and utilities are defined in this same file

export class ProductFormComponent {
  
  onSave(): void {
    FormUtils.markFormGroupTouched(this.productForm);
    
    if (this.productForm.invalid) {
      const errors = FormUtils.findFormErrors(this.productForm);
      console.error('Form validation errors:', errors);
      this.showValidationErrors();
      return;
    }

    const payload = this.mapFormToPayload();
    
    // Pre-submit validation
    const validation = ProductFormValidator.validatePayloadBeforeSubmit(payload);
    if (!validation.isValid) {
      this.notificationService.showError(`Validation failed: ${validation.errors.join(', ')}`);
      return;
    }
    
    this.saveProduct.emit(payload);
  }

  private mapFormToPayload(): CreateProductPayload | UpdateProductPayload {
    const formValue = this.productForm.getRawValue();
    
    // Use safe converters
    const payload = {
      ...formValue,
      name: SafeConverters.toString(formValue.name),
      price: SafeConverters.toPositiveNumber(formValue.physicalProductConfig?.pricing?.price),
      stockQuantity: SafeConverters.toNumber(formValue.physicalProductConfig?.stockQuantity),
      tags: SafeConverters.toNullableArray(formValue.tags),
      variantOverrides: SafeConverters.toArray(formValue.variantCombinations).map(combo => ({
        tempAttributeValueIds: SafeConverters.toArray(combo.attributes?.map(a => a.attributeValueId)),
        price: SafeConverters.toPositiveNumber(combo.price),
        stockQuantity: SafeConverters.toNumber(combo.stockQuantity),
        isDefault: SafeConverters.toBoolean(combo.isDefault),
        isActive: SafeConverters.toBoolean(combo.isActive, true),
        sku: SafeConverters.toString(combo.sku)
      }))
    };
    
    return payload as CreateProductPayload | UpdateProductPayload;
  }
}
*/