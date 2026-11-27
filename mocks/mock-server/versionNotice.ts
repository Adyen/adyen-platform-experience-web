import { http, HttpResponse } from 'msw';
import { NPM_PACKAGE_NAME, NPM_REGISTRY_URL } from '../../packages/shared/core/src/versionNotice/constants';
import { parseVersion } from '../../packages/shared/core/src/versionNotice/semver';

const MANIFEST_PATH = `${NPM_REGISTRY_URL}/${NPM_PACKAGE_NAME}/:specifier`;
const DIST_TAG_PATTERN = /^(?:v\d+-)?([a-z]+)$/;

/** Answers a version request with its manifest, and a dist-tag request as if the tag was never published. */
const versionManifest = (specifier: string, manifest: { deprecated?: string } = {}) =>
    parseVersion(specifier) ? HttpResponse.json({ version: specifier, ...manifest }) : new HttpResponse(null, { status: 404 });

/** Bumps the patch of the running prerelease on the requested channel; stable builds never ask for a channel. */
const newerPrereleaseManifest = (specifier: string) => {
    const channel = DIST_TAG_PATTERN.exec(specifier)?.[1];
    const current = parseVersion(process.env.SDK_VERSION ?? '');
    if (!channel || !current) return versionManifest(specifier);
    return HttpResponse.json({ version: `${current.major}.${current.minor}.${current.patch + 1}-${channel}.0` });
};

export const versionNoticeMock = [http.get<{ specifier: string }>(MANIFEST_PATH, ({ params }) => versionManifest(params.specifier))];

export const VERSION_NOTICE_HANDLERS = {
    deprecated: {
        handlers: [
            http.get<{ specifier: string }>(MANIFEST_PATH, ({ params }) =>
                versionManifest(params.specifier, { deprecated: 'This version is deprecated.' })
            ),
        ],
    },
    newerPrerelease: {
        handlers: [http.get<{ specifier: string }>(MANIFEST_PATH, ({ params }) => newerPrereleaseManifest(params.specifier))],
    },
};
