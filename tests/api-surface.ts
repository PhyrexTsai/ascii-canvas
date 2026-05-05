// Compile-time API surface lock. Any rename / removal of public symbol breaks tsc.
// Reference: D8 (API frozen after Phase 1).

import {
  AsciiCanvasElement,
  DEFAULT_OPTIONS,
  drawAscii,
  type AsciiOptions,
} from "../src/index.js";

// 1. AsciiOptions type — every field must exist with right type.
const opts: AsciiOptions = {
  ramp: DEFAULT_OPTIONS.ramp,
  cellW: DEFAULT_OPTIONS.cellW,
  cellH: DEFAULT_OPTIONS.cellH,
  fontPx: DEFAULT_OPTIONS.fontPx,
  alphaThreshold: DEFAULT_OPTIONS.alphaThreshold,
};

// 2. drawAscii signature.
declare const ctx: CanvasRenderingContext2D;
declare const data: ImageData;
const drawn: void = drawAscii(ctx, data, opts);
void drawn;

// 3. AsciiCanvasElement: properties, methods, and CanvasImageSource union acceptance.
declare const el: AsciiCanvasElement;

// `source` accepts each variant of CanvasImageSource.
declare const img: HTMLImageElement;
declare const vid: HTMLVideoElement;
declare const cnv: HTMLCanvasElement;
el.source = img;
el.source = vid;
el.source = cnv;
el.source = null;
const got: CanvasImageSource | null = el.source;
void got;

// Methods.
el.pause();
el.resume();

// observedAttributes is static and a string list.
const obs: readonly string[] = AsciiCanvasElement.observedAttributes;
void obs;

// Element extends HTMLElement (so DOM APIs work).
el.setAttribute("ramp", " .:#@");
el.setAttribute("cell-w", "8");
el.setAttribute("cell-h", "14");
el.setAttribute("font-px", "12");
el.setAttribute("alpha-threshold", "16");
el.setAttribute("paused", "");
el.removeAttribute("paused");

// Constructor exists (custom element constructable via `new`).
declare const ctor: typeof AsciiCanvasElement;
void ctor;
