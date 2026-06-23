# Voimareitti

**Treeni, ruoka ja tulostettava ohjelma samasta paikasta.**

A free, multilingual (fi / hu / en / sv) web app that generates a personalized strength-training
program, a diet guide, and a responsible supplement guide, and exports them as a printable PDF.
It works with whatever equipment you have - even just a chair. Voimareitti is **not** a medical
application and gives no medical advice.

Live at **https://voimareitti.fi**

A Cyborvent Oy project.

## Tech

SvelteKit 2 + Svelte 5 + TypeScript, fully prerendered static output via `@sveltejs/adapter-netlify`.
A rule-based deterministic engine (no runtime AI) produces the plans. No accounts; state stays
client-side, so only minimal data is handled.

## Develop

```
npm install
npm run dev
```

## Gate

Run the full gate before opening a pull request:

```
npm run check    # svelte-kit sync + svelte-check (0 errors / 0 warnings)
npm run test     # vitest
npm run build    # vite build
```

The same gate runs automatically on every pull request via GitHub Actions, and a pull request
cannot be merged into `main` until it passes.

## Workflow

Work happens on a branch and goes through a pull request. Merging a pull request into `main`
auto-deploys to production on Netlify. Direct pushes to `main` are blocked - everything ships
through a reviewed, gate-passing pull request.
