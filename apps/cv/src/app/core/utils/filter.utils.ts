/**
 * @file filter.utils.ts (CV App)
 * @description Utility-functies voor het filteren van lijsten op basis van tags.
 */

// Een generieke functie om unieke tags te verzamelen uit een lijst van items
// Elk item moet een `techStack` array hebben
export function getUniqueTags<T extends { techStack: { name: string }[] }>(items: T[]): string[] {
  const tags = new Set<string>();
  items.forEach(item => {
    item.techStack.forEach(tech => tags.add(tech.name));
  });
  return Array.from(tags).sort();
}

// Een generieke functie om een lijst van items te filteren op een geselecteerde tag
export function filterByTag<T extends { techStack: { name: string }[] }>(items: T[], selectedTag: string | null): T[] {
  if (!selectedTag) {
    return items;
  }
  return items.filter(item => 
    item.techStack.some(tech => tech.name === selectedTag)
  );
}