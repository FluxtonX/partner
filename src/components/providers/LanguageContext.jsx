import React, { createContext, useContext, useState, useEffect } from 'react';
import { BusinessSettings } from '@/api/entities';
import { translations } from '@/components/lib/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  
  const t = (key, params = {}) => {
    let text = translations[language]?.[key] || translations['en']?.[key] || key;
    Object.keys(params).forEach(pKey => {
      const regex = new RegExp(`{${pKey}}`, 'g');
      text = text.replace(regex, params[pKey]);
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}