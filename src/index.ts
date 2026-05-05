export { drawAscii, DEFAULT_OPTIONS } from "./algorithm.js";
export type { AsciiOptions } from "./algorithm.js";
export { AsciiCanvasElement } from "./element.js";

import { AsciiCanvasElement } from "./element.js";

if (!customElements.get("ascii-canvas")) {
  customElements.define("ascii-canvas", AsciiCanvasElement);
}
