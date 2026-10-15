import React, { createContext, useContext, useEffect, useState } from 'react';
import { StoreSettings } from '../types';
import { apiRequest } from '../utils/api';

const defaultSettings: StoreSettings = {
  store_name: 'Bajaj Enterprises',
  store_address: 'Alakh Sagar Road, Kote Gate, Bikaner, Rajasthan 334001, India',
  store_phone: '',
  store_whatsapp: '',
  store_email: '',
  opening_hours: '',
  google_maps_url: '',
  instagram_url: '',
  facebook_url: '',
  currency_symbol: '₹',
  announcement_text: '',
};

interface SettingsContextType {
  settings: StoreSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const data = await apiRequest<StoreSettings>('/settings');
      setSettings(data);
    } catch (err) {
      console.warn('Could not load remote settings, using defaults.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
