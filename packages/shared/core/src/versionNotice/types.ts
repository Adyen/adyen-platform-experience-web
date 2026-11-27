export type VersionNotice = { kind: 'deprecated'; currentVersion: string } | { kind: 'outdated'; currentVersion: string; latestVersion: string };
