# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

UAGeoGuessr is a GeoGuessr-style game for the University of Arizona campus: the player is
dropped into a Street View panorama somewhere on campus, places a guess on a minimap, confirms,
and gets scored on how close their guess was to the real location.

## Running it

This is a static site with no build step, package manager, or test suite — just
`public/index.html`, `public/style.css`, and `public/game.js`, plus two logo images. Open
`public/index.html` directly in a browser, or serve the `public/` folder with any static file
server (e.g. `python3 -m http.server` from inside `public/`) if you need it served over `http://`
rather than `file://`.

The Google Maps JavaScript API is loaded via a `<script>` tag in `index.html` with an API key
and `libraries=marker,geometry` hardcoded in the URL. If a change needs another Maps JS library
(e.g. `places`), add it to that same query string.

## Architecture

Everything lives in `public/game.js` as module-level globals and functions — there's no bundler,
no modules, no framework:

- `initMaps()` is the callback the Maps script invokes once it loads (`callback=initMaps`). It
  wires up the Start button, the Confirm button, and a keydown handler that stops the Street View
  panorama from capturing WASD/arrow keys used elsewhere on the page.
- Clicking Start hides `#startScreen`, reveals `#fullMapScreen`, and calls `loadMaps()`, which
  constructs the `google.maps.StreetViewPanorama` (in `#screen`) and the `google.maps.Map`
  minimap (in `#map`) for the round. `answerPos` is the single hardcoded ground-truth location —
  there's currently only one round/location, not a pool to pick from.
- Clicking the minimap sets `currentGuess` and calls `handleMapClicks()`, which drops the guess
  marker (Arizona Wildcats logo) and reveals `#confirmButton`.
- Clicking Confirm runs `handleConfirmClick()`, which expands the minimap to fullscreen, computes
  and shows the score, drops the answer marker (`blacklogo.png`), fits the map bounds to both
  markers, and draws a line between guess and answer.
- `calculatePoints()` scores via exponential distance decay
  (`maxScore * exp(-distanceMeters / scale)`, `maxScore = 1000`, `scale = 500`), using
  `google.maps.geometry.spherical.computeDistanceBetween`, with a "close enough" snap to a
  perfect 1000 above a threshold.

### The minimap resize mechanism

`#map` is deliberately resized via plain CSS (`width`/`height`/`opacity`/`bottom`/`right`
transitions), not JS-driven resizing or `transform: scale`. Transform-based scaling was tried
first and rejected — it changes visual size without changing layout dimensions, which looks
broken. The three size states are:

- default: small, semi-transparent, anchored to the bottom-right corner
- `:hover` (only when not fullscreen — `:hover:not(.map-fullscreen)`): grows toward the
  top-left, still anchored bottom-right
- `.map-fullscreen` (added by `expandMapFullScreen()` on Confirm): grows to fill the screen,
  from the same bottom-right anchor

Because Google Maps does not detect plain CSS resizes on its own, a single generic
`transitionend` listener on `#map` (in `loadMaps()`) fires on any `width`/`height` transition end
and calls `google.maps.event.trigger(map, "resize")` followed by `map.setCenter(center)` to
re-center after the resize. Any new CSS-driven size change to `#map` will automatically get this
resize/re-center handling for free — no new JS is needed per size state.

### Styling

The UA brand palette is used throughout: navy (`#0c234b`/`#08152f`) backgrounds, red
(`#ab0520`/`#e0333f`/`#c40626`) accents, and the system sans-serif stack
(`-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`). Match this palette/font stack for
any new UI rather than introducing new colors or fonts.
