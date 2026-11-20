import React, { useState, useRef, useEffect } from 'react';

export type NavSection = 'Home' | 'The Firm' | 'Skyline Homes' | 'Talk To Us';

const NAV_ITEMS: NavSection[] = ['Home', 'The Firm', 'Skyline Homes', 'Talk To Us'];

const LANGUAGES = [
  { code: 'Eng', label: 'English' },
  { code: 'Fr', label: 'Français' },
  { code: '中文', label: '繁體中文' },
] as const;

interface NavbarProps {
  navRef: React.RefObject<HTMLElement | null>;
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  language: string;
  onSelectLanguage: (code: string) => void;
  onEnquire: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  navRef,
  activeSection,
  onSelectSection,
  language,
  onSelectLanguage,
  onEnquire,
}) => {
  const [langOpen, setLangOpen] = useState(false);
  const langWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!langOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (langWrapRef.current && !langWrapRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLangOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [langOpen]);

  return (
    <header ref={navRef} className="nav">
      <a
        href="/"
        className="nav-wordmark"
        onClick={(e) => {
          e.preventDefault();
          onSelectSection('Home');
        }}
      >
        HARBORLUX
      </a>

      <nav className="nav-pills" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item;
          return (
            <button
              key={item}
              type="button"
              className={`nav-link${isActive ? ' is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onSelectSection(item)}
            >
              {item}
            </button>
          );
        })}
      </nav>

      <div className="nav-right">
        <div className="nav-lang-wrap" ref={langWrapRef}>
          <button
            type="button"
            className="nav-lang"
            aria-expanded={langOpen}
            aria-haspopup="listbox"
            onClick={() => setLangOpen((prev) => !prev)}
          >
            <svg
              className="nav-globe"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9.5" />
              <line x1="2.5" y1="12" x2="21.5" y2="12" />
              <ellipse cx="12" cy="12" rx="4.2" ry="9.5" />
            </svg>
            <span>{language}</span>
          </button>

          {langOpen && (
            <div
              role="listbox"
              aria-label="Select language"
              className="absolute right-0 top-full mt-2 min-w-[120px] rounded-xl bg-[#0D0A22]/90 backdrop-blur-md p-1.5 shadow-xl ring-1 ring-white/15 z-30"
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={language === lang.code}
                  onClick={() => {
                    onSelectLanguage(lang.code);
                    setLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition-colors cursor-pointer ${
                    language === lang.code
                      ? 'bg-white text-[#180F3C] font-semibold'
                      : 'text-white/85 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button type="button" className="nav-enquire" onClick={onEnquire}>
          Enquire
        </button>
      </div>
    </header>
  );
};
