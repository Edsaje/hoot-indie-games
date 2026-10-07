import React, { useState } from 'react';
import {
  Check,
  ArrowUpCircle,
  Network,
  Sword,
  Users,
  Droplets,
  Sparkles,
  Award,
} from 'lucide-react';
import type { OdysseySaveState, CelestialBranch } from '../../types/odyssey';
import {
  CELESTIAL_TREE_UPGRADES,
  calculateUpgradeCost,
  calculateCumulativeUpgradeCost,
  calculateMaxAffordableLevels,
  getNodeMilestoneInfo,
} from '../../data/odysseyData';
import {
  formatOdysseyNumber,
  buyCelestialUpgrade,
} from '../../services/odysseyEngineService';
import { soundFx } from '../../utils/audio';

interface CelestialTreeViewProps {
  state: OdysseySaveState;
  onStateChange: (newState: OdysseySaveState) => void;
  onBackToArena: () => void;
}

type BuyQuantityOption = 1 | 10 | 25 | 'max';

const BRANCH_CONFIG: Record<
  CelestialBranch,
  { label: string; iconType: 'vigor' | 'companions' | 'alchemy' | 'astronomy'; desc: string; color: string; border: string; bg: string }
> = {
  vigor: {
    label: 'Vigueur Céleste',
    iconType: 'vigor',
    desc: 'Puissance de frappe manuelle et coups critiques au clic.',
    color: 'text-amber-400',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
  },
  companions: {
    label: 'Chouettes & Compagnons',
    iconType: 'companions',
    desc: 'DPS passif automatique et synergies avec vos pépites capturées de l’Indiedex.',
    color: 'text-cyan-400',
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-500/10',
  },
  alchemy: {
    label: 'Alchimie Végétale',
    iconType: 'alchemy',
    desc: 'Production de Sève Stellaire et attirance des Lucioles Dorées.',
    color: 'text-emerald-400',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/10',
  },
  astronomy: {
    label: 'Astronomie Nocturne',
    iconType: 'astronomy',
    desc: 'Plafond de gains hors-ligne et détection des Pépites Holographiques.',
    color: 'text-purple-400',
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/10',
  },
};

const renderBranchIcon = (iconType: 'vigor' | 'companions' | 'alchemy' | 'astronomy') => {
  switch (iconType) {
    case 'vigor':
      return <Sword className="w-5 h-5 text-amber-400" />;
    case 'companions':
      return <Users className="w-5 h-5 text-cyan-400" />;
    case 'alchemy':
      return <Droplets className="w-5 h-5 text-emerald-400" />;
    case 'astronomy':
      return <Sparkles className="w-5 h-5 text-purple-400" />;
  }
};

export const CelestialTreeView: React.FC<CelestialTreeViewProps> = ({
  state,
  onStateChange,
  onBackToArena,
}) => {
  const [selectedBranch, setSelectedBranch] = useState<CelestialBranch>('vigor');
  const [buyQuantity, setBuyQuantity] = useState<BuyQuantityOption>(1);
  const [purchaseFeedback, setPurchaseFeedback] = useState<string | null>(null);

  const currentBranchNodes = CELESTIAL_TREE_UPGRADES.filter(
    (n) => n.branch === selectedBranch
  );

  const handleBuy = (nodeId: string) => {
    const { success, nextState, levelsBought, error } = buyCelestialUpgrade(state, nodeId, buyQuantity);
    if (success) {
      if (levelsBought && levelsBought > 1) {
        soundFx.playAchievement();
      } else {
        soundFx.playClick();
      }
      onStateChange(nextState);
    } else if (error) {
      soundFx.playError();
      setPurchaseFeedback(error);
      setTimeout(() => setPurchaseFeedback(null), 2500);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* 1. Header Arbre Céleste */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#06241b]/95 border border-[#78350f] backdrop-blur-md mb-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Network className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              L’Arbre Céleste du Sanctuaire
            </h2>
            <p className="text-xs text-slate-300">
              Irriguez les branches millénaires avec votre Sève Stellaire pour débloquer des pouvoirs permanents.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase text-cyan-300 font-bold">Sève Disponible</div>
            <div className="text-lg sm:text-2xl font-black font-mono text-cyan-400 flex items-center justify-end gap-1.5">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>{formatOdysseyNumber(state.starSap)}</span>
            </div>
          </div>

          <button
            onClick={onBackToArena}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-600 transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Sword className="w-3.5 h-3.5 text-amber-400" />
            <span>Retour Combat</span>
          </button>
        </div>
      </div>

      {/* Message d'erreur éventuel */}
      {purchaseFeedback && (
        <div className="w-full max-w-md mx-auto mb-4 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-bold text-center animate-shake">
          {purchaseFeedback}
        </div>
      )}

      {/* 2. Onglets de Branches */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {(Object.keys(BRANCH_CONFIG) as CelestialBranch[]).map((branchKey) => {
          const config = BRANCH_CONFIG[branchKey];
          const isSelected = selectedBranch === branchKey;

          return (
            <button
              key={branchKey}
              onClick={() => {
                soundFx.playClick();
                setSelectedBranch(branchKey);
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? `${config.bg} ${config.border} shadow-lg ring-2 ring-amber-400/50`
                  : 'bg-[#06241b]/60 border-[#78350f]/60 hover:bg-[#06241b] text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center">
                  {renderBranchIcon(config.iconType)}
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400 animate-ping" />
                )}
              </div>
              <div>
                <h4 className={`text-xs font-black line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {config.label}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{config.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Sélecteur de Quantité d'Achat Multiple */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-300">Mode d’achat :</span>
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/10 shadow-inner">
            {([1, 10, 25, 'max'] as const).map((qty) => (
              <button
                key={String(qty)}
                onClick={() => {
                  soundFx.playClick();
                  setBuyQuantity(qty);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  buyQuantity === qty
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {qty === 'max' ? 'MAX' : `${qty}x`}
              </button>
            ))}
          </div>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          {buyQuantity === 'max'
            ? 'Achat du nombre maximal de niveaux abordables'
            : `Achat par lot de ${buyQuantity} niveau${buyQuantity > 1 ? 'x' : ''}`}
        </div>
      </div>

      {/* 4. Liste des Compétences de la Branche */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentBranchNodes.map((node) => {
          const currentLevel = state.treeUpgrades[node.id] || 0;
          const isMax = currentLevel >= node.maxLevel;

          let levelsToBuy = 0;
          let cost = 0;

          if (!isMax) {
            if (buyQuantity === 'max') {
              const affordable = calculateMaxAffordableLevels(node, currentLevel, state.starSap);
              levelsToBuy = affordable.count > 0 ? affordable.count : 1;
              cost = affordable.count > 0 ? affordable.cost : calculateUpgradeCost(node, currentLevel);
            } else {
              const desired = Math.min(buyQuantity, node.maxLevel - currentLevel);
              const cumulative = calculateCumulativeUpgradeCost(node, currentLevel, desired);
              if (state.starSap >= cumulative && desired > 0) {
                levelsToBuy = desired;
                cost = cumulative;
              } else {
                const affordable = calculateMaxAffordableLevels(node, currentLevel, state.starSap);
                levelsToBuy = affordable.count > 0 ? affordable.count : 1;
                cost = affordable.count > 0 ? affordable.cost : calculateUpgradeCost(node, currentLevel);
              }
            }
          }

          const canAfford = !isMax && state.starSap >= cost && levelsToBuy > 0;

          return (
            <div
              key={node.id}
              className={`relative p-4 sm:p-5 rounded-2xl border bg-[#06241b]/90 backdrop-blur-md shadow-xl flex flex-col justify-between transition-all ${
                isMax
                  ? 'border-emerald-500/50 bg-emerald-950/20'
                  : canAfford
                  ? 'border-amber-500/40 hover:border-amber-400'
                  : 'border-[#78350f]/60 opacity-90'
              }`}
            >
              {/* Header Compétence */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white">{node.name}</h4>
                      <span className="text-[10px] font-mono font-bold text-amber-300">
                        Niv. {currentLevel} / {node.maxLevel}
                      </span>
                    </div>
                  </div>

                  {isMax ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      MAX
                    </span>
                  ) : (
                    <div className="text-right font-mono">
                      <div className="text-[9px] uppercase text-slate-400">
                        {levelsToBuy > 1 ? `Coût (+${levelsToBuy})` : 'Coût'}
                      </div>
                      <div
                        className={`text-xs font-black flex items-center gap-1 justify-end ${
                          canAfford ? 'text-cyan-300' : 'text-slate-400'
                        }`}
                      >
                        <Droplets className="w-3 h-3 text-cyan-400" />
                        <span>{formatOdysseyNumber(cost)}</span>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-300 mb-2">{node.description}</p>

                {/* Palier & Jalon sobre (style PokéClicker) */}
                {(() => {
                  const milestoneInfo = getNodeMilestoneInfo(currentLevel, node.maxLevel);
                  return (
                    <div className="mb-3 p-2 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Award className="w-3 h-3 text-amber-400" />
                          <span>Paliers franchis : {milestoneInfo.currentMilestoneCount}</span>
                        </span>
                        {milestoneInfo.milestoneMultiplier > 1 ? (
                          <span className="text-amber-300 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/30">
                            Boost x{milestoneInfo.milestoneMultiplier.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-slate-500">Base x1.0</span>
                        )}
                      </div>

                      {milestoneInfo.nextMilestoneLevel !== null ? (
                        <div>
                          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 rounded-full"
                              style={{ width: `${milestoneInfo.progressToNext}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-0.5">
                            <span>Niv. {currentLevel}</span>
                            <span>Prochain palier : Niv. {milestoneInfo.nextMilestoneLevel} (+50%)</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[9px] font-mono text-emerald-400 font-semibold text-right">
                          Tous les paliers débloqués
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Effet Actuel & Bouton d'Achat */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="text-[11px] font-mono text-emerald-400 font-bold">
                  {node.formatValue ? node.formatValue(currentLevel) : `Niveau ${currentLevel}`}
                </div>

                <button
                  disabled={!canAfford || isMax}
                  onClick={() => handleBuy(node.id)}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition-transform flex items-center gap-1.5 cursor-pointer shadow-md ${
                    isMax
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                      : canAfford
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:scale-105 active:scale-95 shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  {isMax ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Maîtrisé</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpCircle className="w-3.5 h-3.5" />
                      <span>{levelsToBuy > 1 ? `+${levelsToBuy} Niveaux` : 'Améliorer'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
