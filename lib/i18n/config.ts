/**
 * i18n Configuration
 * 
 * Central configuration for next-intl internationalization.
 * Defines supported locales, default locale, and routing configuration.
 */

export const locales = ['en', 'es', 'fr', 'de', 'zh', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeLabels: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  ar: 'العربية',
};

export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  es: 'ltr',
  fr: 'ltr',
  de: 'ltr',
  zh: 'ltr',
  ar: 'rtl',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  zh: '🇨🇳',
  ar: '🇸🇦',
};

// Locale metadata for SEO
export const localeMetadata: Record<Locale, { title: string; description: string }> = {
  en: {
    title: 'Sandstone - AI-Powered A-Level Learning',
    description: 'AI-powered A-Level response grading with detailed examiner feedback. Master Economics and Geography with personalized AI tutoring.',
  },
  es: {
    title: 'Sandstone - Aprendizaje A-Level con IA',
    description: 'Calificación de respuestas A-Level con IA y retroalimentación detallada. Domina Economía y Geografía con tutoría personalizada.',
  },
  fr: {
    title: 'Sandstone - Apprentissage A-Level par IA',
    description: 'Notation des réponses A-Level par IA avec commentaires détaillés. Maîtrisez l\'Économie et la Géographie avec un tutorat personnalisé.',
  },
  de: {
    title: 'Sandstone - KI-gestütztes A-Level Lernen',
    description: 'KI-gestützte A-Level-Antwortbewertung mit detailliertem Prüferfeedback. Meistern Sie Wirtschaft und Geographie mit personalisiertem KI-Tutoring.',
  },
  zh: {
    title: 'Sandstone - AI驱动的A-Level学习',
    description: 'AI驱动的A-Level答题评分，提供详细的考官反馈。通过个性化AI辅导掌握经济学和地理学。',
  },
  ar: {
    title: 'Sandstone - التعلم A-Level المدعوم بالذكاء الاصطناعي',
    description: 'تقييم إجابات A-Level بالذكاء الاصطناعي مع تعليقات مفصلة من المصححين. أتقن الاقتصاد والجغرافيا مع التدريس الشخصي.',
  },
};

// Pathnames that should be localized
export const pathnames = {
  '/': '/',
  '/login': {
    en: '/login',
    es: '/iniciar-sesion',
    fr: '/connexion',
    de: '/anmelden',
    zh: '/登录',
    ar: '/تسجيل-الدخول',
  },
  '/signup': {
    en: '/signup',
    es: '/registro',
    fr: '/inscription',
    de: '/registrieren',
    zh: '/注册',
    ar: '/التسجيل',
  },
  '/grade': {
    en: '/grade',
    es: '/calificar',
    fr: '/noter',
    de: '/bewerten',
    zh: '/评分',
    ar: '/تقييم',
  },
  '/flashcards': {
    en: '/flashcards',
    es: '/tarjetas',
    fr: '/fiches',
    de: '/karteikarten',
    zh: '/闪卡',
    ar: '/البطاقات-التعليمية',
  },
  '/quiz': {
    en: '/quiz',
    es: '/cuestionario',
    fr: '/quiz',
    de: '/quiz',
    zh: '/测验',
    ar: '/اختبار',
  },
  '/documents': {
    en: '/documents',
    es: '/documentos',
    fr: '/documents',
    de: '/dokumente',
    zh: '/文档',
    ar: '/المستندات',
  },
  '/library': {
    en: '/library',
    es: '/biblioteca',
    fr: '/bibliotheque',
    de: '/bibliothek',
    zh: '/图书馆',
    ar: '/المكتبة',
  },
  '/settings': {
    en: '/settings',
    es: '/ajustes',
    fr: '/parametres',
    de: '/einstellungen',
    zh: '/设置',
    ar: '/الإعدادات',
  },
  '/dashboard': {
    en: '/dashboard',
    es: '/panel',
    fr: '/tableau-de-bord',
    de: '/dashboard',
    zh: '/仪表板',
    ar: '/لوحة-التحكم',
  },
} as const;

// Helper to check if a locale is valid
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// Get locale from request headers or cookie
export function getLocaleFromRequest(request: Request): Locale {
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')[0]
      .split('-')[0]
      .toLowerCase();
    if (isValidLocale(preferredLocale)) {
      return preferredLocale;
    }
  }
  return defaultLocale;
}
