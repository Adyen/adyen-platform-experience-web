# 2. First release: the CLI and the migration skill only

**Status:** Proposed
**Builds on:** [ADR 1](0001-ship-ai-skills-in-the-package.md)

## Context

The full catalog in ADR 1 is 15 skills, and each needs review by the owning domain team. That's more than v2.0.0 can carry.

We tested assistants on realistic v1 apps, with and without the skills:

- **The migration skill changes correctness.** With it, assistants also made the changes that cause no type error. Without it, they consistently missed them, and some restyled components through v2's internal classes.
- **Integration skills mostly save effort.** Assistants found most v2 integration knowledge in the shipped `.d.ts` files. The skills made them cheaper, but rarely more correct.
- **The migration is time-bound.** Every v1 integrator migrates around v2.0.0. Integration help can follow in a minor release.

## Decision

**v2.0.0 ships the CLI and one skill, `adyen-platform-experience-migrate-v2`,** with deltas for all 13 components. The CLI's commands and flags are already final, so adding integration skills later is a minor release.

The skill stands alone: each delta file names the v2 props type in the shipped `.d.ts` files instead of pointing to an integration skill.

**How integrators use it:** upgrade to v2, then ask the assistant to "run `npx @adyen/adyen-platform-experience-web skills show migrate-v2` and follow it to migrate this project to v2". Nothing is installed or committed, and every delta is available. Teams that want the skill committed run `skills add` instead.

### How the migration skill behaves

- **Guardrails come first.** Before editing any file, the assistant checks three things:
    - the git working tree is clean, apart from the upgrade itself: the version change in `package.json` (or in a pnpm catalog in `pnpm-workspace.yaml`), lockfiles, and the skill's own files. Those can't be committed before the skill runs, so they become part of the migration diff;
    - the installed version matches the skill's version;
    - every imported component has a delta file (only in copies installed with `skills add`, which keep the selected components).

    If any check fails, it changes nothing and names the command that fixes it. Placing this as a precondition at the top was much more reliable than placing it as a step in the list.

- **CSS overrides take one of four paths,** decided by what the override styled:
    1. **Move:** `--adyen-sdk-*` variables are public and stable. They move as they are, without asking, from `:root` to the mount element or `.adyen-pe-component`: they already applied to every component in v1.
    2. **Replace:** overrides an option now covers become that option. Examples are the card look, titles, row density, and hidden columns or tabs.
    3. **Propose a theme:** colours, dark mode and corner radius map to Core `customTheme` and `themeMode`. **Theme settings change every component, so the assistant proposes them with a warning and applies them only after the user confirms.**
    4. **Delete and report:** overrides with no v2 equivalent match nothing in v2. They're deleted and listed in the report with what they did.
- **Never style v2 internals** (`.b-*`, `[data-v-*]`). Those names change without notice.
- **The final report** lists:
    - removed options with no replacement;
    - each CSS override and what happened to it;
    - the theme proposal;
    - a reminder to review every page visually.

## Consequences

- One skill to write and review. Domain teams review only their component's delta file.
- Integrators building new v2 features get no skill yet. Their assistants rely on the `.d.ts` files and the docs.
- The component prompt in `skills add` only trims the migration skill for now. It stays so the interface doesn't change later.
- Before the release we check that assistants follow the skill as reliably through `skills show` as when it's installed. If they don't, the docs lead with `skills add` instead.

## Open questions

- A link to the public migration guide, once it's published.
