import React, { createContext, useContext, useState, useEffect } from 'react';
import { ko } from '../locales/ko';
import { en } from '../locales/en';
import { useAuth } from './AuthContext';

type Language = 'ko' | 'en';
type Translations = typeof ko;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const translations = { ko, en };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getUserLanguageKey = (userId: string | null): string => {
  return userId ? `user_${userId}_language` : 'language';
};

const loadUserLanguage = (userId: string | null): Language => {
  const key = getUserLanguageKey(userId);
  const saved = localStorage.getItem(key) as Language;
  return saved === 'en' || saved === 'ko' ? saved : 'ko';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || null;

  const [language, setLanguageState] = useState<Language>(() => loadUserLanguage(userId));

  // 사용자가 변경될 때 설정 다시 로드
  useEffect(() => {
    const lang = loadUserLanguage(userId);
    setLanguageState(lang);
  }, [userId]);

  // 언어 변경 시 저장 및 적용
  useEffect(() => {
    const key = getUserLanguageKey(userId);
    localStorage.setItem(key, language);
    document.documentElement.setAttribute('lang', language);
  }, [language, userId]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
