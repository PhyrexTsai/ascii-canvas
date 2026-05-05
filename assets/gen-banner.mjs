// One-shot generator for assets/banner.svg.
// Produces a wave of ramp characters that cycles across the banner — pure SMIL,
// renders directly on GitHub via camo without any JS.
//
// Run: node assets/gen-banner.mjs > assets/banner.svg

const ramp = " .:-=+*#%@";
const cols = 38;        // columns of the wave
const cellW = 14;       // px per column
const padX = 16;        // left padding
const padY = 28;        // text baseline y
const cycle = 2.4;      // seconds for full cycle
const colors = ["#ff5577", "#ffaa44", "#ffe14d", "#22ddaa", "#44bbff", "#aa66ff"];

const width = padX * 2 + cols * cellW;
const height = 48;

// Each column = stacked text elements, one per ramp char, opacity-keyed.
// Timing: char i visible during (i/N..(i+1)/N) of the cycle. Stagger begin per column.
function column(c) {
  const begin = -((c / cols) * cycle).toFixed(3); // negative begin = pre-rolled phase
  const color = colors[c % colors.length];
  return ramp
    .split("")
    .map((ch, i) => {
      const slot = i / ramp.length;
      const next = (i + 1) / ramp.length;
      const half = (slot + next) / 2;
      // visible only across this slot's window, fading in/out at the edges
      const values = [0, 0, 1, 1, 0, 0].join(";");
      const keyTimes = [0, slot, slot + 0.005, next - 0.005, next, 1].join(";");
      const xml = ch === " "
        ? "" // no point drawing space
        : `    <text x="${padX + c * cellW}" y="${padY}" fill="${color}" opacity="0">${escapeXml(ch)}<animate attributeName="opacity" values="${values}" keyTimes="${keyTimes}" dur="${cycle}s" begin="${begin}s" repeatCount="indefinite"/></text>`;
      return xml;
    })
    .filter(Boolean)
    .join("\n");
}

function escapeXml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

const cells = Array.from({ length: cols }, (_, c) => column(c)).join("\n");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="ascii-canvas live banner">
  <title>ascii-canvas — live banner</title>
  <style>
    text { font-family: ui-monospace, "JetBrains Mono", "SF Mono", Menlo, monospace; font-size: 20px; font-weight: 600; }
  </style>
  <rect width="100%" height="100%" fill="#0e0e10"/>
  <g>
${cells}
  </g>
</svg>
`;

process.stdout.write(svg);
