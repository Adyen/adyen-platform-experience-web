/**
 * @vitest-environment node
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(scriptDirectory, '..', '..');
const script = readFileSync(join(scriptDirectory, 'package-assets.sh'), 'utf8');

// The SDK fetches config/<domain>/<name>.json from the CDN, so every domain config the SDK loads must be packaged there.
const domainsWithConfig = readdirSync(join(projectRoot, 'packages/domains')).filter(domain =>
    existsSync(join(projectRoot, 'packages/domains', domain, 'domain/src/config'))
);

describe('package-assets.sh', () => {
    test('should find domains with config', () => {
        expect(domainsWithConfig).toEqual(expect.arrayContaining(['capital', 'cashOut', 'disputes', 'payByLink']));
    });

    test.each(domainsWithConfig)('should package the config of %s for the CDN', domain => {
        const configDirectory = script.match(new RegExp(`^(\\w+)="\\./packages/domains/${domain}/domain/src/config"$`, 'm'))?.[1];

        expect(configDirectory).toBeDefined();
        expect(script).toContain(`mkdir -p "$STAGING_DIR/config/${domain}"`);
        expect(script).toContain(`cp "$${configDirectory}"/*.json "$STAGING_DIR/config/${domain}/"`);
    });
});
