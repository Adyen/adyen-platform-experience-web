---
name: code-simplifier
description: This skill should be used when the user asks to "simplify this code", "clean up these changes", "refine this code", "make this more readable", or requests a simplification pass. Manual-only -- simplifies recently modified code for clarity, consistency, and maintainability without changing behavior.
user-invocable: true
disable-model-invocation: true
---

# Code Simplifier

## Goal

Refine recently changed code so it is easier to read, easier to maintain, and more consistent with this repository's conventions, while preserving exact behavior.

## Invocation

This skill is manual-only.

- Not to be run automatically after every coding task
- Not to be run as a default post-edit step
- Invoke only when the user explicitly asks for simplification, cleanup, refinement, or asks for this skill by name

## When to Use

- After implementing a feature, if the user asks for cleanup
- After fixing a bug, if the user asks for cleanup
- After a refactor or optimization, if the user asks for cleanup
- Only on files touched in the current task, unless explicitly asked to broaden the scope

## Inputs

- The current diff or recently modified files
- `AGENTS.md`
- Any relevant files under `.agents/patterns/`
- Existing nearby code so the simplification matches local conventions

## Hard Requirements

1. Preserve functionality exactly. Do not change behavior, public API, data flow, accessibility behavior, or user-visible output unless the task explicitly requires it.
2. Follow this repository's rules from `AGENTS.md`.
3. Match the local style of the touched code. Do not rewrite files just to force a global personal preference.
4. Use Preact conventions only. Never introduce imports from `react`.
5. Keep user-facing text on the i18n path. Use `useCoreContext()` and `i18n.get(...)`; do not hardcode strings in JSX.
6. Reuse existing internal components instead of inventing new primitives.
7. Respect strict TypeScript. Avoid `any`, handle `T | undefined` correctly, and do not hand-write API shapes that already exist in generated types.
8. Never edit generated files under `src/types/api/resources/` manually.
9. In SCSS, use Bento design tokens instead of hardcoded pixel values.
10. For bug fixes, preserve the repository rule: reproduce the bug with a test first, then simplify only after the fix is proven.
11. Never add secrets, credentials, or unsafe logging.

## Simplification Guidelines

- Reduce unnecessary nesting and branching
- Remove duplication and dead code
- Prefer clear names over clever shortcuts
- Avoid nested ternaries; use `if`/`else` or `switch` when clearer
- Extract helpers only when that makes the code easier to understand
- Remove comments that only restate obvious code
- Keep useful abstractions that improve structure or reuse
- Prefer explicit, debuggable code over dense one-liners
- Keep changes small and targeted

## Project-Specific Guidance

- External components follow the `BaseElement → UIElement → Element → Container → Presentational` layering. Do not collapse those boundaries without a strong reason.
- Shared runtime concerns such as i18n, loading, and config should come from `useCoreContext()` rather than being passed around unnecessarily.
- When simplifying UI code, keep accessibility attributes and keyboard behavior intact.
- When simplifying forms, tables, or filters, preserve existing translation keys, analytics behavior, and state flow.
- Do not convert component style wholesale. If a file already uses `const Component = (...) =>`, keep that style unless there is a clear local reason to change it.

## Process

1. Inspect the changed files and identify the smallest safe simplification scope.
2. Read surrounding code and any relevant `.agents/patterns/*` guidance before editing.
3. Apply minimal refactors that improve clarity and consistency.
4. Re-check for project rules: Preact-only imports, i18n usage, strict typing, internal component reuse, and design-token styling.
5. Verify that tests still express the intended behavior, especially for bug fixes.
6. Summarize only the meaningful simplifications that affect understanding.

## Verification

Run the relevant validators before finishing:

- `pnpm run lint`
- `pnpm run types:check`
- Focused tests for the touched area when code changed
- `pnpm run test -- --run` when the impact is broader or the safest scope is unclear
- `pnpm run build` when exported, public, or build-sensitive files are touched

## Success Criteria

- Behavior is unchanged
- The touched code is easier to read and maintain
- The result matches repository conventions
- Required validation passes
