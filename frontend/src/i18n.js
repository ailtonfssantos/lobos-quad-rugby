import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import es from './locales/es/translation.json';
import en from './locales/en/translation.json';
import pt from './locales/pt/translation.json';

const savedLanguage = localStorage.getItem('lobos-language');

i18n
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        translation: es,
      },
      en: {
        translation: en,
      },
      pt: {
        translation: pt,
      },
    },

    lng: savedLanguage || 'es',
    fallbackLng: 'es',

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;