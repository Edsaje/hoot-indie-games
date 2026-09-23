import { useContext } from 'react';
import { FriendsContext, type FriendsContextType } from './FriendsContext';

export function useFriends(): FriendsContextType {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
}
