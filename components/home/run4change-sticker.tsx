"use client";

import { useState } from "react";

export function Run4ChangeSticker() {
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <aside className="r4c-sticker" aria-label="Run for Change 2026">
        <button className="r4c-sticker__bubble" type="button" onClick={() => setIsMinimized(false)}>
          <span>Run for Change 2026</span>
          <span aria-hidden="true">+</span>
        </button>
      </aside>
    );
  }

  return (
    <aside className="r4c-sticker" aria-label="Run for Change 2026">
      <section className="r4c-sticker__card">
        <header className="r4c-sticker__header">
          <p className="r4c-sticker__eyebrow">Spursbase Foundation</p>
          <h2>Run for Change 2026</h2>
        </header>
        <div className="r4c-sticker__body">
          <p>September 26, 2026 · Accra</p>
          <p>Thank you for being part of this year&apos;s event.</p>
          <div className="r4c-sticker__actions">
            <a className="r4c-sticker__link" href="/run4change">View event</a>
            <button
              className="r4c-sticker__toggle"
              type="button"
              aria-label="Minimize Run for Change panel"
              onClick={() => setIsMinimized(true)}
            >
              <span aria-hidden="true">−</span>
            </button>
          </div>
        </div>
      </section>
    </aside>
  );
}