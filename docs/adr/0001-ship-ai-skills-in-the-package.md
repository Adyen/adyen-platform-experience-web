# 1. Ship AI assistant skills in the library package

**Status:** Proposed

## Context

v2 is a major release. Some Core options and component props were removed or renamed, and CSS classname overrides no longer work: v1 `.adyen-pe-*` selectors match nothing in v2. Several of these changes cause no type error, for example `common.*` translation keys or `--adyen-sdk-*` variables set on `:root`. A migration can look finished and still ship untranslated text or lost styling.

Many integrators build with AI coding assistants. Those assistants learned from v1 code and docs, so they tend to suggest v1 patterns. We have no channel to teach them the v2 API.

[Agent Skills](https://agentskills.io/specification) is an open format for this: a folder with a `SKILL.md` that assistants such as Claude Code, Cursor and Codex discover and load on demand. Community tools that install skills from npm packages exist ([skills-npm](https://github.com/antfu/skills-npm), [vercel-labs/skills#2323](https://github.com/vercel-labs/skills/issues/2323)), but they're still experimental and can't trim a skill to the components a platform uses.

We need skills that:

- match the installed library version;
- cover only the components a platform uses (the library has 13 components in 6 domains);
- cost production apps nothing.

## Decision

**Skills ship inside `@adyen/adyen-platform-experience-web`, with a small CLI in the same package.**

- **Location:** skills are assembled into `dist/skills/<name>/` at build time. That path is also the one community installers look for.
- **CLI:** integrators run `npx @adyen/adyen-platform-experience-web skills <add|list|sync|remove>`. The package is already installed, so nothing extra is downloaded, and the CLI and skills always match the library version. Docs always use the scoped name.
- **Install:** the CLI copies the skills into the assistant's skill directory (`.claude/skills/`, `.agents/skills/` or `.cursor/skills/`), at the git root by default. Copies work before `npm install`, on Windows, and in assistants that don't follow symlinks. They're meant to be committed, so the whole team gets them.
- **Non-interactive mode:** every prompt has a flag (`--components`, `--agent`, `--yes`, `--dir`), so an assistant can run the CLI itself.
- **State:** the library version and the selected components are written into each `SKILL.md`'s frontmatter `metadata`. There's no manifest file.
- **Safety:**
    - Skills contain only markdown: no scripts and no `allowed-tools`.
    - The CLI makes no network calls, sends no telemetry and has no runtime dependencies.
    - On startup, the CLI checks that the installed library version matches its own.
- **Naming:** every skill name starts with `adyen-platform-experience-`, because skill directories are shared with other libraries' skills.
- **Catalog (end state):**
    - `adyen-platform-experience-core`;
    - one integration skill per component;
    - `adyen-platform-experience-migrate-v2`, which holds the v1 → v2 change for each component and is removed once the migration is done.

### Alternatives considered

| Option                    | Why not                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Migration guide only      | Doesn't reach assistants; every platform audits its code by hand                                                    |
| Community installers only | Can't trim to a component selection; the tools are still experimental                                               |
| Separate CLI package      | A second package to discover, and its version can drift from the library                                            |
| Classname scanner         | Covers only CSS, and its mapping must track every CSS build                                                         |
| MCP server                | Each developer must configure each assistant, and it serves the latest guidance rather than the installed version's |

## Consequences

- The release gains a skills assembly step, the CLI build and a `skills:check` lint step. It checks frontmatter, coverage (every exported component has a v2 delta) and size.
- A PR that changes a component's public behaviour updates its skill. Until v3, a PR that adds a customization option checks whether it replaces a known v1 CSS override.
- A CLI fix needs a library release, and the tarball grows slightly (markdown plus one bundled file).
- Copied skills go stale if nobody runs `skills sync` after an upgrade. Each skill's version check turns that into a stop (migration) or a warning (integration).
- At v3, `migrate-v2` leaves the catalog and `migrate-v3` uses the same mechanism.
