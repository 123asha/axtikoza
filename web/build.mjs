import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";

const PEN_CSS = `
  html, body { margin: 0; height: 100%; overflow: hidden; background: #eef2f7; font-family: "Press Start 2P", ui-monospace, monospace; color: #3b2b31; }
  #root { position: fixed; inset: 0; }
  .stage { position: fixed; inset: 0; user-select: none; -webkit-user-select: none; touch-action: none; }
  .baton { position: fixed; left: 0; top: 0; z-index: 4; pointer-events: none; opacity: 0; transform-origin: 0 0; will-change: transform; }
  .me-arrow { position: absolute; transform: translateX(-50%); font-size: 28px; color: #d4509f; text-shadow: 2px 2px 0 #3b2b31; pointer-events: none; line-height: 1; }
  .shout.small { font-size: 9px; padding: 4px 5px 3px; color: #6d6168; border-width: 2px; box-shadow: 2px 2px 0 rgba(59,43,49,.2); }
  .zoombar { gap: 8px; align-items: flex-end; }
  .find-me { font-size: 10px; padding: 10px 11px 9px; background: #fff; color: #d4509f; border: 2px solid #3b2b31; box-shadow: 4px 4px 0 rgba(59,43,49,.2); }
  .find-me:hover { background: #fbeef6; }
  .transport button.on { background: #3b2b31; color: #fff; }
  .scene { position: relative; height: 210px; margin: 0 0 16px; overflow: hidden; border: 2px solid #dfe4ec;
           background: linear-gradient(#c9d6e7 0%, #e6edf5 55%, #f5f8fb 56%, #ffffff 100%); }
  .scene-peaks { position: absolute; left: -10%; right: -10%; top: 60px; height: 70px;
                 background: linear-gradient(135deg, transparent 49%, #d3ddea 50%) 0 0 / 140px 70px repeat-x,
                             linear-gradient(225deg, transparent 49%, #d3ddea 50%) 70px 0 / 140px 70px repeat-x; opacity: .9; }
  .scene-snow { position: absolute; left: 0; right: 0; top: 118px; bottom: 0; background: #f7f9fc; border-top: 3px solid #fff; }
  .scene .plate { opacity: 1; }
  .flake { position: absolute; background: #fff; box-shadow: 0 0 0 1px rgba(160,180,210,.35); pointer-events: none; }
  @media (pointer: coarse) {
    .zoom button, .transport button, .find-me { min-height: 40px; min-width: 40px; font-size: 11px; }
    .zoom input[type=range] { width: 110px; }
    .cta { padding: 14px 16px 13px; }
  }
  .zoombar { bottom: 12px; display: flex; justify-content: flex-end; }
  .zoom { display: flex; align-items: center; gap: 8px; padding: 7px 9px; background: rgba(255,255,255,.94);
          border: 2px solid #3b2b31; box-shadow: 4px 4px 0 rgba(59,43,49,.2); }
  .zoom button { font-size: 11px; min-width: 30px; padding: 6px 7px 5px; background: #fff; color: #3b2b31; border: 2px solid #3b2b31; }
  .zoom button:hover { background: #eef2f7; }
  .zoom span { font-size: 9px; color: #6d6168; min-width: 34px; }
  .zoom input[type=range] { -webkit-appearance: none; appearance: none; width: 150px; height: 8px; background: #dfe4ec; border: 2px solid #3b2b31; }
  .zoom input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 20px; background: #d4509f; border: 2px solid #3b2b31; cursor: pointer; }
  .zoom input[type=range]::-moz-range-thumb { width: 12px; height: 18px; background: #d4509f; border: 2px solid #3b2b31; border-radius: 0; cursor: pointer; }
  .zoom input[type=range]:focus-visible { outline: 3px solid #4a7fd8; outline-offset: 2px; }
  [data-goat] { cursor: pointer; }
  .group-label { position: absolute; transform: translateX(-50%); white-space: nowrap; font-size: 8px; line-height: 1;
                 padding: 4px 6px 3px; background: rgba(255,255,255,.85); border: 2px solid; color: #3b2b31; }
  .group-label em { font-style: normal; margin-left: 6px; color: #857a80; }
  .group-label.on { background: var(--c, #fff); color: #fff; }
  .group-label.on em { color: rgba(255,255,255,.85); }
  .group-label.wait { animation: blinkbg .25s steps(1) infinite; }
  @keyframes blinkbg { 50% { background: #fff3fa; } }
  .group-label { cursor: zoom-in; }
  .cluster { position: absolute; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center;
             background: #fff; border: 3px solid var(--c); border-radius: 50%; box-shadow: 3px 3px 0 rgba(59,43,49,.22);
             cursor: zoom-in; transition: width .08s, height .08s; }
  .cluster b { font-size: 12px; font-weight: 400; color: #3b2b31; }
  .cluster span { position: absolute; top: calc(100% + 6px); left: 50%; transform: translateX(-50%); white-space: nowrap;
                  font-size: 8px; padding: 3px 5px 2px; background: rgba(255,255,255,.9); color: #3b2b31; }
  .cluster.on { background: var(--c); }
  .cluster.on b { color: #fff; }
  .cluster.wait { animation: blinkbg .25s steps(1) infinite; }
  .cluster:hover { box-shadow: 0 0 0 4px rgba(255,255,255,.8), 3px 3px 0 rgba(59,43,49,.22); }
  .group-label:hover { background: #fff; color: #3b2b31; }
  .plate { position: absolute; transform: translateX(-50%); white-space: nowrap; font-size: 8px; line-height: 1;
           padding: 4px 6px 3px; background: rgba(255,255,255,.88); color: #3b2b31; border: 0; pointer-events: none;
           opacity: 0; transition: opacity .15s; }
  [data-goat]:hover .plate, .plate.on { opacity: 1; }
  .shout { position: absolute; transform: translateX(-50%); white-space: nowrap; font-size: 12px; padding: 6px 7px 5px;
           background: #fff; color: #d4509f; border: 2px solid #3b2b31; box-shadow: 3px 3px 0 rgba(59,43,49,.3); pointer-events: none; }
  .hud { position: fixed; left: 12px; right: 12px; z-index: 5; pointer-events: none; }
  .hud > * { pointer-events: auto; }
  .hud.top { top: 12px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
  .panel, .title, .transport { background: rgba(255,255,255,.92); border: 2px solid #3b2b31; box-shadow: 4px 4px 0 rgba(59,43,49,.2); }
  .title { padding: 10px 12px 9px; }
  .title b { display: block; font-size: 13px; font-weight: 400; }
  .title span { font-size: 8px; color: #6d6168; line-height: 1.6; }
  .cta { font-size: 11px; padding: 12px 14px 11px; background: #d4509f; color: #fff; border: 2px solid #3b2b31;
         box-shadow: 4px 4px 0 rgba(59,43,49,.3); }
  .cta:hover { background: #bf3f8b; }
  .cta:active { transform: translate(2px,2px); box-shadow: 2px 2px 0 rgba(59,43,49,.3); }
  .transport { display: flex; align-items: center; gap: 8px; padding: 8px 10px; }
  .beats { display: flex; gap: 4px; }
  .beats i { width: 10px; height: 10px; background: #d9dde4; }
  .beats i.on { background: #3b2b31; }
  .bpm { font-size: 9px; color: #6d6168; margin-right: 4px; }
  button { font: inherit; cursor: pointer; }
  .transport button { font-size: 9px; padding: 7px 8px 6px; background: #fff; color: #3b2b31; border: 2px solid #3b2b31; }
  .transport button:hover { background: #eef2f7; }
  .transport button:disabled { opacity: .4; cursor: default; }
  .legend { bottom: 12px; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; }
  .chip { display: grid; grid-template-columns: 12px 1fr; column-gap: 7px; row-gap: 5px; align-items: center; text-align: left;
          min-width: 0; padding: 7px 8px 6px; background: rgba(255,255,255,.94); border: 2px solid #3b2b31;
          box-shadow: 3px 3px 0 rgba(59,43,49,.18); color: #3b2b31; }
  .chip i { grid-row: span 2; width: 12px; height: 12px; border: 2px solid var(--c); box-sizing: border-box; }
  .chip .name { font-size: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .chip .name em { font-style: normal; color: var(--c); }
  .chip .role { font-size: 7px; color: #857a80; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .chip.on { background: #fff; border-color: var(--c); }
  .chip.on i { background: var(--c); }
  .chip.wait i { animation: blink .25s steps(1) infinite; }
  @keyframes blink { 50% { background: var(--c); } }

  .quiz-back { position: fixed; inset: 0; z-index: 20; background: rgba(40,52,72,.35); display: flex; align-items: center; justify-content: center; padding: 16px; }
  .quiz { position: relative; width: min(640px, 100%); max-height: calc(100vh - 32px); overflow: auto; background: #fff;
          border: 3px solid #3b2b31; box-shadow: 8px 8px 0 rgba(59,43,49,.3); padding: 28px 28px 30px;
          font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  .quiz .close { position: absolute; top: 8px; right: 10px; border: 0; background: none; font-size: 26px; line-height: 1; color: #857a80; }
  .quiz .close:hover { color: #3b2b31; }
  .q-top { display: flex; justify-content: space-between; align-items: center; margin: 0 28px 22px 0; }
  .dots { display: flex; align-items: center; gap: 6px; }
  .dots i { width: 10px; height: 10px; background: #dfe4ec; }
  .dots i.done { background: #d4509f; }
  .dots i.now { width: 26px; background: #d4509f; }
  .dots span, .kicker { font-family: "Press Start 2P", monospace; font-size: 9px; color: #857a80; margin-left: 6px; }
  .kicker { margin-left: 0; }
  .link { border: 0; background: none; color: #857a80; font-size: 14px; padding: 0; }
  .link:hover { color: #3b2b31; }
  .quiz h2 { font-family: "Press Start 2P", monospace; font-weight: 400; font-size: 16px; line-height: 1.55; margin: 0 0 22px; }
  .opts { display: flex; flex-direction: column; gap: 10px; }
  .opt { text-align: left; padding: 14px 16px; font-size: 16px; line-height: 1.45; background: #f5f7fa; color: #3b2b31;
         border: 2px solid #dfe4ec; }
  .opt:hover { background: #fbeef6; border-color: #d4509f; }
  .opt:focus-visible, .btn:focus-visible, .cta:focus-visible, .chip:focus-visible { outline: 3px solid #4a7fd8; outline-offset: 2px; }
  .result-head { display: flex; gap: 18px; align-items: flex-start; margin-bottom: 8px; }
  .portrait { position: relative; flex-shrink: 0; background: #eef3f9; border: 2px solid #dfe4ec; overflow: hidden; }
  .portrait .plate { display: none; }
  .goat-name { font-family: "Press Start 2P", monospace; font-size: 20px; line-height: 1.3; color: #d4509f; margin: 4px 0 8px; }
  .arch { font-size: 15px; margin-bottom: 10px; color: #6d6168; }
  .full { font-size: 16px; line-height: 1.5; margin: 0; }
  .short { font-size: 15px; line-height: 1.5; color: #6d6168; margin: 12px 0 18px; }
  .shadow-card, .kin { background: #f5f7fa; border: 2px solid #dfe4ec; padding: 12px 14px; margin-bottom: 18px; font-size: 15px; line-height: 1.45; }
  .lbl { font-size: 12px; color: #857a80; margin-bottom: 4px; }
  .bars { display: flex; flex-direction: column; gap: 7px; margin-bottom: 22px; }
  .bar { display: flex; align-items: center; gap: 10px; font-size: 13px; }
  .bar .name { width: 130px; flex-shrink: 0; color: #6d6168; }
  .bar .track { flex: 1; height: 10px; background: #e6eaf0; }
  .bar .fill { height: 10px; background: #b5bdc8; }
  .bar .fill.win { background: #d4509f; }
  .bar .num { width: 16px; font-variant-numeric: tabular-nums; }
  .name-form label { display: block; font-family: "Press Start 2P", monospace; font-size: 11px; margin-bottom: 10px; }
  .name-row { display: flex; gap: 8px; }
  .name-row input { flex: 1; min-width: 0; font: inherit; font-size: 17px; padding: 10px 12px; border: 2px solid #3b2b31; }
  .name-row input:focus { outline: 3px solid #4a7fd8; outline-offset: 1px; }
  .btn { font-family: "Press Start 2P", monospace; font-size: 11px; padding: 12px 14px 11px; background: #d4509f; color: #fff;
         border: 2px solid #3b2b31; box-shadow: 3px 3px 0 rgba(59,43,49,.3); }
  .btn:disabled { opacity: .45; cursor: default; }
  .btn.big { width: 100%; font-size: 13px; padding: 16px; }
  .name-hint { margin: 6px 0 14px; font-size: 12px; color: #857a80; }
  .preview-name { margin-top: 10px; font-size: 14px; color: #6d6168; }
  .mates { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 18px; }
  .mate { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 10px 6px; border: 2px solid #dfe4ec; }
  .mate.me { border-color: #d4509f; background: #fbeef6; }
  .mate-name { font-size: 14px; font-weight: 600; margin-top: 8px; }
  .mate-arch { font-size: 12px; color: #857a80; margin-top: 2px; }
  .kin-list { display: flex; flex-wrap: wrap; gap: 6px; }
  .kin-list span { font-size: 13px; padding: 3px 7px; background: #fff; border: 1px solid #dfe4ec; }
  .kin-list span.same { border-color: #d4509f; }
  .empty { color: #857a80; font-size: 14px; }
  @media (max-width: 900px) {
    .legend { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .title span { display: none; }
  }
  @media (max-width: 560px) {
    .legend { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .transport .bpm, .transport .beats { display: none; }
    .quiz { padding: 22px 18px; }
    .quiz h2 { font-size: 13px; }
    .result-head { flex-direction: column; }
    .mates { grid-template-columns: 1fr; }
  }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
`;

const PAGES = [
  {
    entry: "web/main.tsx",
    out: "out/goat.html",
    title: "Козлик",
    head: `<style>
  html, body { margin: 0; height: 100%; background: linear-gradient(#cdd2d8 50%, #b8bec3 50%); }
  #root { position: fixed; inset: 0; }
</style>`,
  },
  {
    entry: "web/pen/main.tsx",
    out: "out/goat-choir.html",
    title: "ah ti koza",
    head: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
<style>${PEN_CSS}</style>`,
  },
  {
    // same app with 40 test goats in every group
    entry: "web/pen/main.tsx",
    out: "out/goat-choir-demo.html",
    title: "ah ti koza — demo",
    head: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
<script>window.GOAT_DEMO = 40;</script>
<style>${PEN_CSS}</style>`,
  },
  {
    entry: "web/pen/roster.tsx",
    out: "out/roster.html",
    title: "Все козы",
    head: `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
<style>
  html, body { margin: 0; background: #eef1f6; font-family: "Press Start 2P", ui-monospace, monospace; color: #3b2b31; }
  html, body, #root { height: 100%; overflow: hidden; }
  .roster { height: 100%; display: flex; align-items: center; justify-content: center; box-sizing: border-box; }
  .grid { display: grid; grid-template-columns: repeat(6, 230px); grid-auto-rows: 260px; gap: 20px; transform-origin: center center; flex-shrink: 0; }
  .slot { position: relative; width: 230px; height: 260px; cursor: pointer; user-select: none; }
  .slot:hover { filter: brightness(1.06); }
  .slot.on { filter: drop-shadow(0 3px 5px rgba(60,64,74,.35)); }
  .plate { display: none; }
  .label { position: absolute; left: 0; right: 0; bottom: 0; text-align: center; font-size: 10px; color: #6d6168; }
</style>`,
  },
];

mkdirSync("out", { recursive: true });

for (const page of PAGES) {
  const result = await build({
    entryPoints: [page.entry],
    bundle: true,
    minify: true,
    write: false,
    format: "iife",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' },
  });
  const js = result.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
  const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${page.title}</title>
${page.head}
</head>
<body>
<div id="root"></div>
<script>${js}</script>
</body>
</html>
`;
  writeFileSync(page.out, html);
  console.log(`${page.out} ${(html.length / 1024).toFixed(0)} kB`);
}
