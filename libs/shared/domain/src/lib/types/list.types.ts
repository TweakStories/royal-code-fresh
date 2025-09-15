export const ListTypesEnum = { Text: 'text', Custom: 'custom' } as const;
export type ListType = (typeof ListTypesEnum)[keyof typeof ListTypesEnum];

export const ListOrientationEnum = { VerticalSimple: 'vertical', HorizontalSimple: 'horizontal' } as const;
export type ListOrientation = (typeof ListOrientationEnum)[keyof typeof ListOrientationEnum];