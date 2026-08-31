#!/usr/bin/env tsx
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { format, resolveConfig } from 'prettier';
import { V2_DOMAIN_TRANSLATION_LOADERS, V2_TRANSLATION_REGISTRY } from '../../packages/sdk/src/translations/registry';
import type { TranslationContractRegistry, TranslationSource } from '../../packages/shared/core/src/translation-contract/types';
import { buildTranslationContractArtifacts, getInstalledBentoTranslationKeys, readJson } from './lib';

const ROOT = resolve(import.meta.dirname!, '../..');
const RUNTIME_PATH = resolve(ROOT, 'packages/shared/core/src/translation-contract/generated.ts');
const CATALOG_PATH = resolve(ROOT, 'docs/generated/v2-translation-catalog.md');
const CHECK_MODE = process.argv.includes('--check');
const domainSources = Object.fromEntries(
    await Promise.all(
        Object.entries(V2_DOMAIN_TRANSLATION_LOADERS).map(async ([domain, loaders]) => [domain, await loaders['en-US']()] as const)
    )
);

const artifacts = buildTranslationContractArtifacts({
    bentoKeys: getInstalledBentoTranslationKeys(ROOT),
    domainSources,
    publicTemplates: readJson<TranslationSource>(resolve(ROOT, 'packages/shared/assets/src/translations/en-US.json')),
    registry: V2_TRANSLATION_REGISTRY as TranslationContractRegistry,
});
const runtimeTypescript = await format(artifacts.runtimeTypescript, {
    ...(await resolveConfig(RUNTIME_PATH)),
    filepath: RUNTIME_PATH,
});

const outputs = [
    [RUNTIME_PATH, runtimeTypescript],
    [CATALOG_PATH, artifacts.catalogMarkdown],
] as const;

if (CHECK_MODE) {
    const stale = outputs.filter(([path, content]) => !existsSync(path) || readFileSync(path, 'utf8') !== content);
    if (stale.length) {
        console.error(`V2 translation artifacts are stale:\n${stale.map(([path]) => `- ${path}`).join('\n')}`);
        process.exit(1);
    }
    console.log('V2 translation contract is valid and generated artifacts are current.');
} else {
    for (const [path, content] of outputs) {
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, content);
        console.log(`Generated ${path}`);
    }
}
