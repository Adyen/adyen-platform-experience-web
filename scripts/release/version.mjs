const SUPPORTED_RELEASE_VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(alpha|beta|rc|next)\.(0|[1-9]\d*))?$/;

export const STABLE_V1_NPM_TAG = 'v1-latest';
export const V1_PRERELEASE_NPM_TAGS = Object.freeze({
    alpha: 'v1-alpha',
    beta: 'v1-beta',
    rc: 'v1-rc',
    next: 'v1-next',
});

export const parseSupportedReleaseVersion = version => {
    const match = SUPPORTED_RELEASE_VERSION.exec(version);
    const numericIdentifiers = match ? [match[1], match[2], match[3], match[5]].filter(identifier => identifier !== undefined).map(Number) : [];
    if (!match || numericIdentifiers.some(identifier => !Number.isSafeInteger(identifier))) {
        throw new Error(`Expected a stable or supported prerelease version, received "${version}"`);
    }

    return {
        major: numericIdentifiers[0],
        minor: numericIdentifiers[1],
        patch: numericIdentifiers[2],
        isPrerelease: match[4] !== undefined,
        prereleaseTag: match[4] ?? null,
        prereleaseNumber: numericIdentifiers[3] ?? null,
    };
};
