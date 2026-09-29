import { useContext } from 'react';
import { TradesContext, type TradesContextType } from './TradesContext';

export function useTrades(): TradesContextType {
  const context = useContext(TradesContext);
  if (!context) {
    throw new Error('useTrades must be used within a TradesProvider');
  }
  return context;
}
