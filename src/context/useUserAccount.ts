import { useContext } from 'react';
import { UserAccountContext } from './UserAccountContext';
import type { UserAccountContextType } from './UserAccountContext';

export const useUserAccount = (): UserAccountContextType => {
  const context = useContext(UserAccountContext);
  if (!context) {
    throw new Error('useUserAccount must be used within a UserAccountProvider');
  }
  return context;
};
