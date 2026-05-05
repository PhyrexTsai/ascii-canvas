import { drawAscii, DEFAULT_OPTIONS, type AsciiOptions } from "./algorithm.js";

const ATTR_TO_OPT = {
  "ramp": "ramp",
  "cell-w": "cellW",
  "cell-h": "cellH",
  "font-px": "fontPx",
  "alpha-threshold": "alphaThreshold",
} as const;

type AttrName = keyof typeof ATTR_TO_OPT;

export class AsciiCanvasElement extends HTMLElement {
  static observedAttributes = [
    "ramp",
    "cell-w",
    "cell-h",
    "font-px",
    "alpha-threshold",
    "paused",
  ];

  #outputCanvas: HTMLCanvasElement;
  #outputCtx: CanvasRenderingContext2D;
  #sampleCanvas: HTMLCanvasElement;
  #sampleCtx: CanvasRenderingContext2D;
  #source: CanvasImageSource | null = null;
  #opts: AsciiOptions = { ...DEFAULT_OPTIONS };
  #gridW = 0;
  #gridH = 0;
  #rafId: number | null = null;
  #paused = false;
  #visible = true;
  #reducedMotion = false;
  #resizeObs: ResizeObserver;
  #interObs: IntersectionObserver;
  #motionMql: MediaQueryList;
  #motionListener = (e: MediaQueryListEvent) => {
    this.#reducedMotion = e.matches;
    if (!e.matches) this.#kick();
  };

  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = ":host { display: block; }";
    root.appendChild(style);

    this.#outputCanvas = document.createElement("canvas");
    this.#outputCanvas.style.display = "block";
    this.#outputCtx = this.#outputCanvas.getContext("2d")!;
    root.appendChild(this.#outputCanvas);

    this.#sampleCanvas = document.createElement("canvas");
    this.#sampleCtx = this.#sampleCanvas.getContext("2d", {
      willReadFrequently: true,
    })!;

    this.#resizeObs = new ResizeObserver(() => {
      if (!this.isConnected) return;
      this.#recomputeGrid();
      this.#kick();
    });

    this.#interObs = new IntersectionObserver(
      (entries) => {
        const wasVisible = this.#visible;
        this.#visible = entries[0]?.isIntersecting ?? true;
        if (!wasVisible && this.#visible) this.#kick();
      },
      { threshold: 0 },
    );

    this.#motionMql = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.#reducedMotion = this.#motionMql.matches;
  }

  connectedCallback() {
    this.#recomputeGrid();
    this.#resizeObs.observe(this);
    this.#interObs.observe(this);
    this.#motionMql.addEventListener("change", this.#motionListener);
    this.#kick();
  }

  disconnectedCallback() {
    this.#resizeObs.disconnect();
    this.#interObs.disconnect();
    this.#motionMql.removeEventListener("change", this.#motionListener);
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
  }

  attributeChangedCallback(
    name: string,
    _old: string | null,
    val: string | null,
  ) {
    if (name === "paused") {
      this.#paused = val !== null;
      if (!this.#paused) this.#kick();
      return;
    }
    const optKey = ATTR_TO_OPT[name as AttrName];
    if (!optKey) return;
    if (optKey === "ramp") {
      this.#opts.ramp = val ?? DEFAULT_OPTIONS.ramp;
    } else {
      const n = Number(val);
      this.#opts[optKey] =
        Number.isFinite(n) && n > 0 ? n : DEFAULT_OPTIONS[optKey];
    }
    if (this.isConnected && (name === "cell-w" || name === "cell-h")) {
      this.#recomputeGrid();
    }
    this.#kick();
  }

  get source(): CanvasImageSource | null {
    return this.#source;
  }

  set source(v: CanvasImageSource | null) {
    this.#source = v;
    if (v === null) {
      this.#outputCtx.clearRect(
        0,
        0,
        this.#outputCanvas.width,
        this.#outputCanvas.height,
      );
      if (this.#rafId !== null) {
        cancelAnimationFrame(this.#rafId);
        this.#rafId = null;
      }
      return;
    }
    this.#kick();
  }

  pause() {
    this.setAttribute("paused", "");
  }

  resume() {
    this.removeAttribute("paused");
  }

  #recomputeGrid() {
    const rect = this.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const { cellW, cellH } = this.#opts;

    this.#gridW = Math.max(1, Math.floor(rect.width / cellW));
    this.#gridH = Math.max(1, Math.floor(rect.height / cellH));

    this.#sampleCanvas.width = this.#gridW;
    this.#sampleCanvas.height = this.#gridH;

    this.#outputCanvas.style.width = `${this.#gridW * cellW}px`;
    this.#outputCanvas.style.height = `${this.#gridH * cellH}px`;
    this.#outputCanvas.width = this.#gridW * cellW * dpr;
    this.#outputCanvas.height = this.#gridH * cellH * dpr;
    this.#outputCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  #kick = () => {
    if (this.#rafId !== null) return;
    if (!this.isConnected || this.#paused || !this.#visible || !this.#source) {
      return;
    }
    this.#rafId = requestAnimationFrame(this.#tick);
  };

  #tick = () => {
    this.#rafId = null;
    if (!this.isConnected || this.#paused || !this.#visible || !this.#source) {
      return;
    }

    this.#sampleCtx.clearRect(0, 0, this.#gridW, this.#gridH);
    this.#sampleCtx.drawImage(this.#source, 0, 0, this.#gridW, this.#gridH);
    const data = this.#sampleCtx.getImageData(0, 0, this.#gridW, this.#gridH);
    drawAscii(this.#outputCtx, data, this.#opts);

    if (this.#reducedMotion) return;
    this.#rafId = requestAnimationFrame(this.#tick);
  };
}
