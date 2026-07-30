import { useState } from 'react';
import logoUrl from '../../image/covid-19-banner_6.png';
import { useEffect } from 'react';
import { forumRoute, portalSections } from '../data/portalSections.js';
import { Icon, icons } from '../icons.jsx';

export function SiteHeader({ currentRoute }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const scrollLockClass = 'mobile-navigation-open';
    document.documentElement.classList.toggle(scrollLockClass, menuOpen);
    document.body.classList.toggle(scrollLockClass, menuOpen);

    return () => {
      document.documentElement.classList.remove(scrollLockClass);
      document.body.classList.remove(scrollLockClass);
    };
  }, [menuOpen]);

  function handleNavigate(event) {
    setMenuOpen(false);
    event.currentTarget.blur();
  }

  return (
    <header className="site-header">
      <a className="site-brand" href={`#/${forumRoute}`} aria-label="Go to blog home" onClick={handleNavigate}>
        <img src={logoUrl} alt="INEM logo" className="site-logo" width="58" height="58" />
        <div className="site-brand-copy">
          <span className="site-kicker">Student Portal</span>
          <strong>Living Our Nariño Identity</strong>
        </div>
      </a>

      <button
        className="mobile-nav-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="mainNavigation"
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        onClick={() => setMenuOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={menuOpen ? 'main-nav main-nav-open' : 'main-nav'} id="mainNavigation" aria-label="Main navigation">
        <a className={currentRoute === forumRoute ? 'nav-link nav-link-active' : 'nav-link'} href={`#/${forumRoute}`} onClick={handleNavigate}>
          Blog
        </a>
        {portalSections.map((section) => {
          const sectionActive = currentRoute === section.route || section.items.some((item) => item.route === currentRoute);

          return (
            <div className="nav-item" key={section.id}>
              <a className={sectionActive ? 'nav-link nav-link-active' : 'nav-link'} href={`#/${section.route}`} onClick={handleNavigate}>
                <span>{section.label}</span>
                <Icon path={icons.chevron} className="nav-chevron" />
              </a>
              <div className="nav-dropdown">
                {section.items.map((item) => (
                  <a
                    className={currentRoute === item.route ? 'nav-dropdown-link nav-dropdown-link-active' : 'nav-dropdown-link'}
                    href={`#/${item.route}`}
                    key={item.id}
                    onClick={handleNavigate}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
    </header>
  );
}
