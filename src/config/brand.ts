// Add the remaining confirmed contact channels when Vretok is ready to launch.
export const brand = {
  name: 'Vretok',
  description: 'Performance leggings and gym fashion for confident movement.',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
  address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || '',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
};
