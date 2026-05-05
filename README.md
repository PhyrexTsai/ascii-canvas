# @phyrex/ascii-canvas

![banner](https://raw.githubusercontent.com/phyrextsai/ascii-canvas/main/assets/banner.svg)

> Drop-in Web Component that turns any image, video, or canvas into **live ASCII art**.

```text
   +------------------+        +-----------------------+
   |   <img>          |        |                       |
   |   <video>        |  --->  |   <ascii-canvas>      |
   |   <canvas>       |        |                       |
   +------------------+        +-----------------------+
       any source                   ASCII output
```

[**Live demo →**](https://phyrextsai.github.io/ascii-canvas/) · [Live2D variant →](https://github.com/phyrextsai/ascii-canvas-live2d)

![showcase](https://raw.githubusercontent.com/phyrextsai/ascii-canvas/main/assets/showcase.gif)

- ~2.3 KB gzipped, ESM only
- Zero deps — no React, Vue, three.js, or pixi
- Works in any framework via Custom Elements
- Auto-pauses when scrolled offscreen, respects `prefers-reduced-motion`

---

## Quick start

### CDN

```html
<ascii-canvas id="ac" style="width: 320px; aspect-ratio: 1/1;"></ascii-canvas>
<script type="module">
  import "https://esm.sh/@phyrex/ascii-canvas";

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = "https://example.com/cat.jpg";
  img.onload = () => { document.getElementById("ac").source = img; };
</script>
```

### npm

```sh
npm install @phyrex/ascii-canvas
```

```js
import "@phyrex/ascii-canvas";

const ac = document.querySelector("ascii-canvas");
ac.source = someCanvasOrVideoOrImage;
```

The element registers itself as `<ascii-canvas>` on import. Set its CSS size; the grid is computed from `width / cell-w` × `height / cell-h`.

---

## API

### Attributes

| Attribute | Default | Description |
|---|---|---|
| `ramp` | `" .:-=+*#%@"` | Character set ordered dark→bright |
| `cell-w` | `8` | Grid cell width in CSS pixels |
| `cell-h` | `14` | Grid cell height in CSS pixels |
| `font-px` | `12` | Output font size |
| `alpha-threshold` | `16` | Skip cells whose source alpha is below this (0–255) |
| `paused` | (absent) | When present, freezes rendering |

All attributes reflect to `#opts` via `attributeChangedCallback`. Changing `cell-w` / `cell-h` recomputes the grid.

### Properties

| Property | Type | Description |
|---|---|---|
| `source` | `HTMLImageElement \| HTMLVideoElement \| HTMLCanvasElement \| null` | The drawable source. Setting `null` clears the output and stops the rAF loop. |

### Methods

| Method | Description |
|---|---|
| `pause()` | Equivalent to `setAttribute("paused", "")` |
| `resume()` | Equivalent to `removeAttribute("paused")` |

There is no `getText()`, no theming API, and no per-frame events. By design — see [tasks.md](./tasks.md) D8/D9.

### Lifecycle

The element automatically:

- Recomputes the grid via `ResizeObserver` when its container changes size
- Pauses the rAF loop when scrolled out of view (`IntersectionObserver`)
- Renders only one frame when `prefers-reduced-motion: reduce`
- Handles DPI: output canvas pixel dimensions are scaled by `devicePixelRatio` so text stays sharp on retina displays

---

## How it works

```text
  source                sample canvas              ascii ctx
  +------+   drawImage  +------+    getImageData   +-----+
  | img  |  ---------> | gridW |  ----------->    | drawAscii |
  | vid  |  (downscale) | gridH |   (RGBA bytes)   | (47 LOC)  |
  | cnv  |              +------+                   +-----+
  +------+                                              |
                                                        v
                                                output <ascii-canvas>
```

The 47-line core is a pure function: takes an `ImageData` already at grid resolution, picks a ramp character per cell by luminance, and `fillText`s it onto the output canvas. Everything else is the wrapper — `ResizeObserver`, `IntersectionObserver`, `prefers-reduced-motion`, attribute reflection, DPR, source race handling.

---

## Caveats

### CORS

`<img>` from a different origin will not throw on `drawImage`, but `getImageData` (which the lib uses internally) will throw `SecurityError: Tainted canvases may not be exported`.

Fix: add `crossorigin="anonymous"` to the `<img>` and ensure the server returns proper CORS headers.

```html
<img src="https://example.com/cat.jpg" crossorigin="anonymous">
```

### SSR

Custom Elements need a DOM. In server-side rendering frameworks:

- **Astro**: import in a `<script>` tag or use `client:load` directive
- **Next.js**: import inside a `useEffect` or use `next/dynamic` with `{ ssr: false }`
- **Nuxt / SvelteKit**: defer to client-only context

The element does nothing until `connectedCallback` fires in a browser.

---

## Comparison

| Project | Status (May 2026) | Framework lock-in | Live source |
|---|---|---|---|
| [drei `<AsciiRenderer>`](https://github.com/pmndrs/drei) | Active | three.js + react-three-fiber | Three.js scene only |
| [aalib.js](https://github.com/audionerd/aalib.js) | Last commit 2018 | None | Image / video |
| [textmode.js](https://github.com/datavis-tech/textmode.js) | Active | None | Image only, no Custom Element |
| [ts-ascii-engine](https://github.com/Zerefa/ts-ascii-engine) | Young (<1yr) | None | Canvas |
| [ascii-image](https://www.npmjs.com/package/ascii-image) | Dead | None | Image only |
| **@phyrex/ascii-canvas** | This | None | Image / video / canvas, Web Component |

---

## Development

```sh
git clone https://github.com/phyrextsai/ascii-canvas
cd ascii-canvas
npm install
npm test                          # build + types + size + visual
npm run update-baseline           # regenerate Playwright snapshot locally
node assets/gen-banner.mjs > assets/banner.svg   # regenerate the README banner
```

CI runs all tests on Linux. The Playwright baseline is therefore Linux-only; macOS / Windows baselines are gitignored. To regenerate the Linux baseline without a Linux machine, trigger the `update-baseline` workflow in GitHub Actions.

---

## License

MIT © 2026 Phyrex Tsai
