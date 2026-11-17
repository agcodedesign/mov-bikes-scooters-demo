const whatsapp = (import.meta.env.PUBLIC_WHATSAPP ?? '').replace(/\D/g, '');
const instagram = import.meta.env.PUBLIC_INSTAGRAM_URL ?? '';
export const site = {
  name: 'MOV Bikes & Scooters Elétricas',
  description: 'Descubra bicicletas e scooters elétricas para acompanhar sua rotina. Mobilidade, praticidade e liberdade para viver a cidade no seu ritmo.',
  whatsapp: /^\d{10,15}$/.test(whatsapp) ? `https://wa.me/${whatsapp}` : undefined,
  instagram: /^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/.test(instagram) ? instagram : undefined,
  newsletterEndpoint: /^https:\/\//.test(import.meta.env.PUBLIC_NEWSLETTER_ENDPOINT ?? '') ? import.meta.env.PUBLIC_NEWSLETTER_ENDPOINT : '',
};
export const navigation = [
  { label: 'Início', href: '/' },
  { label: 'Catálogo', href: '/catalogo/' },
  { label: 'Bicicletas', href: '/catalogo/?categoria=bicicleta#modelos' },
  { label: 'Scooters', href: '/catalogo/?categoria=scooter#modelos' },
  { label: 'A MOV', href: '/sobre/' },
];
