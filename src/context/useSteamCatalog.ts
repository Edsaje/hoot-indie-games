import { useContext } from 'react';
import { SteamCatalogContext } from './SteamCatalogContext';
import type { SteamCatalogContextType } from './SteamCatalogContext';

export function useSteamCatalog(): SteamCatalogContextType {
  const context = useContext(SteamCatalogContext);
  if (!context) {
    throw new Error('useSteamCatalog must be used within a SteamCatalogProvider');
  }
  return context;
}
