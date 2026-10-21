"use client";

import { useState } from "react";

const places = {
  accra: {
    label: "Accra office",
    detail: "GA-414-3438, La Bawaleshie, East Legon, Accra, Ghana",
  },
  mafi: {
    label: "Mafi Wudzrolo",
    detail: "The Rural Community Innovation Challenge engaged 70 students in hands-on problem-solving.",
  },
} as const;

type PlaceKey = keyof typeof places;

export function ImpactMap() {
  const [activePlace, setActivePlace] = useState<PlaceKey>("accra");

  function activatePlace(place: PlaceKey) {
    setActivePlace(place);
  }

  function handleKeyDown(event: React.KeyboardEvent<SVGGElement>, place: PlaceKey) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activatePlace(place);
    }
  }

  return (
    <div>
      <div className="map-frame">
        <svg viewBox="0 0 620 420" role="img" aria-labelledby="impact-map-title impact-map-description">
          <title id="impact-map-title">Spursbase Foundation locations in Ghana</title>
          <desc id="impact-map-description">Schematic map with selectable markers for the Accra office and Mafi Wudzrolo initiative.</desc>
          <defs>
            <pattern id="map-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="#cad5c9" />
            </pattern>
          </defs>
          <rect width="620" height="420" fill="url(#map-dots)" />
          <path d="M213 46 272 63 290 99 321 123 306 167 310 203 291 237 286 272 260 304 238 333 212 319 199 286 170 273 148 239 132 205 128 165 150 128 160 91 188 67Z" fill="#dce5d9" stroke="#738983" strokeWidth="2" />
          <path d="M135 281c42 16 86 22 146 5" fill="none" stroke="#a1b6a5" strokeWidth="2" strokeDasharray="5 7" />
          <text x="215" y="200" fill="#4b6762" fontSize="17" fontFamily="sans-serif" transform="rotate(-8 215 200)">GHANA</text>
          <g
            className="map-marker"
            role="button"
            tabIndex={0}
            aria-label="Show Accra office information"
            aria-pressed={activePlace === "accra"}
            onClick={() => activatePlace("accra")}
            onKeyDown={(event) => handleKeyDown(event, "accra")}
          >
            <circle cx="281" cy="281" r="12" />
            <circle cx="281" cy="281" r="21" fill="#f26e4333" stroke="none" />
            <text x="300" y="286" fill="#172e32" fontSize="13" fontWeight="700" fontFamily="sans-serif">Accra</text>
          </g>
          <g
            className="map-marker"
            role="button"
            tabIndex={0}
            aria-label="Show Mafi Wudzrolo project information"
            aria-pressed={activePlace === "mafi"}
            onClick={() => activatePlace("mafi")}
            onKeyDown={(event) => handleKeyDown(event, "mafi")}
          >
            <circle cx="269" cy="170" r="12" />
            <circle cx="269" cy="170" r="21" fill="#f26e4333" stroke="none" />
            <text x="288" y="175" fill="#172e32" fontSize="13" fontWeight="700" fontFamily="sans-serif">Mafi Wudzrolo</text>
          </g>
        </svg>
        <div className="map-key" aria-live="polite">
          <span><i aria-hidden="true" />{places[activePlace].label}</span>
          <span>{places[activePlace].detail}</span>
        </div>
      </div>
      <p className="map-caption">Schematic map. Markers are indicative and do not define project boundaries.</p>
    </div>
  );
}