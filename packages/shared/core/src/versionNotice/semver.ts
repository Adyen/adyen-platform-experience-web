export interface ParsedVersion {
    major: number;
    minor: number;
    patch: number;
    prerelease: (string | number)[];
}

const VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z.-]+)?$/;
const NUMERIC_IDENTIFIER_PATTERN = /^(0|[1-9]\d*)$/;

export const parseVersion = (version: string): ParsedVersion | null => {
    const match = VERSION_PATTERN.exec(version);
    if (!match) return null;

    const [, major, minor, patch, prerelease] = match;

    return {
        major: Number(major),
        minor: Number(minor),
        patch: Number(patch),
        prerelease: prerelease ? prerelease.split('.').map(id => (NUMERIC_IDENTIFIER_PATTERN.test(id) ? Number(id) : id)) : [],
    };
};

const compareIdentifiers = (a: string | number, b: string | number): number => {
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    // Numeric identifiers always have lower precedence than alphanumeric ones.
    if (typeof a === 'number') return -1;
    if (typeof b === 'number') return 1;
    return a < b ? -1 : a > b ? 1 : 0;
};

/**
 * Orders two versions by semver precedence: negative when `a` is lower, positive when higher, zero when equal.
 */
export const compareVersions = (a: ParsedVersion, b: ParsedVersion): number => {
    const coreDifference = a.major - b.major || a.minor - b.minor || a.patch - b.patch;
    if (coreDifference) return coreDifference;

    // A release has higher precedence than any of its prereleases.
    if (!a.prerelease.length || !b.prerelease.length) return b.prerelease.length - a.prerelease.length;

    for (let index = 0; index < Math.max(a.prerelease.length, b.prerelease.length); index++) {
        const left = a.prerelease[index];
        const right = b.prerelease[index];
        if (left === undefined) return -1;
        if (right === undefined) return 1;

        const difference = compareIdentifiers(left, right);
        if (difference) return difference;
    }

    return 0;
};
