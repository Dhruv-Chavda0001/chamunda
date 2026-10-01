import React, { createContext, useContext, useState, useEffect } from 'react';
import { ShopSettings } from '../types';
import { defaultShopSettings } from '../data/demoProducts';
import { getShopSettings, saveShopSettings } from '../services/db';
import toast from 'react-hot-toast';

interface ShopContextType {
  settings: ShopSettings;
  updateSettings: (newSettings: ShopSettings) => Promise<void>;
  loading: boolean;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ShopSettings>(defaultShopSettings);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    try {
      const data = await getShopSettings();
      setSettings(data);
    } catch (e) {
      console.warn('Failed to load shop settings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();

    const handleUpdate = () => {
      fetchSettings();
    };
    window.addEventListener('cf_settings_updated', handleUpdate);
    return () => window.removeEventListener('cf_settings_updated', handleUpdate);
  }, []);

  const updateSettings = async (newSettings: ShopSettings) => {
    try {
      await saveShopSettings(newSettings);
      setSettings(newSettings);
      toast.success('Settings updated successfully');
    } catch (e) {
      toast.error('Failed to save settings');
      throw e;
    }
  };

  return (
    <ShopContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
