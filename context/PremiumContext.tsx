import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

interface PremiumContextValue {
  isPremium: boolean;
  setPremium: (value: boolean) => Promise<void>;
  togglePremium: () => Promise<void>;
  isLoading: boolean;
}

const STORAGE_KEY = '@sweatflix_is_premium';

const PremiumContext = createContext<PremiumContextValue | undefined>(undefined);

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isPremium: authIsPremium } = useAuth();
  const [isPremium, setIsPremiumState] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadStoredPremium = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          setIsPremiumState(JSON.parse(stored) === true);
        }
      } catch (e) {
        console.error('Failed to load premium status:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredPremium();
  }, []);

  const setPremium = async (value: boolean) => {
    try {
      setIsPremiumState(value);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save premium status:', e);
    }
  };

  const togglePremium = async () => {
    await setPremium(!isPremium);
  };

  const effectiveIsPremium = isPremium || authIsPremium;

  return (
    <PremiumContext.Provider
      value={{
        isPremium: effectiveIsPremium,
        setPremium,
        togglePremium,
        isLoading,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = (): PremiumContextValue => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};
