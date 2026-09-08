export const PRODUCT_COLLECTION_OPTIONS = [
  { value: 'leggings', label: 'Leggings' },
  { value: 'activewear', label: 'Activewear' },
  { value: 'gym-accessories', label: 'Gym Accessories' },
] as const;

export function getCollectionsForCategory(category: string): string[] {
  const normalized = category.toLowerCase().trim();
  if (/accessor|bag|bottle|band|glove|sock/.test(normalized)) return ['gym-accessories'];
  if (/top|bra|short|jacket|hoodie|activewear|set/.test(normalized)) return ['activewear'];
  if (/legging|tights|yoga pant/.test(normalized)) return ['leggings'];
  return [];
}
