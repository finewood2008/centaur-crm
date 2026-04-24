import { createContext, useContext, type ReactNode } from 'react';

interface BrandConfig {
  name: string;
  tagline: string;
  version: string;
  accent: string;
}

const defaultBrand: BrandConfig = {
  name: '半人马 CRM',
  tagline: 'AI-Native · 财税版',
  version: 'Pro',
  accent: 'var(--color-accent)',
};

const BrandContext = createContext<BrandConfig>(defaultBrand);

interface BrandProviderProps {
  config?: Partial<BrandConfig>;
  children: ReactNode;
}

export function BrandProvider({ config, children }: BrandProviderProps) {
  const merged = { ...defaultBrand, ...config };
  return (
    <BrandContext.Provider value={merged}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  return useContext(BrandContext);
}
