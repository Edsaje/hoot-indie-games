import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  itemName?: string;
  scrollToId?: string;
  className?: string;
}

/**
 * Calcule la liste compacte des pages avec des ellipses intelligentes
 */
function getPaginationRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [12, 24, 48, 96, -1],
  itemName,
  scrollToId,
  className = '',
}) => {
  const { t } = useTranslation();

  // Si aucun élément, ne rien afficher
  if (totalItems === 0) {
    return null;
  }

  // Si 1 seule page et pas de sélecteur de pagination par page, masquer
  if (totalPages <= 1 && !onItemsPerPageChange) {
    return null;
  }

  const isAll = itemsPerPage === -1 || (totalItems > 0 && itemsPerPage >= totalItems);
  const effectiveItemsPerPage = itemsPerPage === -1 ? totalItems : itemsPerPage;
  const startIdx = totalItems === 0 ? 0 : (currentPage - 1) * effectiveItemsPerPage + 1;
  const endIdx = itemsPerPage === -1 ? totalItems : Math.min(currentPage * itemsPerPage, totalItems);
  const pages = getPaginationRange(currentPage, totalPages);
  const resolvedItemName = itemName || t('pagination.games', { defaultValue: 'jeux' });

  const handlePageClick = (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages) return;
    soundFx.playClick();
    onPageChange(page);

    if (scrollToId) {
      const el = document.getElementById(scrollToId);
      if (el) {
        // Décalage pour laisser respirer le header sticky
        const yOffset = -90;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }
  };

  const handleItemsPerPageClick = (opt: number) => {
    if ((opt === -1 && isAll) || (opt === itemsPerPage && !isAll)) return;
    soundFx.playClick();
    if (onItemsPerPageChange) {
      onItemsPerPageChange(opt);
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={`flex flex-col lg:flex-row items-center justify-between gap-4 pt-6 pb-2 border-t border-[#1e293b]/70 ${className}`}
    >
      {/* Résumé textuel */}
      <div className="text-xs text-slate-400 font-medium text-center sm:text-left">
        {t('pagination.showing', {
          start: startIdx,
          end: endIdx,
          total: totalItems,
          items: resolvedItemName,
          defaultValue: `Affichage de ${startIdx} à ${endIdx} sur ${totalItems} ${resolvedItemName}`,
        })}
        {totalPages > 1 && (
          <span className="hidden md:inline text-slate-500 ml-2">
            • {t('pagination.page', { current: currentPage, total: totalPages, defaultValue: `Page ${currentPage} sur ${totalPages}` })}
          </span>
        )}
      </div>

      {/* Zone droite : Choix d'éléments par page & Boutons de navigation */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* Sélecteur du nombre de résultats par page */}
        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="hidden sm:inline font-medium">
              {t('pagination.perPage', { defaultValue: 'Par page :' })}
            </span>
            <div className="inline-flex rounded-xl bg-[#0b0f19] border border-[#1e293b] p-0.5 shadow-inner">
              {itemsPerPageOptions.map((opt) => {
                const isSelected = opt === -1 ? isAll : itemsPerPage === opt && !isAll;
                const label = opt === -1 ? t('pagination.all', { defaultValue: 'Tous' }) : String(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleItemsPerPageClick(opt)}
                    aria-pressed={isSelected}
                    title={opt === -1 ? t('pagination.all', { defaultValue: 'Tous' }) : `${opt} ${resolvedItemName}`}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Contrôles de navigation entre pages */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1 select-none">
            {/* Première page (desktop) */}
            {totalPages > 5 && (
              <button
                type="button"
                onClick={() => handlePageClick(1)}
                disabled={currentPage === 1}
                title={t('pagination.first', { defaultValue: 'Première page' })}
                aria-label={t('pagination.first', { defaultValue: 'Première page' })}
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded-xl border border-[#1e293b] bg-[#0b0f19] text-slate-400 hover:text-white hover:border-[#10b981]/50 disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
            )}

            {/* Page précédente */}
            <button
              type="button"
              onClick={() => handlePageClick(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label={t('pagination.previous', { defaultValue: 'Précédent' })}
              className="flex items-center gap-1 px-2.5 sm:px-3 h-8 rounded-xl border border-[#78350f]/60 bg-[#06241b] text-slate-200 hover:text-white hover:border-amber-500/80 hover:bg-[#0a3528] disabled:opacity-25 disabled:pointer-events-none transition text-xs font-bold cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('pagination.previous', { defaultValue: 'Précédent' })}</span>
            </button>

            {/* Numéros de page */}
            <div className="flex items-center gap-1 mx-1">
              {pages.map((p, idx) =>
                p === '...' ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-7 h-8 flex items-center justify-center text-slate-500 font-bold text-xs"
                    aria-hidden="true"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePageClick(p)}
                    aria-current={currentPage === p ? 'page' : undefined}
                    className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center ${
                      currentPage === p
                        ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md shadow-amber-500/20 scale-105'
                        : 'border-[#1e293b] bg-[#0b0f19] text-slate-300 hover:text-white hover:border-slate-600 hover:bg-slate-800/60'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            </div>

            {/* Page suivante */}
            <button
              type="button"
              onClick={() => handlePageClick(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label={t('pagination.next', { defaultValue: 'Suivant' })}
              className="flex items-center gap-1 px-2.5 sm:px-3 h-8 rounded-xl border border-[#78350f]/60 bg-[#06241b] text-slate-200 hover:text-white hover:border-amber-500/80 hover:bg-[#0a3528] disabled:opacity-25 disabled:pointer-events-none transition text-xs font-bold cursor-pointer"
            >
              <span className="hidden sm:inline">{t('pagination.next', { defaultValue: 'Suivant' })}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Dernière page (desktop) */}
            {totalPages > 5 && (
              <button
                type="button"
                onClick={() => handlePageClick(totalPages)}
                disabled={currentPage === totalPages}
                title={t('pagination.last', { defaultValue: 'Dernière page' })}
                aria-label={t('pagination.last', { defaultValue: 'Dernière page' })}
                className="hidden sm:flex items-center justify-center w-8 h-8 rounded-xl border border-[#1e293b] bg-[#0b0f19] text-slate-400 hover:text-white hover:border-[#10b981]/50 disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
