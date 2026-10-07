import React from 'react';
import { deleteCommunitySuggestion } from '../../../services/adminService';
import { AdminGamesManager } from '../AdminGamesManager';

export interface CatalogTabProps {
  currentSteamId: any;
  prefilledGameForCatalog: any;
  setPrefilledGameForCatalog: any;
  loadData: any;
  showNotice: any;
}

export const CatalogTab: React.FC<CatalogTabProps> = ({
  currentSteamId,
  prefilledGameForCatalog,
  setPrefilledGameForCatalog,
  loadData,
  showNotice
}) => {
  return (
    <>

                  <AdminGamesManager
                    currentSteamId={currentSteamId}
                    initialPrefillGame={prefilledGameForCatalog?.game}
                    onPrefillConsumed={() => {}}
                    onGameSaved={async () => {
                      if (prefilledGameForCatalog?.suggestionId) {
                        await deleteCommunitySuggestion(prefilledGameForCatalog.suggestionId, currentSteamId);
                        setPrefilledGameForCatalog(null);
                        await loadData();
                      }
                    }}
                    onNotice={(type, msg) => showNotice(type, msg)}
                  />
                
    </>
  );
};
