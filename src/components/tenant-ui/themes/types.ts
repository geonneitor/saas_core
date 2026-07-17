export interface ThemeProps {
  tenant: {
    id: string;
    name: string;
  };
  settings: {
    theme?: string;
    font?: string;
    hero_image?: string;
    brand_tagline?: string;
    ai_avatar?: string;
    whatsapp_number?: string;
  };
  isAdmin: boolean;
  domain: string;
}
