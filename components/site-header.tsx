"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const navigationLinks = [
  ["Home", "/"],
  ["About", "/about"],
  ["Library", "/library"],
  ["Blog", "/blog"],
  ["Get Involved", "/involve"],
  ["Contact", "/contact"],
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function closeOutsideMenu(event: PointerEvent) {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("pointerdown", closeOutsideMenu);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutsideMenu);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [menuOpen]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 769px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    desktopQuery.addEventListener("change", closeOnDesktop);
    return () => desktopQuery.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <header className={`site-header${menuOpen ? " menu-open" : ""}`} ref={headerRef}>
      <div className="container">
        <Link href="/" className="logo" aria-label="Spursbase Foundation home">
          <img src="/img/SpursbasefoundationlandscapeB-08.png" alt="Spursbase Foundation" />
        </Link>
        <nav className={`main-nav${menuOpen ? " open" : ""}`} id="primary-navigation" aria-label="Main navigation">
          <ul className="nav-menu">
            {navigationLinks.map(([label, href]) => (
              <li key={href}>
                <Link href={href} onClick={() => setMenuOpen(false)}>{label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="header-right">
          <button
            className="nav-toggle"
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-controls="primary-navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
          <Link className="donate-btn" href="/donation"><span className="donate-text">Donate Now</span></Link>
        </div>
      </div>
    </header>
  );
}