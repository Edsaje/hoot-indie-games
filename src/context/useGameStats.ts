import { useContext } from 'react';
import { GameStatsContext } from './GameStatsContext';

export const useGameStats = () => {
  const context = useContext(GameStatsContext);
  if (!context) {
    throw new Error('useGameStats must be used within a GameStatsProvider');
  }
  return context;
};
