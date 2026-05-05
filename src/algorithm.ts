export interface AsciiOptions {
  ramp: string;
  cellW: number;
  cellH: number;
  fontPx: number;
  alphaThreshold: number;
}

export const DEFAULT_OPTIONS: AsciiOptions = {
  ramp: " .:-=+*#%@",
  cellW: 8,
  cellH: 14,
  fontPx: 12,
  alphaThreshold: 16,
};

// `src` is expected to be at grid resolution already (one pixel per cell).
// Caller should downscale the source canvas via drawImage(..., gridW, gridH).
export function drawAscii(
  dst: CanvasRenderingContext2D,
  src: ImageData,
  opts: AsciiOptions,
): void {
  const { ramp, cellW, cellH, fontPx, alphaThreshold } = opts;
  const { width: gridW, height: gridH, data } = src;
  const lastIdx = ramp.length - 1;

  dst.clearRect(0, 0, dst.canvas.width, dst.canvas.height);
  dst.font = `${fontPx}px "JetBrains Mono", ui-monospace, Menlo, monospace`;
  dst.textBaseline = "alphabetic";

  for (let cy = 0; cy < gridH; cy++) {
    for (let cx = 0; cx < gridW; cx++) {
      const i = (cy * gridW + cx) * 4;
      const a = data[i + 3];
      if (a < alphaThreshold) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const ch = ramp[Math.floor((lum / 255) * lastIdx)];
      if (ch === " ") continue;
      dst.fillStyle = `rgb(${r},${g},${b})`;
      dst.fillText(ch, cx * cellW, cy * cellH + cellH - 2);
    }
  }
}
