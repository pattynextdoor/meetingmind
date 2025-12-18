export interface NavItem {
  label: string;
  href: string;
}

export interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
}

export interface Stat {
  value: string;
  label: string;
}
