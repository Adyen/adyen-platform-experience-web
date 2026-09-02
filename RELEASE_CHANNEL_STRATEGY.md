# Release channel strategy

## What we do

We keep the current major on `main`.

We keep a supported previous major on a maintenance branch.

For each transition, `N` is the previous supported major and `N+1` is the current major.

| Release line      | Source branch  | Stable npm tag | Prerelease npm tags                       |
| ----------------- | -------------- | -------------- | ----------------------------------------- |
| Previous major N  | `version/vN.x` | `vN-latest`    | `vN-alpha`, `vN-beta`, `vN-rc`, `vN-next` |
| Current major N+1 | `main`         | `latest`       | `alpha`, `beta`, `rc`, `next`             |

A maintenance release must not change `latest`.

Replace `N` with the actual major number. For example, use `version/v2.x` and `v2-latest`.

## Guardrails

- The package major must match its release line.
- Stable and prerelease versions must use their assigned npm tags.
- All release lines publish through the same trusted OIDC entry workflow.
- Release PRs must have the expected bot author, repository, branch, title, version, and changed files.
- The build source SHA, package version, tar file, and checksum must agree.
- A new stable major requires `vN-latest` to point to a stable release of the previous supported major.
- Publishing a new maintenance version with `--tag vN-latest` creates or advances that tag.
- Prerelease CDN content can go only to a test channel.
- CDN assets use major-specific tags and names.
- Contract tests verify the branch, major, npm-tag, and workflow-routing rules.

## Update for the next major

Before major `N+1` becomes stable:

1. Publish the final stable release of major N.
2. Create `version/vN.x` from that exact release tag.
3. Configure maintenance routing, validation, prerelease tags, and bootstrap files for major N.
4. Publish the first stable maintenance release with `--tag vN-latest`.
5. Verify that npm created `vN-latest` at that maintenance version.
6. Change the GA prerequisite so stable major N+1 validates `vN-latest`.
7. Create `vN+1-cdn-test` and `vN+1-cdn-live`.
8. Add major N+1 to the manual CDN workflow choices.
9. Add contract tests for the N maintenance and N+1 mainline matrix.
10. Rehearse both release lines before major N+1 GA.

If no maintenance release is planned before the next major GA, an authorized npm owner must backfill `vN-latest` or the release policy must explicitly waive this prerequisite.

After the transition:

- Stable major N maintenance releases publish to `vN-latest`.
- Major N prereleases publish to `vN-alpha`, `vN-beta`, `vN-rc`, or `vN-next`.
- Stable major N+1 releases publish to `latest`.
- Major N+1 prereleases publish to `alpha`, `beta`, `rc`, or `next`.

## Examples

| New mainline | Previous-major branch | Previous-major npm tag | New CDN tags                 |
| ------------ | --------------------- | ---------------------- | ---------------------------- |
| V3           | `version/v2.x`        | `v2-latest`            | `v3-cdn-test`, `v3-cdn-live` |
| V4           | `version/v3.x`        | `v3-latest`            | `v4-cdn-test`, `v4-cdn-live` |
| V5           | `version/v4.x`        | `v4-latest`            | `v5-cdn-test`, `v5-cdn-live` |

If more than one previous major remains supported, keep a separate maintenance route and npm tag for each one.

Do not use `v2`, `v3`, or similar values as npm dist-tags. npm interprets them as semantic-version ranges. Use `v<major>-latest`.
