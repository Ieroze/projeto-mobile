export const typography = {
  title: 28,
  heading: 22,
  subheading: 18,
  body: 15,
  caption: 12,
};

export const fontFamilies = {
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semibold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
  extrabold: 'PlusJakartaSans-ExtraBold',
} as const;

export function fontFamilyForWeight(weight?: string | number) {
  const numericWeight = typeof weight === 'string' ? Number(weight) : weight;
  if (numericWeight !== undefined && numericWeight >= 800) return fontFamilies.extrabold;
  if (weight === 'bold') return fontFamilies.bold;
  if (numericWeight !== undefined && numericWeight >= 700) return fontFamilies.bold;
  if (numericWeight !== undefined && numericWeight >= 600) return fontFamilies.semibold;
  if (numericWeight !== undefined && numericWeight >= 500) return fontFamilies.medium;
  return fontFamilies.regular;
}
