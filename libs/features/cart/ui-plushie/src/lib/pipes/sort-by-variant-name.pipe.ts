import { Pipe, PipeTransform } from '@angular/core';
import { CartItemVariant } from '@royal-code/features/cart/domain';

@Pipe({
  name: 'sortByVariantName',
  standalone: true,
})
export class SortByVariantNamePipe implements PipeTransform {
  transform(variants: CartItemVariant[] | undefined): CartItemVariant[] {
    if (!variants || variants.length === 0) {
      return [];
    }

    // Definieer een voorkeursvolgorde voor variant-namen
    const order = ['Color', 'Size']; // "Color" eerst, dan "Size", de rest volgt alfabetisch

    return [...variants].sort((a, b) => {
      const indexA = order.indexOf(a.name);
      const indexB = order.indexOf(b.name);

      if (indexA === -1 && indexB === -1) {
        // Beide niet in voorkeurslijst, sorteer alfabetisch op naam
        return a.name.localeCompare(b.name);
      }
      if (indexA === -1) {
        // A niet in lijst, B wel -> B komt eerst
        return 1;
      }
      if (indexB === -1) {
        // B niet in lijst, A wel -> A komt eerst
        return -1;
      }
      // Beide in lijst, sorteer op hun index in de voorkeurslijst
      return indexA - indexB;
    });
  }
}