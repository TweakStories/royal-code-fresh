// In: libs/shared/utils/src/lib/utils/media.utils.ts

import { Image, ImageVariant, Media, MediaType } from '@royal-code/shared/domain';

/**
 * Een flexibele functie om de beste ImageVariant te vinden op basis van een geordende lijst van doeleinden.
 * Het doorloopt de 'purposes' array en retourneert de eerste variant die overeenkomt.
 *
 * @param image Het Image object.
 * @param preferredPurposes Een array van strings die de gewenste doeleinden in volgorde van voorkeur aangeven (bijv. ['thumbnail', 'small_display']).
 * @returns De gevonden ImageVariant, of undefined als er geen match is.
 */
export function findImageVariantByPurpose(
  image: Image | undefined | null,
  preferredPurposes: string[]
): ImageVariant | undefined {
  if (!image?.variants?.length || !preferredPurposes?.length) {
    return undefined;
  }

  for (const purpose of preferredPurposes) {
    const variant = image.variants.find(v => v.purpose === purpose);
    if (variant) {
      return variant; // Gevonden! Retourneer meteen.
    }
  }

  return undefined; // Geen van de voorkeursvarianten gevonden.
}

/**
 * Een gespecialiseerde utility om de URL voor een profielavatar te krijgen.
 * Het definieert de standaard zoekvolgorde voor avatars en heeft een fallback.
 *
 * @param avatar Het Image object voor de avatar.
 * @returns De URL string van de meest geschikte variant, of undefined.
 */
export function getProfileAvatarUrl(avatar: Image | undefined | null): string | undefined {
  if (!avatar?.variants?.length) {
    return undefined;
  }

  // Zoek naar de beste variant in deze volgorde: 'icon', 'thumbnail', 'small_display'
  const preferredVariant = findImageVariantByPurpose(avatar, ['icon', 'thumbnail', 'small_display']);

  if (preferredVariant) {
    return preferredVariant.url;
  }

  // Fallback: als geen specifieke variant wordt gevonden, retourneer dan de variant met de kleinste breedte.
  const smallestVariant = [...avatar.variants].sort((a, b) => (a.width ?? 9999) - (b.width ?? 9999))[0];
  return smallestVariant?.url;
}

/**
 * Vindt de variant die het dichtst bij een bepaalde breedte ligt, zonder groter te zijn.
 * Ideaal voor het selecteren van de juiste bron voor een `<img>` tag in een container van bekende grootte.
 */
export function findVariantForWidth(image: Image | undefined | null, targetWidth: number): ImageVariant | undefined {
    if (!image?.variants?.length) {
        return undefined;
    }
    // Filter varianten die een breedte hebben en kleiner of gelijk zijn aan het doel, sorteer ze van groot naar klein.
    const suitableVariants = image.variants
        .filter(v => v.width && v.width <= targetWidth)
        .sort((a: ImageVariant, b: ImageVariant) => b.width! - a.width!);

    if (suitableVariants.length > 0) {
        return suitableVariants[0]; // Pak de grootste van de geschikte varianten.
    }

    // Fallback: als geen enkele variant kleiner is, pak dan de allerkleinste die beschikbaar is.
    return [...image.variants].sort((a, b) => (a.width ?? 9999) - (b.width ?? 9999))[0];
}



/**
 * Filtert een array van `Media` objecten en retourneert alleen de `Image` objecten.
 * Dit is een gecentraliseerde, type-veilige utility-functie om te voorkomen dat
 * feature-componenten deze logica moeten dupliceren.
 *
 * @param {Media[] | null | undefined} mediaList De array van `Media` objecten.
 * @returns {Image[]} Een nieuwe array die alleen `Image` objecten bevat.
 */
export function filterImageMedia(mediaList: readonly Media[] | null | undefined): Image[] {
  if (!mediaList) {
    return [];
  }
  // De .filter() methode retourneert altijd een nieuwe array, dus de 'readonly' is veilig.
  return mediaList.filter((item): item is Image => item.type === MediaType.IMAGE);
}
