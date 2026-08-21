#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseSupportedReleaseVersion, STABLE_V1_NPM_TAGS, V1_PRERELEASE_NPM_TAGS } from '../release/version.mjs';

const PACKAGE_NAME = '@adyen/adyen-platform-experience-web';

export const parseV1Version = version => {
    try {
        const parsedVersion = parseSupportedReleaseVersion(version);
        if (parsedVersion.major === 1) {
            return parsedVersion;
        }
    } catch {
        // Preserve the V1-specific validation error below.
    }

    throw new Error(`Expected a stable or supported prerelease V1 version, received "${version}"`);
};

export const parseStableV1Version = version => {
    const parsedVersion = parseV1Version(version);
    if (parsedVersion.isPrerelease) {
        throw new Error(`Expected a stable V1 version, received "${version}"`);
    }

    return {
        major: parsedVersion.major,
        minor: parsedVersion.minor,
        patch: parsedVersion.patch,
    };
};

export const validateV1Transition = (previousVersion, nextVersion) => {
    const previous = parseV1Version(previousVersion);
    const next = parseV1Version(nextVersion);
    let isValid = false;

    if (!previous.isPrerelease) {
        isValid =
            (next.major === previous.major && !next.isPrerelease && next.minor === previous.minor && next.patch === previous.patch + 1) ||
            (next.major === previous.major &&
                next.isPrerelease &&
                next.minor === previous.minor &&
                next.patch === previous.patch + 1 &&
                next.prereleaseNumber === 0);
    } else if (!next.isPrerelease) {
        isValid = next.major === previous.major && next.minor === previous.minor && next.patch === previous.patch;
    } else {
        isValid =
            next.major === previous.major &&
            next.minor === previous.minor &&
            next.patch === previous.patch &&
            next.prereleaseTag === previous.prereleaseTag &&
            next.prereleaseNumber === previous.prereleaseNumber + 1;
    }

    if (!isValid) {
        throw new Error(`Invalid V1 release transition from ${previousVersion} to ${nextVersion}`);
    }

    return nextVersion;
};

export const validateV1Config = config => {
    if (!config || typeof config !== 'object' || Array.isArray(config)) {
        throw new Error('V1 release configuration must be an object');
    }

    if (config.branch !== 'version/v1.x') {
        throw new Error(`V1 release branch must be "version/v1.x", received "${config.branch}"`);
    }

    if (!STABLE_V1_NPM_TAGS.includes(config.npmTag)) {
        throw new Error(`Stable V1 npm tag must be "latest" or "v1", received "${config.npmTag}"`);
    }

    for (const [prereleaseTag, npmTag] of Object.entries(V1_PRERELEASE_NPM_TAGS)) {
        if (config.prereleaseNpmTags?.[prereleaseTag] !== npmTag) {
            throw new Error(`V1 prerelease "${prereleaseTag}" must use npm tag "${npmTag}"`);
        }
    }

    const configuredPrereleaseTags = Object.keys(config.prereleaseNpmTags ?? {});
    if (
        configuredPrereleaseTags.length !== Object.keys(V1_PRERELEASE_NPM_TAGS).length ||
        configuredPrereleaseTags.some(prereleaseTag => !(prereleaseTag in V1_PRERELEASE_NPM_TAGS))
    ) {
        throw new Error('V1 prerelease npm mappings must contain exactly alpha, beta, rc, and next');
    }

    if (config.cdn?.test !== 'v1-cdn-test' || config.cdn?.live !== 'v1-cdn-live') {
        throw new Error('V1 CDN tags must be "v1-cdn-test" and "v1-cdn-live"');
    }

    if (config.cdn?.assetName !== 'platform-components-v1_cdn.tar.gz') {
        throw new Error('Unexpected V1 CDN asset name');
    }

    return config;
};

export const resolveReleaseChannel = (config, version) => {
    validateV1Config(config);
    const parsedVersion = parseV1Version(version);
    const prereleaseTag = parsedVersion.prereleaseTag;

    return {
        npmTag: prereleaseTag ? config.prereleaseNpmTags[prereleaseTag] : config.npmTag,
        cdnTag: parsedVersion.isPrerelease ? config.cdn.test : config.cdn.live,
        deployEnvironment: parsedVersion.isPrerelease ? 'test' : 'live',
        isPrerelease: parsedVersion.isPrerelease,
        prereleaseTag,
    };
};

export const verifyPackedPackage = ({ tarballPath, expectedVersion }) => {
    parseV1Version(expectedVersion);
    const packageJson = JSON.parse(execFileSync('/usr/bin/tar', ['-xOf', tarballPath, 'package/package.json'], { encoding: 'utf8' }));

    if (packageJson.name !== PACKAGE_NAME) {
        throw new Error(`Expected package name "${PACKAGE_NAME}", received "${packageJson.name}"`);
    }

    if (packageJson.version !== expectedVersion) {
        throw new Error(`Expected package version ${expectedVersion}, received ${packageJson.version}`);
    }
};

const parseChangesetEntry = line => {
    const match = /^(?:"([^"]+)"|'([^']+)'|([^:\s][^:]*?))\s*:\s*(?:"([^"]+)"|'([^']+)'|([^\s#]+))\s*(?:#.*)?$/.exec(line);
    if (!match) {
        throw new Error(`Invalid Changeset frontmatter entry: "${line}"`);
    }

    return {
        packageName: (match[1] ?? match[2] ?? match[3]).trim(),
        bumpType: match[4] ?? match[5] ?? match[6],
    };
};

export const validateChangeset = changeset => {
    if (typeof changeset !== 'string') {
        throw new Error('Changeset contents must be a string');
    }

    const normalizedChangeset = changeset.replace(/^\uFEFF/, '');
    const frontmatterMatch = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/.exec(normalizedChangeset);
    if (!frontmatterMatch) {
        throw new Error('Changeset must start with YAML frontmatter');
    }

    const entries = frontmatterMatch[1]
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .map(parseChangesetEntry);

    if (entries.length !== 1 || entries[0]?.packageName !== PACKAGE_NAME || entries[0].bumpType !== 'patch') {
        throw new Error(`Changeset frontmatter must contain exactly "${PACKAGE_NAME}": patch`);
    }

    return entries[0];
};

const readJson = filePath => JSON.parse(readFileSync(resolve(filePath), 'utf8'));

const getArguments = argumentsList => {
    const argumentsByName = new Map();

    for (let index = 0; index < argumentsList.length; index += 2) {
        const name = argumentsList[index];
        const value = argumentsList[index + 1];
        if (!name?.startsWith('--') || value === undefined) {
            throw new Error(`Invalid argument list: ${argumentsList.join(' ')}`);
        }
        argumentsByName.set(name.slice(2), value);
    }

    return argumentsByName;
};

const requireArgument = (argumentsByName, name) => {
    const value = argumentsByName.get(name);
    if (!value) {
        throw new Error(`Missing required argument --${name}`);
    }
    return value;
};

const run = () => {
    const [command, ...argumentList] = process.argv.slice(2);
    const argumentsByName = getArguments(argumentList);

    if (command === 'validate-transition') {
        process.stdout.write(`${validateV1Transition(requireArgument(argumentsByName, 'previous'), requireArgument(argumentsByName, 'current'))}\n`);
        return;
    }

    if (command === 'validate-version') {
        const version = requireArgument(argumentsByName, 'version');
        parseV1Version(version);
        process.stdout.write(`${version}\n`);
        return;
    }

    if (command === 'validate-config') {
        validateV1Config(readJson(requireArgument(argumentsByName, 'config')));
        return;
    }

    if (command === 'resolve-channel') {
        const channel = resolveReleaseChannel(readJson(requireArgument(argumentsByName, 'config')), requireArgument(argumentsByName, 'version'));
        process.stdout.write(`${JSON.stringify(channel)}\n`);
        return;
    }

    if (command === 'validate-changeset') {
        validateChangeset(readFileSync(resolve(requireArgument(argumentsByName, 'file')), 'utf8'));
        return;
    }

    if (command === 'verify-tarball') {
        verifyPackedPackage({
            tarballPath: requireArgument(argumentsByName, 'tarball'),
            expectedVersion: requireArgument(argumentsByName, 'version'),
        });
        return;
    }

    throw new Error(`Unknown command "${command ?? ''}"`);
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
    try {
        run();
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}
