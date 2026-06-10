import { GlavBlogPage, LocaleText } from '../context/AdminConfigContext';

export type GlavBlogLang = 'ru' | 'en' | 'hy';

export function localized(value: LocaleText, language: string): string {
  const lang = (['ru', 'en', 'hy'].includes(language) ? language : 'en') as GlavBlogLang;
  return value[lang] || value.en || value.ru || value.hy;
}

export function activeGlavBlogPages(pages: GlavBlogPage[]): GlavBlogPage[] {
  return [...pages].filter((page) => page.isActive && page.status !== 'draft').sort((a, b) => a.sortOrder - b.sortOrder);
}
