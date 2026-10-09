# Adyen Platform Experience Web — V1 → V2 codemods

[jscodeshift](https://github.com/facebook/jscodeshift) codemods that automate the mechanical parts of migrating an integration of `@adyen/adyen-platform-experience-web` from V1 (1.14.x) to V2 (2.0.0 pre-releases), following [docs/v2/v1-to-v2-migration-guide.md](../docs/v2/v1-to-v2-migration-guide.md).

The codemods are deliberately conservative: everything they cannot migrate safely is left in place with a `// TODO(v2-migration): ...` comment explaining the manual step, and every change is reported per file (`REP` lines in the output).

All transforms run on `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`, and Vue Single-File Components (`.vue`). For `.vue` files, the `<script>` / `<script setup>` blocks are extracted with `@vue/compiler-sfc`, migrated, and spliced back at their original offsets; templates and styles stay byte-for-byte untouched.

## What is automated

| Transform | Migration-guide step | What it does |
| --- | --- | --- |
| `fix-imports` | 3 (Fix TypeScript imports) | Renames `XxxComponentProps` → `XxxProps` (import and references), `ExternalCapitalState` → `CapitalState`, `onErrorHandler` → `ErrorHandler`. Removes imports of names V2 no longer publishes when they are unused; keeps them with a TODO comment when they are still referenced. Handles ESM imports, `require()` and dynamic `import()` destructuring. |
| `core-init-options` | 2 (Update library initialization) | Removes the deprecated `availableTranslations` option from `AdyenPlatformExperience()` calls (incl. the `AdyenPlatformExperienceWeb.AdyenPlatformExperience(...)` UMD form). |
| `component-props` | 6 (Update component props) | `hideTitle: true` → `appearance: { titles: 'hidden' }` (merged into an existing `appearance`); removes `onError` (per-component), `showDetails`, `onFiltersChanged`, the Capital flow-control props, `onOfferSelect`/`externalCapitalState`; renames `onCreationDismiss` → `onDismiss` (Pay by Link Creation and the `paymentLinkCreation` sub-config); cleans up `paymentLinkSettings` and hoists its `storeIds` to the Overview top level. Works on `new Component({...})`, `instance.update({...})`, and same-file props objects. `.update()` calls on instances constructed in another file are flagged with a TODO when they set props that changed in V2. |
| `translations-keys` | 4 (Migrate custom translations) | Re-keys V1 translation overrides to the V2 keys that now own the string, generated from the SDK codebase (both catalogs, V1's deprecated-key swap chains, V2's Bento runtime override routing, and which domains render which Bento UI). Covers V1 `common.*` keys (`common.actions.copy.labels.done` → one entry per owning domain), renamed keys (`payByLink.common.fields.optional.label` → `payByLink.creation.fields.optional.label`), deprecated V1 spellings (`capital.businessFinancing` → `capital.common.title`), plural families (`__plural`, `__0`, …), and Bento-driven shared strings (`common.filters.label` → `<domain>.common.filters.label` per domain that renders data grids, `common.pagination.label` → the component-specific `<domain>.overview.pagination.label` keys). Keys with no V2 equivalent (dropped or reworded) are flagged with a TODO. |

Not automated (no safe mechanical mapping exists — see the migration guide):

- Styling: deleting CSS that targets `adyen-pe-*` class names, rescoping `--adyen-sdk-*` variable overrides to the mount element, and moving dark mode / brand colors to `themeMode` / `customTheme` / `appearance`.
- Translation keys whose string was reworded or whose UI was dropped between V1 and V2 (the codemod flags these with a TODO; audit them against `packages/sdk/translations/en-US.json`).
- Adopting the new optional callbacks (`onDismiss` on details components, `onShowDetails` on Pay by Link creation).

Translation-key notes:

- Most targets are typed catalog keys. Bento-rendered shared strings (filter bars, pagination, timelines, file uploaders, "apply"/"reset" buttons, …) resolve through `<domain>.<domainKey>` override namespaces that are not part of the typed V2 catalog yet; those targets are added with a TODO comment. They work at runtime, but TypeScript users may need a cast until the SDK publishes them.
- Domain fan-out is deliberately precise: each key fans out only to the domains that render the string (e.g. timeline strings only to `payByLink` and `transactions`, file-uploader strings only to `disputes` and `payByLink`). Unused entries are inert, so keeping extra domains is safe.

## Requirements

The CLI needs Node 18+ and [jscodeshift](https://github.com/facebook/jscodeshift) installed in the project it runs in (a dev dependency is enough). `@vue/compiler-sfc` is optional — without it, `.vue` files are skipped with a notice.

## Usage

The codemods ship with the SDK package as the `v2-migration` binary. Like ESLint and Stylelint, the CLI checks by default: it reports everything it would change and leaves your files untouched. Pass `--fix` to apply the changes.

From a project that installs the SDK (with `jscodeshift` — and, for `.vue` support, `@vue/compiler-sfc` — as dev dependencies):

```sh
npm install --save-dev jscodeshift @vue/compiler-sfc

npx v2-migration                     # check ./src
npx v2-migration --fix               # apply to ./src
npx v2-migration --fix app/lib       # apply to other paths
```

Inside this repository:

```sh
pnpm migrate:codemods                # = node codemods/run.js (check)
pnpm migrate:codemods -- --fix       # apply
```

Options:

- `--fix` — write the changes (the default is check-only)
- `--only=<transform-name>` — run a single transform instead of all of them
- everything else passes through to jscodeshift (`--dry`, `--print`, `--verbose=2`, `--extensions=`, `--ignore=`; see `jscodeshift --help`)

Defaults: paths default to `./src` when none are given; files are limited to `ts,tsx,js,jsx,mjs,cjs,vue` (override with `--extensions=`); `**/node_modules/**` is ignored (override with `--ignore=`); and TypeScript parsing is always enabled (each transform pins the `tsx` parser). If `@vue/compiler-sfc` is missing, `.vue` is dropped from the extensions with a notice instead of failing the run.

Every change and manual-action note is printed as a `REP <file> <message>` line as the run progresses. At the end, the CLI prints a summary — per-transform change counts and the number of remaining `TODO(v2-migration)` markers — plus the suggested next steps.

To run a single transform manually with the jscodeshift CLI:

```sh
npx jscodeshift -t <path-to>/dist/codemods/transforms/component-props.cjs src/ --verbose=2
```

## Packaging

The published package carries the CLI as plain files under `dist/codemods/` (copied there by the vite build), not as part of the bundled ES/CJS library outputs: jscodeshift loads transforms with `require()` from its own worker processes, and `run.js` resolves `jscodeshift` and `@vue/compiler-sfc` from the consuming project at run time, so the same code works in any package manager's install layout. The colocated test files are filtered out of the copy, so they never ship.

## After running

1. Search for `TODO(v2-migration)` and resolve each note (moved error handling, required `onDismiss` callbacks, dynamic values, stale translation keys, removed imports, unattributed `.update()` calls).
2. Run your formatter (`prettier --write` / `eslint --fix`) — the codemods preserve your file's quote style but may leave extra blank lines in heavily edited object literals and do not manage trailing commas.
3. Run your type check — every remaining V1-only import or prop surfaces there, which is the intended signal to finish the migration manually.
4. Work through the [migration guide's test checklist](../docs/v2/v1-to-v2-migration-guide.md#8-test-checklist).

## Limitations

- Inside `.vue` files only the `<script>` / `<script setup>` blocks are migrated; `<template>` and `<style>` blocks are untouched (styles have no safe mechanical migration regardless of file type — see the migration guide's styling step).
- `instance.update({...})` migration requires the instance to be constructed (`new Component(...)`) in the same file. Unattributed `.update()` calls (built in another file, indirect references) that set props which changed in V2 get a TODO flag; ones that only set valid V2 props are left alone.
- Props built dynamically (spread from variables defined in other files, factory functions) are not touched; the `new Component(...)`/`update()` call sites that receive them are still migrated when they are object literals.

## Development

The test suite runs with the repository's vitest suite (`pnpm test`), colocated with the modules under test (`run.test.js`, `transforms/*.test.js`, `lib/sfc.test.js`, with `helpers.js` as the shared harness). To run only the codemods:

```sh
pnpm exec vitest run codemods

node run.js <fixture-dir>    # check by default; add --fix to write
```

- `lib/component-data.cjs` — the V1/V2 knowledge base (components, per-component prop rules, import rename/remove maps, `V1_ONLY_PROP_KEYS` for update-call flagging). Update this when the V2 surface changes.
- `lib/sfc.cjs` — the Vue SFC wrapper (`withSfcSupport`): extracts script blocks with `@vue/compiler-sfc`, runs the wrapped transform on each block's source, splices changed blocks back at their original offsets.
- `lib/translation-keys.json` — generated translation-key map (the V2 catalog, every known V1 key including deprecated spellings, and per-domain targets). Regenerate from within the SDK repository checkout:

  ```sh
  node codemods/scripts/generate-translation-keys.mjs
  ```

  It derives the mapping from repository state — the V1 catalog and V1's deprecated-key swap config from the `version/v1.x` branch, and the V2 catalog, the Bento runtime override routing (`packages/shared/core/src/vue/bentoTranslations.ts`), and per-domain component usage from the working tree. Mapping precedence: Bento route (the runtime override channel, component-specific rows winning) → structural suffix match in the V2 catalog → exact-value match with shared structure → same-path leaf rename. Re-run it when the catalogs, the Bento routing, or the domain components change.
- Transforms are CommonJS (`.cjs`) because the jscodeshift worker loads them with `require()`, and they pin `module.exports.parser = 'tsx'` so TypeScript sources parse without CLI flags.
