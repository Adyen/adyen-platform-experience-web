#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseSupportedReleaseVersion, STABLE_V1_NPM_TAG, V1_PRERELEASE_NPM_TAGS } from '../release/version.mjs';

const PACKAGE_TARBALL_PREFIX = 'adyen-adyen-platform-experience-web';

const validateV1Release = ({ packageVersion, npmTag, parsedVersion }) => {
    if (parsedVersion.major !== 1) {
        throw new Error('V1 publishing requires a supported stable or prerelease V1 version.');
    }

    if (parsedVersion.isPrerelease) {
        const expectedTag = V1_PRERELEASE_NPM_TAGS[parsedVersion.prereleaseTag];
        if (npmTag !== expectedTag) {
            throw new Error(`V1 prerelease ${packageVersion} must publish to ${expectedTag}.`);
        }
    } else if (npmTag !== STABLE_V1_NPM_TAG) {
        throw new Error(`Stable V1 releases must publish to ${STABLE_V1_NPM_TAG}.`);
    }
};

const validateMainlineRelease = ({ packageVersion, npmTag, parsedVersion }) => {
    if (parsedVersion.major < 2) {
        throw new Error('Mainline publishing requires major version 2 or higher.');
    }

    if (parsedVersion.isPrerelease && npmTag !== parsedVersion.prereleaseTag) {
        throw new Error(`Prerelease ${packageVersion} must publish to its validated prerelease tag.`);
    }

    if (!parsedVersion.isPrerelease && npmTag !== 'latest') {
        throw new Error('Stable mainline releases must publish to latest.');
    }
};

const validateRelease = ({ packageVersion, npmTag, parsedVersion, releaseLine }) => {
    if (releaseLine === 'v1') {
        validateV1Release({ packageVersion, npmTag, parsedVersion });
        return;
    }

    if (releaseLine === 'mainline') {
        validateMainlineRelease({ packageVersion, npmTag, parsedVersion });
        return;
    }

    throw new Error('Release line must be mainline or v1.');
};

export const determineNpmRelease = ({ packageVersion, releaseVersion, npmTag, releaseLine, runnerTemp }) => {
    if (packageVersion !== releaseVersion) {
        throw new Error(`Checked out version ${packageVersion} does not match release version ${releaseVersion}.`);
    }

    const parsedVersion = parseSupportedReleaseVersion(packageVersion);
    validateRelease({ packageVersion, npmTag, parsedVersion, releaseLine });

    return {
        packageVersion,
        packageTarball: join(runnerTemp, 'artifact', `${PACKAGE_TARBALL_PREFIX}-${packageVersion}.tgz`),
        requiresStableV1Tag: releaseLine === 'mainline' && parsedVersion.major === 2 && !parsedVersion.isPrerelease,
    };
};

export const validateStableV1Tag = version => {
    try {
        const parsedVersion = parseSupportedReleaseVersion(version);
        if (parsedVersion.major === 1 && !parsedVersion.isPrerelease) {
            return version;
        }
    } catch {
        // Preserve the release-policy error below.
    }

    throw new Error(`${STABLE_V1_NPM_TAG} must point to a stable V1 version before V2 can publish.`);
};

const getArguments = argumentsList => {
    const argumentsMap = new Map();
    for (let index = 0; index < argumentsList.length; index += 2) {
        const name = argumentsList[index];
        const value = argumentsList[index + 1];
        if (!name?.startsWith('--') || value === undefined) {
            throw new Error(`Invalid argument list near "${name ?? ''}"`);
        }
        argumentsMap.set(name.slice(2), value);
    }
    return argumentsMap;
};

const requireArgument = (argumentsMap, name) => {
    const value = argumentsMap.get(name);
    if (!value) {
        throw new Error(`Missing required argument --${name}`);
    }
    return value;
};

const run = () => {
    const [command, ...argumentsList] = process.argv.slice(2);
    const argumentsMap = getArguments(argumentsList);

    if (command === 'determine') {
        const packageJsonPath = resolve(requireArgument(argumentsMap, 'package-json'));
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        const release = determineNpmRelease({
            packageVersion: packageJson.version,
            releaseVersion: requireArgument(argumentsMap, 'release-version'),
            npmTag: requireArgument(argumentsMap, 'npm-tag'),
            releaseLine: requireArgument(argumentsMap, 'release-line'),
            runnerTemp: requireArgument(argumentsMap, 'runner-temp'),
        });

        process.stdout.write(
            [
                `PACKAGE_VERSION=${release.packageVersion}`,
                `PACKAGE_TARBALL=${release.packageTarball}`,
                `REQUIRES_STABLE_V1_TAG=${release.requiresStableV1Tag}`,
                '',
            ].join('\n')
        );
        return;
    }

    if (command === 'validate-stable-v1') {
        validateStableV1Tag(requireArgument(argumentsMap, 'version'));
        return;
    }

    throw new Error(`Unknown command "${command ?? ''}"`);
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
    try {
        run();
    } catch (error) {
        console.error(`::error::${error instanceof Error ? error.message : String(error)}`);
        process.exitCode = 1;
    }
}
