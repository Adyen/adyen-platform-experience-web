import { NPM_PACKAGE_NAME, NPM_REGISTRY_URL, PRERELEASE_CHANNELS } from './constants';
import { compareVersions, parseVersion, type ParsedVersion } from './semver';
import type { VersionNotice } from './types';

interface RegistryManifest {
    version?: unknown;
    deprecated?: unknown;
}

type PrereleaseChannel = (typeof PRERELEASE_CHANNELS)[number];

const isPrereleaseChannel = (identifier: unknown): identifier is PrereleaseChannel => PRERELEASE_CHANNELS.includes(identifier as PrereleaseChannel);

/** Resolves the manifest of a version or dist-tag, or `undefined` when the registry does not know it. */
const fetchManifest = async (fetchFn: typeof fetch, specifier: string): Promise<RegistryManifest | undefined> => {
    // No credentials or SDK headers: the registry is a third party and must not see anything session related.
    const response = await fetchFn(`${NPM_REGISTRY_URL}/${NPM_PACKAGE_NAME}/${specifier}`, { credentials: 'omit' });
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error(`Registry responded with ${response.status} for ${specifier}`);
    return response.json();
};

const isDeprecated = async (fetchFn: typeof fetch, version: string) => {
    const manifest = await fetchManifest(fetchFn, version);
    return typeof manifest?.deprecated === 'string' && manifest.deprecated !== '';
};

/**
 * The newer prerelease on the channel of `current`, if any. Maintenance majors publish to `v<major>-<channel>`
 * and the mainline major to `<channel>`, so the major-specific tag wins and only a missing one falls back.
 */
const getNewerPrerelease = async (fetchFn: typeof fetch, current: ParsedVersion) => {
    const channel = current.prerelease[0];
    if (!isPrereleaseChannel(channel)) return;

    const manifest = (await fetchManifest(fetchFn, `v${current.major}-${channel}`)) ?? (await fetchManifest(fetchFn, channel));
    const latestVersion = typeof manifest?.version === 'string' ? manifest.version : undefined;
    const latest = latestVersion === undefined ? null : parseVersion(latestVersion);

    return latest && latest.major === current.major && compareVersions(latest, current) > 0 ? latestVersion : undefined;
};

/**
 * Checks the npm registry for whether `version` is deprecated or, for prereleases, superseded on its channel.
 * Never rejects: when the registry cannot answer, there is simply no notice.
 */
export const getVersionNotice = async (version: string, fetchFn: typeof fetch = fetch): Promise<VersionNotice | null> => {
    const current = parseVersion(version);
    if (!current) return null;

    const [deprecated, latestVersion] = await Promise.all([
        isDeprecated(fetchFn, version).catch(() => false),
        getNewerPrerelease(fetchFn, current).catch(() => undefined),
    ]);

    if (deprecated) return { kind: 'deprecated', currentVersion: version };
    if (latestVersion) return { kind: 'outdated', currentVersion: version, latestVersion };
    return null;
};
