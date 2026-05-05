# ascii-canvas Task 清單

`<ascii-canvas>` 是一個框架無關的 Web Component，吃任意 source（image / video / canvas），輸出 ASCII art 到一個 output canvas。

研究顯示這個利基目前沒有「成熟 + 活躍 + 框架無關 + 吃 canvas」的現成方案——drei 綁 three、aalib.js 已老、textmode.js 沒元件包、ts-ascii-engine 太年輕、ascii-image 已死。本 repo 補這個缺口。

姊妹專案：[ascii-canvas-live2d](https://github.com/phyrextsai/ascii-canvas-live2d)（Live2D 模型 → ASCII，依賴本 lib）。

---

## 核心原則

- **單一資料流**：source → grid 取樣 → ramp 對應 → output。不加 plugin / event / theme 系統。
- **零框架依賴**：不能 import react / vue / pixi / three。
- **47 行核心保 47 行**：演算法本體不擴張，要擴張的是周邊（resize、observer、Custom Element wrapper）。
- **三種 source 同一條路徑**：image / video / canvas 都實作 `CanvasImageSource`，統一走 `drawImage(src, 0, 0, gridW, gridH)`，零 if/else 分支。
- **demo 即測試**：純 HTML demo 跑得起來就是通過驗證，不寫 unit test。

---

## 變更紀錄

- **2026-05-05**：repo 建立，npm 名稱 `ascii-canvas` unscoped 已被佔走（v0.3.0），改用 `@phyrextsai/ascii-canvas`。
- **2026-05-05**：Phase 0 完成（除推 GitHub 外）。`package.json`（scoped + ESM + MIT + typescript devDep）、`tsconfig.json`（target ES2022 / declaration / strict / verbatimModuleSyntax）、`.gitignore`、`LICENSE`、`README.md`、`src/index.ts` placeholder 就位。`npm install` 通過、`npx tsc --noEmit` exit 0。
- **2026-05-05**：tasks.md v2 改寫，砍 `getText()`、Phase 1 拆 1-a~1-f、新增 DPR / CORS 章節、新增 Phase 2.5 三層測試（tsc API fixture + bundle size + Playwright 截圖 diff）。
- **2026-05-05**：Phase 1 全做完（src/algorithm.ts + src/element.ts + src/index.ts），Phase 2 demo 三 case 完成，Phase 2.5 三層測試本地全綠（gzip 2334 B / 8000 B 預算）。
- **2026-05-05**：CI 與 Pages workflow 寫入 `.github/workflows/`，加 `update-baseline` workflow 處理跨平台 Playwright baseline。`*-darwin.png` 進 .gitignore，CI 只認 Linux baseline。README 完整版 + npm pack 9 檔 5.9 KB 確認 + scratch consumer tsc 過。

---

## 決策清單

| #  | 項目 | 決定 | 狀態 | 備註 |
|----|---|---|---|---|
| D1 | Repo 名 | `phyrextsai/ascii-canvas` | ✅ | |
| D2 | npm 套件名 | `@phyrextsai/ascii-canvas` | ✅ 2026-05-05 | unscoped `ascii-canvas` 已被佔（v0.3.0） |
| D3 | License | MIT | ✅ | |
| D4 | 模組格式 | ESM only | ✅ | 2026 年了，CJS 等有人抱怨再說 |
| D5 | Build 工具 | tsc 直出 dist，無 bundler | ✅ | lib 不該預先打包，留給消費者 tree-shake |
| D6 | 演算法起點 | 從 shikigami `src/lib/ascii.ts` 複製，**非 import 非 submodule** | ✅ | 兩邊獨立演化 |
| D7 | 測試策略 | 三層自動化（tsc + bundle size + Playwright 截圖 diff）+ 手動驗證表，不寫 unit test | ✅ 2026-05-05 修訂 | unit test 對 47 行純函式是 theater；自動化抓 API 崩、肥胖、視覺回歸；手動驗證真實視覺品質 |
| D8 | API 凍結時點 | Phase 1 結束後不再加 attribute / method | ⏳ | |
| D9 | `getText()` method | **不做**。演算法 47 行一條龍，無中間字元網格；YAGNI | ✅ 2026-05-05 | 真的有人要再加並列 `drawAsciiToText()`，不污染主路徑 |
| D10 | DPR 處理 | 輸出 canvas 像素尺寸 × DPR，sample canvas 不乘 | ✅ 2026-05-05 | retina 字才不糊 |
| D11 | Playwright 截圖 diff | 加。視為 public 套件的最低自動化保險 | ✅ 2026-05-05 | CI 只用 Linux baseline；macOS / Windows 衍生 .png 進 gitignore |

---

## Phase 0：Repo 初始化（半天）

- [x] `npm view @phyrextsai/ascii-canvas` 確認名稱可用（2026-05-05 確認 404）
- [x] 建立目錄 + `git init`（2026-05-05）
- [x] `package.json`（scoped、ESM、MIT）（2026-05-05）
- [x] `tasks.md`（本檔）（2026-05-05）
- [x] `tsconfig.json`：target ES2022、module ESNext、`declaration: true`、strict（2026-05-05）
- [x] `.gitignore`：node_modules / dist / .DS_Store（2026-05-05）
- [x] `README.md` placeholder（2026-05-05）
- [x] `LICENSE`（MIT）（2026-05-05）
- [x] `src/index.ts` placeholder（讓 tsc 有東西吃）（2026-05-05）
- [ ] 推上 GitHub `phyrextsai/ascii-canvas`（public）— 等使用者執行 `gh repo create`

**Phase 0 驗證**

| #  | 驗證項 | 狀態 |
|----|---|---|
| 0-1 | `npm install` 通過 | ✅ 2026-05-05 |
| 0-2 | 空的 `tsc --noEmit` 通過 | ✅ 2026-05-05（exit 0）|
| 0-3 | repo 在 GitHub public 可訪問 | ⏳ 待推送 |

---

## Phase 1：實作（一天，分 6 個漸進子步驟）

> 為什麼分子步驟：包裝層真正的複雜度在「五個非同步觸發源」（rAF / ResizeObserver / IntersectionObserver / reduced-motion / paused）。一坨上去，bug 出現時無從定位是哪個觀察器在亂發訊號。所以一個一個串。

### 1-a 演算法搬家 + 靜態圖一幀

- [x] `src/algorithm.ts`：從 shikigami `src/lib/ascii.ts` 整檔複製，**零修改**
  - 對外：`AsciiOptions`、`DEFAULT_OPTIONS`（` .:-=+*#%@` ramp、cell 8×14、12px 字、alpha 16）、`drawAscii(dst, src: ImageData, opts)`
  - 約定：呼叫端**先**把 source `drawImage` 縮到 gridW×gridH，這函式只吃已縮過的 ImageData
- [x] `src/element.ts`：`AsciiCanvasElement extends HTMLElement` 最小骨架
  - shadow DOM 內含 output canvas
  - 一個隱藏的 sample canvas（一像素一格的縮圖暫存）
  - `connectedCallback` 中：用容器尺寸算 `gridW = floor(rect.width / cellW)` / `gridH`，sample canvas 設成 `gridW × gridH`，output canvas 像素尺寸 `gridW * cellW * dpr × gridH * cellH * dpr`、CSS 尺寸不乘 DPR、ctx `setTransform(dpr,0,0,dpr,0,0)`
  - `set source(v)` setter：存欄位；若已 connected，呼叫一次 `#renderOnce()`
  - `#renderOnce()`：sample ctx clear → drawImage(source, 0, 0, gridW, gridH) → getImageData → drawAscii
- [x] `src/index.ts`：`export * from './algorithm.js'; export * from './element.js'; customElements.define('ascii-canvas', AsciiCanvasElement)`

**1-a 驗證**

| #  | 驗證項 |
|----|---|
| 1a-1 | `tsc --noEmit` 通過 |
| 1a-2 | `npm run build` 產出 `dist/index.js` + `dist/index.d.ts` |
| 1a-3 | 寫個最小 `tmp/index.html`：`<img>` 載入後賦給 element.source，瀏覽器看到 ASCII 輸出（**這是整個專案的「Hello World」**）|

### 1-b ResizeObserver

- [x] `element.ts` 加入 `ResizeObserver(this)` 監聽自身
- [x] callback 中：重新 `#recomputeGrid()`（重設兩張 canvas 尺寸）→ 若有 source，呼叫 `#renderOnce()`

**1-b 驗證**

| #  | 驗證項 |
|----|---|
| 1b-1 | DevTools 改 element 寬高，ASCII grid 跟著重排，無錯位、無殘影 |

### 1-c rAF loop（換 video source）

- [x] 新增 `#tick()`：渲染一幀後 `requestAnimationFrame(this.#tick)`
- [x] `set source` 在 connected 時改呼叫 `#tick()`（不再是 `#renderOnce`）
- [x] `disconnectedCallback`：`cancelAnimationFrame(#rafId)`

**1-c 驗證**

| #  | 驗證項 |
|----|---|
| 1c-1 | `<video autoplay loop muted playsinline>` 接上後 ASCII 連續更新 |
| 1c-2 | DevTools Performance 60fps，無記憶體成長 |

### 1-d IntersectionObserver

- [x] `IntersectionObserver(this, { threshold: 0 })`
- [x] entry.isIntersecting 變 false：`#visible = false`，`#tick()` 早退、不排下一幀
- [x] false → true：呼叫 `#tick()` 重啟

**1-d 驗證**

| #  | 驗證項 |
|----|---|
| 1d-1 | element 滾出視窗：Performance flame chart 在 element 區段變空 |
| 1d-2 | 滾回來自動恢復渲染 |

### 1-e prefers-reduced-motion

- [x] `matchMedia('(prefers-reduced-motion: reduce)')` 監聽 change
- [x] match 時：`#tick()` 渲染一幀後 `return`，不排下一幀
- [x] unmatch 時：呼叫 `#tick()` 恢復連續渲染

**1-e 驗證**

| #  | 驗證項 |
|----|---|
| 1e-1 | DevTools `Cmd-Shift-P` → "Emulate prefers-reduced-motion: reduce"，渲染一幀後停 |
| 1e-2 | 切回 "no-preference"，自動恢復 |

### 1-f attribute 反射 + paused

- [x] `static observedAttributes = ['ramp','cell-w','cell-h','font-px','alpha-threshold','paused']`
- [x] `attributeChangedCallback`：統一映射到 `#opts`（見映射表）。`cell-w` / `cell-h` 變動還要 `#recomputeGrid()`
- [x] `paused` 屬性：`hasAttribute('paused')` boolean。true → `#tick` 早退；false → 重啟
- [x] `pause()` / `resume()` method：等價於 setAttribute / removeAttribute paused

**Attribute → option 映射**

| attribute | option | parse |
|---|---|---|
| `ramp` | `ramp` | 字串原值 |
| `cell-w` | `cellW` | `Number(v)` 且 `>0`，否則用 default |
| `cell-h` | `cellH` | 同上 |
| `font-px` | `fontPx` | 同上 |
| `alpha-threshold` | `alphaThreshold` | 同上 |
| `paused` | （不入 opts）| `hasAttribute` boolean |

**1-f 驗證**

| #  | 驗證項 |
|----|---|
| 1f-1 | DevTools 改 `cell-w="6"`，grid 變密，重新 layout |
| 1f-2 | `el.setAttribute('paused','')` 凍結；`el.removeAttribute('paused')` 恢復 |
| 1f-3 | `el.pause()` / `el.resume()` 等效 |

### Phase 1 整體驗證

| #  | 驗證項 |
|----|---|
| 1-1 | `tsc --noEmit` 通過 |
| 1-2 | `dist/index.js` + `dist/index.d.ts` 存在 |
| 1-3 | API surface 釘死（D8）— 無 getText、無 event、無 theme |
| 1-4 | 三種 source（image / video / canvas）都能跑同一條 `drawImage` 路徑，element.ts 內無 `instanceof HTMLVideoElement` 之類分支 |

---

## Phase 2：Demo 站（半天）

- [x] `demo/index.html`：landing page，三個 case 並列
  1. 靜態圖：data URI（避免 CORS）→ `<ascii-canvas>`
  2. 影片：透過 `canvas.captureStream()` 把動畫 canvas 灌進 `<video>` → `<ascii-canvas>`
  3. 動畫 canvas：JS 畫 rotating hexagon → `<ascii-canvas>`
- [x] Demo HTML 用 `<script type="module">` 直接載入 dist，無 bundler
- [x] `.github/workflows/pages.yml`：push main → tsc build → assemble `_site` (含 redirect index → /demo/) → deploy GH Pages

**Phase 2 驗證**

| #  | 驗證項 | 怎麼驗 |
|----|---|---|
| 2-1 | `npx serve .` 三個 case 都顯示 ASCII | browser |
| 2-2 | console 無 error / warning | DevTools |
| 2-3 | gzipped 大小 < 8kb | `gzip -c dist/*.js \| wc -c` |
| 2-4 | **Shikigami sanity check**：開 shikigami dev server，DevTools 注入 dist/index.js，建 `<ascii-canvas>`，把 source 設成 hidden Live2D canvas，視覺輸出與現有 ASCII 等同 | 不 commit shikigami |
| 2-5 | GH Pages URL 公開可訪問 | browser |
| 2-6 | 行動裝置 4G 跑得動 | 手機實測 |

---

## Phase 2.5：測試 / CI（半天）

> 為什麼有這個 phase：D7 「demo 即驗證」原意是「不寫 mock 出來的 unit test」，但這不等於沒測試。本 phase 補三層自動化，讓 1-a~1-f 的手動驗證表變成可機器執行的回歸防線。

### T1 型別 + API surface fixture

- [x] `tests/api-surface.ts` 用到每個 public API；任何 rename / removal → `tsc -p tests/tsconfig.json` 紅燈
- [x] `npm run test:types` 接通

### T2 Bundle size budget

- [x] `tests/check-size.mjs` gzip 全部 `dist/*.js` 加總比對 8000 bytes
- [x] `npm run test:size` 接通；當前 2334 B / 8000 B

### T3 Playwright headless 截圖 diff

- [x] `@playwright/test` 安裝、`playwright.config.ts` 設好（webServer 用 `tests/serve.mjs` 自寫 30 行 node static server，不再多裝 dep）
- [x] `tests/visual.spec.ts`：emulate reduced-motion 讓 lib 走單幀路徑、`?test=1` 凍結動畫、檢查三個 case 都有 alpha>0 內容、整頁截圖 diff、檢查無 console error
- [x] CI 失敗時自動上傳 `playwright-report` + `test-results` + 截圖 artifact

### T4 手動驗證表（不變）

- 1-a~1-f 各小步驟的驗證仍由開發者手動跑一次
- shikigami sanity check (Phase 2-4) + 4G 行動 (2-6) 是手動

### CI workflow

- [x] `.github/workflows/ci.yml`：push/PR → `npm ci` → cache Playwright browsers → `npx playwright install --with-deps chromium` → build → test:types → test:size → test:visual；失敗 upload artifact
- [x] `.github/workflows/pages.yml`：push main / workflow_dispatch → build → 拼 `_site/` (含 root redirect index)→ deploy
- [x] `.github/workflows/update-baseline.yml`：workflow_dispatch 一鍵生 Linux Playwright baseline 並 commit 回 repo

**Phase 2.5 驗證**

| #  | 驗證項 |
|----|---|
| 2.5-1 | 故意改 `AsciiCanvasElement.pause` → `freeze`，`test:types` 紅燈 |
| 2.5-2 | 故意 import 一個 1MB lodash 進 element.ts，`test:size` 紅燈 |
| 2.5-3 | 故意把 `cellW` default 從 8 改 16，Playwright 截圖 diff 紅燈 |
| 2.5-4 | 三條都通過後 CI 全綠 |

---

## Phase 3：Publish 前打磨（半天）

- [x] `README.md` 完整版：一句話介紹、Quick start (CDN + npm)、API 表、CORS / SSR 註記、對手比較表、Development、License、Credits（demo gif 缺，等 Pages 部署後手動補）
- [x] `package.json` metadata 已 review（description / keywords / homepage / repository / bugs / publishConfig.access 全有）
- [x] tsconfig 拿掉 `declarationMap`（消費者拿不到 .ts 原始碼，map 沒用）
- [x] `npm pack --dry-run`：9 檔 5.9 KB（LICENSE、README、dist 6 檔、package.json）；無 src/、無 demo/、無 tests/、無 .github/

**Phase 3 驗證**

| #  | 驗證項 | 結果 |
|----|---|---|
| 3-1 | `npm pack --dry-run` 內容檢查通過 | ✅ 9 檔 5.9 KB |
| 3-2 | scratch 專案 `npm i ./phyrextsai-ascii-canvas-0.0.1.tgz`，寫個 .ts 用所有 public API，`tsc --noEmit` exit 0 | ✅ 2026-05-05 |
| 3-3 | TypeScript 消費者拿得到型別（同 3-2） | ✅ |
| 3-4 | `npm publish --dry-run --access public` | ⏳ Phase 4 要 publish 前再跑 |

---

## Phase 4：Publish（半小時，選擇性）

- [ ] `npm publish --access public`（scoped 套件預設 private，必加 flag）
- [ ] `git tag v0.0.1` + push
- [ ] README 加 npm badge

Phase 3 結束已有可用 tarball；Phase 4 是「要不要當 npm 維護者」的選擇題。

---

## 設計細節（給未來實作者看）

### 三種 source 走同一條路徑（好品味）

`HTMLImageElement` / `HTMLVideoElement` / `HTMLCanvasElement` 都實作 `CanvasImageSource`，所以：

```
sampleCtx.drawImage(this.#source, 0, 0, this.#gridW, this.#gridH)
```

一行通吃，無 `instanceof` 分支。Linus 法則：「好代碼沒有特殊情況」。

### Grid / DPR 計算

```
const rect = this.getBoundingClientRect()
const dpr  = window.devicePixelRatio || 1

this.#gridW = Math.max(1, Math.floor(rect.width  / cellW))
this.#gridH = Math.max(1, Math.floor(rect.height / cellH))

// sample canvas：一像素一格，**不乘 DPR**
sampleCanvas.width  = this.#gridW
sampleCanvas.height = this.#gridH

// 輸出 canvas：CSS 尺寸照容器，**像素尺寸乘 DPR**，避免 retina 糊字
outputCanvas.style.width  = `${this.#gridW * cellW}px`
outputCanvas.style.height = `${this.#gridH * cellH}px`
outputCanvas.width  = this.#gridW * cellW * dpr
outputCanvas.height = this.#gridH * cellH * dpr
this.#outputCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
```

### `#tick()` 控制流

```
if (#paused || !#visible || !#source) return   // 早退，不排下一幀
sampleCtx.clearRect(0, 0, gridW, gridH)
sampleCtx.drawImage(#source, 0, 0, gridW, gridH)
const data = sampleCtx.getImageData(0, 0, gridW, gridH)
drawAscii(#outputCtx, data, #opts)
if (#reducedMotion) return                     // 只渲染一幀
#rafId = requestAnimationFrame(this.#tick)
```

`source = null` 時：setter 內 `clearRect` 一次 output，避免殘留上一幀。

### Source race condition

`source` 可能在 element `connectedCallback` 之前被 set（消費者拿 ref 時序不可控）。

- Setter 只存 `#source`
- `connectedCallback` 結尾呼叫 `#tick()`
- 自然處理「先 set 後 connect」與「先 connect 後 set」兩種順序，無分支

### CORS

`<img>` 跨來源時 `drawImage` 不會錯，但 `getImageData` 會拋 `SecurityError: Tainted canvases may not be exported`。

- demo 用本地圖或 `<img crossorigin="anonymous">`
- README 明確標註
- lib 內**不**捕捉 / 不降級——讓 console error 講真話

---

## 不做清單

- ❌ Theming / color modes API
- ❌ Plugin 系統
- ❌ Per-frame event 流（`asciiframe` / `asciirender`）
- ❌ Shader / WebGL 模式
- ❌ SSR
- ❌ React / Vue 專屬 wrapper（消費者自寫，Web Component 已是公分母）
- ❌ Unit test on `drawAscii`（pure function 對 ImageData 出 canvas 狀態，assert 寫不出有意義的）
- ❌ Mock DOM 的 Custom Element 測試（測 mock 不是測 code）
- ❌ `getText()` method（D9）
- ❌ algorithm.ts 拆「字元網格 vs 渲染」兩步
- ❌ Worker / OffscreenCanvas（47 行純函式不需要，行動 4G 跑得動）
- ❌ Shadow DOM 對外開 CSS slot

---

## 風險紀錄

| 風險 | 緩解 |
|---|---|
| 沒有生產消費者，bug 難以暴露 | Phase 2-4 sanity check 用 shikigami 補 |
| API 凍結後社群要求新功能 | 拒絕；用 fork / wrapper 解決 |
| Custom Element SSR 報錯 | README 加註：客戶端載入；Astro 用 `client:load` 或 imperative script |
| 跨來源圖片 SecurityError | README 註記 `crossorigin="anonymous"`；lib 內不降級 |
| Retina 字模糊 | DPR 處理見「Grid / DPR 計算」章節 |

---

_最後更新：2026-05-05_
