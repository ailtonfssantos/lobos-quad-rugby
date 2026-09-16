```jsx
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const links = [
  { path: '/', key: 'nav.home' },
  { path: '/sobre-nosotros', key: 'nav.club' },
  { path: '/equipo', key: 'nav.team' },
  { path: '/entrenamientos', key: 'nav.training' },
  { path: '/competiciones', key: 'nav.competitions' },
  { path: '/unete', key: 'nav.join' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.language || 'es';

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem('lobos-language', language);
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeMenu();
  };

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-zinc-950/90 backdrop-blur-xl"
        aria-label={t('nav.mainNavigation')}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="h-[76px] flex items-center justify-between">

            {/* LOGO */}
            <Link
              to="/"
              onClick={scrollToTop}
              className="group flex items-center gap-3 shrink-0"
              aria-label={t('nav.logoLabel')}
            >
              <div className="relative overflow-hidden">
                <img
                  src="/assets/logo1.png"
                  alt="Lobos Quad Rugby"
                  className="h-11 sm:h-12 w-auto object-contain grayscale opacity-90 transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100"
                />
              </div>

              <div className="hidden sm:block">
                <div className="font-display text-lg leading-none tracking-[0.18em] text-white">
                  LOBOS
                </div>

                <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                  Quad Rugby
                </div>
              </div>
            </Link>

            {/* DESKTOP NAVIGATION */}
            <div className="hidden md:flex items-center gap-7 lg:gap-9">

              {links.map((link) => {
                const active = isActive(link.path);

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={scrollToTop}
                    aria-current={active ? 'page' : undefined}
                    className={`group relative py-2 text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.16em] transition-colors duration-300 ${
                      active
                        ? 'text-white'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    {t(link.key)}

                    <span
                      className={`absolute bottom-0 left-0 h-px bg-red-600 transition-all duration-300 ${
                        active
                          ? 'w-full'
                          : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </Link>
                );
              })}

              {/* LANGUAGE SELECTOR */}
              <div className="flex items-center gap-1 ml-1 pl-5 border-l border-white/10">
                {['es', 'en', 'pt'].map((language) => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => changeLanguage(language)}
                    aria-label={`${t('language.changeTo')} ${language.toUpperCase()}`}
                    aria-pressed={currentLanguage === language}
                    className={`px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] transition-all duration-300 ${
                      currentLanguage === language
                        ? 'text-white'
                        : 'text-zinc-600 hover:text-zinc-300'
                    }`}
                  >
                    {language.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* SPONSORS */}
              <Link
                to="/patrocinadores"
                onClick={scrollToTop}
                className={`ml-1 inline-flex items-center gap-3 border px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-300 ${
                  isActive('/patrocinadores')
                    ? 'border-red-600 bg-red-600 text-white'
                    : 'border-red-600 bg-red-600 text-white hover:border-red-500 hover:bg-red-500'
                }`}
                aria-current={
                  isActive('/patrocinadores')
                    ? 'page'
                    : undefined
                }
              >
                {t('nav.sponsors')}

                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14M13 6l6 6-6 6"
                  />
                </svg>
              </Link>
            </div>

            {/* MOBILE BUTTON */}
            <button
              type="button"
              onClick={() => setIsOpen((value) => !value)}
              className="md:hidden relative w-11 h-11 border border-white/10 flex items-center justify-center text-zinc-300 transition-all duration-300 hover:border-red-600 hover:text-white"
              aria-label={
                isOpen
                  ? t('nav.closeMenu')
                  : t('nav.openMenu')
              }
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
            >
              <span className="sr-only">
                {isOpen
                  ? t('nav.closeMenu')
                  : t('nav.openMenu')}
              </span>

              <div className="relative w-5 h-5">
                <span
                  className={`absolute left-0 top-[4px] w-5 h-px bg-current transition-all duration-300 ${
                    isOpen
                      ? 'top-[9px] rotate-45'
                      : ''
                  }`}
                />

                <span
                  className={`absolute left-0 top-[9px] w-5 h-px bg-current transition-all duration-300 ${
                    isOpen
                      ? 'opacity-0'
                      : 'opacity-100'
                  }`}
                />

                <span
                  className={`absolute left-0 top-[14px] w-5 h-px bg-current transition-all duration-300 ${
                    isOpen
                      ? 'top-[9px] -rotate-45'
                      : ''
                  }`}
                />
              </div>
            </button>
          </div>

          {/* MOBILE NAVIGATION */}
          <div
            id="mobile-navigation"
            className={`md:hidden overflow-hidden transition-all duration-300 ${
              isOpen
                ? 'max-h-[700px] opacity-100'
                : 'max-h-0 opacity-0'
            }`}
          >
            <div className="border-t border-white/10 py-5">

              <div className="space-y-1">
                {links.map((link) => {
                  const active = isActive(link.path);

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={scrollToTop}
                      aria-current={
                        active ? 'page' : undefined
                      }
                      className={`block border-l-2 px-4 py-3.5 text-xs font-bold uppercase tracking-[0.16em] transition-all duration-300 ${
                        active
                          ? 'border-red-600 bg-white/[0.04] text-white'
                          : 'border-transparent text-zinc-500 hover:border-white/20 hover:bg-white/[0.02] hover:text-white'
                      }`}
                    >
                      {t(link.key)}
                    </Link>
                  );
                })}
              </div>

              {/* MOBILE LANGUAGE SELECTOR */}
              <div className="mt-5 pt-5 border-t border-white/5">

                <p className="px-4 mb-3 text-[9px] uppercase tracking-[0.2em] text-zinc-600">
                  {t('language.label')}
                </p>

                <div className="flex gap-2 px-4">
                  {['es', 'en', 'pt'].map((language) => (
                    <button
                      key={language}
                      type="button"
                      onClick={() => changeLanguage(language)}
                      className={`flex-1 border px-3 py-3 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                        currentLanguage === language
                          ? 'border-red-600 bg-red-600 text-white'
                          : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-white'
                      }`}
                    >
                      {language === 'es' && 'Español'}
                      {language === 'en' && 'English'}
                      {language === 'pt' && 'Português'}
                    </button>
                  ))}
                </div>
              </div>

              {/* MOBILE SPONSORS */}
              <div className="mt-5 pt-5 border-t border-white/5">
                <Link
                  to="/patrocinadores"
                  onClick={scrollToTop}
                  className="flex items-center justify-between bg-red-600 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-red-500"
                >
                  <span>{t('nav.sponsors')}</span>

                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 12h14M13 6l6 6-6 6"
                    />
                  </svg>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE OVERLAY */}
      <button
        type="button"
        aria-label={t('nav.closeMenu')}
        onClick={closeMenu}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      />
    </>
  );
}
```
