import { access, readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import Localization from '../Localization';
import { SDK_BENTO_DEFAULT_TRANSLATIONS, SDK_BENTO_TRANSLATION_SOURCES } from '../../../../sdk/src/translations';
import {
    applyBentoDomainOverrides,
    BENTO_COMPONENT_DOMAIN_OVERRIDES,
    BENTO_DOMAIN_OVERRIDES,
    BENTO_PLURAL_TRANSLATION_KEYS,
    getBentoLocaleMessages,
} from './bentoTranslations';
import { compileDomainTemplateForBento, compileDomainTranslationFamilyForBento, type BentoTranslationFamily } from './bentoTranslationTemplate';
import type { I18n } from './Context/types';

type I18nConfig = {
    locales: string[];
    translationSourcePaths: string[];
};

const I18N_CONFIG_PATH = '.i18nrc';
const ENGLISH_LOCALE = 'en-US';
const DOMAIN_CATALOG_ROOT = 'packages/domains';
const pluralTranslationKeys = new Set<string>(BENTO_PLURAL_TRANSLATION_KEYS);

const getI18nConfig = async (): Promise<I18nConfig> => JSON.parse(await readFile(resolve(process.cwd(), I18N_CONFIG_PATH), 'utf8')) as I18nConfig;

const getConfiguredLocales = (config: I18nConfig): string[] => [ENGLISH_LOCALE, ...config.locales];

const getBentoCatalogDirectory = (config: I18nConfig): string => {
    const bentoSourcePath = config.translationSourcePaths.find(sourcePath => sourcePath.endsWith(`/bento/${ENGLISH_LOCALE}.json`));
    if (!bentoSourcePath) throw new Error('The SDK Bento English catalog must be registered in .i18nrc.');
    return bentoSourcePath.slice(0, -`${ENGLISH_LOCALE}.json`.length);
};

const getDomainTranslationSourcePath = (domain: string): string => `${DOMAIN_CATALOG_ROOT}/${domain}/vue/translations/${ENGLISH_LOCALE}.json`;

const hasTranslationSource = async (sourcePath: string): Promise<boolean> => {
    try {
        await access(resolve(process.cwd(), sourcePath));
        return true;
    } catch {
        return false;
    }
};

const getDomainTranslationSourcePaths = async (): Promise<string[]> => {
    const domainEntries = await readdir(resolve(process.cwd(), DOMAIN_CATALOG_ROOT), { withFileTypes: true });
    const sourcePaths = domainEntries.filter(entry => entry.isDirectory()).map(entry => getDomainTranslationSourcePath(entry.name));
    const sourcePathAvailability = await Promise.all(
        sourcePaths.map(async sourcePath => ({ sourcePath, exists: await hasTranslationSource(sourcePath) }))
    );

    return sourcePathAvailability
        .filter(({ exists }) => exists)
        .map(({ sourcePath }) => sourcePath)
        .sort();
};

const getLocaleCatalogPath = (englishCatalogPath: string, locale: string): string => englishCatalogPath.replace(ENGLISH_LOCALE, locale);

const getTranslationCatalog = async (catalogPath: string): Promise<Record<string, string>> =>
    JSON.parse(await readFile(resolve(process.cwd(), catalogPath), 'utf8')) as Record<string, string>;

const getTranslationFamily = (translations: Record<string, string>, key: string): BentoTranslationFamily => ({
    base: translations[key] ?? null,
    zero: translations[`${key}__0`] ?? null,
    one: translations[`${key}__1`] ?? null,
    plural: translations[`${key}__plural`] ?? null,
    unsupportedExactCounts: Object.keys(translations)
        .filter(translationKey => translationKey.startsWith(`${key}__`))
        .map(translationKey => Number(translationKey.slice(key.length + 2)))
        .filter(count => Number.isInteger(count) && count > 1),
});

const createI18n = (templates: Record<string, string> = {}): I18n =>
    ({
        getTemplate: (key: string) => templates[key] ?? null,
        getTranslationFamily: (key: string) => getTranslationFamily(templates, key),
    }) as I18n;

type CatalogCompatibilityCase = {
    bentoKey: string;
    bentoTemplate: string;
    domain: string;
    domainKey: string;
    family: BentoTranslationFamily;
    locale: string;
};

const overviewComponentDomains = {
    disputes: 'disputes',
    paymentLinksOverview: 'payByLink',
    payouts: 'payouts',
    reports: 'reports',
    transactions: 'transactions',
} as const;

type ComponentRouteCase = CatalogCompatibilityCase & {
    componentName: keyof typeof overviewComponentDomains;
};

const getOverviewRouteTemplates = (domain: string, paginationKey = 'overview.pagination.label'): Record<string, string> => ({
    [`${domain}.${paginationKey}`]: 'Domain pagination',
    [`${domain}.overview.common.filters.types.date.rangeSelect.options.custom`]: 'Custom',
    [`${domain}.overview.common.filters.types.date.rangeSelect.options.last7Days`]: 'Last 7 days',
    [`${domain}.overview.common.filters.types.date.rangeSelect.options.lastMonth`]: 'Last month',
});

const getCatalogCompatibilityCases = async (): Promise<CatalogCompatibilityCase[]> => {
    const i18nConfig = await getI18nConfig();
    const bentoCatalogDirectory = getBentoCatalogDirectory(i18nConfig);
    const domainTranslationSourcePaths = await getDomainTranslationSourcePaths();
    const cases: CatalogCompatibilityCase[] = [];

    for (const locale of getConfiguredLocales(i18nConfig)) {
        const bentoTranslations = await getTranslationCatalog(`${bentoCatalogDirectory}${locale}.json`);

        for (const domainSourcePath of domainTranslationSourcePaths) {
            const domain = domainSourcePath.split('/')[2]!;
            const domainTranslations = await getTranslationCatalog(getLocaleCatalogPath(domainSourcePath, locale));

            for (const [bentoKey, domainKey] of BENTO_DOMAIN_OVERRIDES) {
                const family = getTranslationFamily(domainTranslations, `${domain}.${domainKey}`);
                const bentoTemplate = bentoTranslations[bentoKey] ?? SDK_BENTO_DEFAULT_TRANSLATIONS[bentoKey];

                if (family.base && bentoTemplate) {
                    cases.push({ bentoKey, bentoTemplate, domain, domainKey, family, locale });
                }
            }
        }
    }

    return cases;
};

const getComponentRouteCases = async (): Promise<ComponentRouteCase[]> => {
    const i18nConfig = await getI18nConfig();
    const bentoCatalogDirectory = getBentoCatalogDirectory(i18nConfig);
    const cases: ComponentRouteCase[] = [];

    for (const locale of getConfiguredLocales(i18nConfig)) {
        const bentoTranslations = await getTranslationCatalog(`${bentoCatalogDirectory}${locale}.json`);

        for (const override of BENTO_COMPONENT_DOMAIN_OVERRIDES) {
            const bentoTemplate = bentoTranslations[override.bentoKey] ?? SDK_BENTO_DEFAULT_TRANSLATIONS[override.bentoKey];

            for (const componentName of override.componentNames) {
                const domain = overviewComponentDomains[componentName as keyof typeof overviewComponentDomains];
                if (!domain || !bentoTemplate) continue;

                const translations = await getTranslationCatalog(getLocaleCatalogPath(getDomainTranslationSourcePath(domain), locale));
                cases.push({
                    bentoKey: override.bentoKey,
                    bentoTemplate,
                    componentName: componentName as keyof typeof overviewComponentDomains,
                    domain,
                    domainKey: override.domainKey,
                    family: getTranslationFamily(translations, `${domain}.${override.domainKey}`),
                    locale,
                });
            }
        }
    }

    return cases;
};

describe('applyBentoDomainOverrides', () => {
    test('audits every SDK Bento choice template against plural-capable targets', async () => {
        const choiceKeys = new Set<string>();
        const i18nConfig = await getI18nConfig();
        const bentoCatalogDirectory = getBentoCatalogDirectory(i18nConfig);

        for (const locale of getConfiguredLocales(i18nConfig)) {
            const translations = await getTranslationCatalog(`${bentoCatalogDirectory}${locale}.json`);

            for (const [key, translation] of Object.entries(translations)) {
                if (translation.includes('|')) choiceKeys.add(key);
            }
        }

        expect([...choiceKeys].sort()).toEqual([...BENTO_PLURAL_TRANSLATION_KEYS].sort());
    });

    test('uses a compiled domain translation when an override key exists', () => {
        const overrides: Record<string, string> = {};
        const i18n = createI18n({ 'transactions.common.errors.noResults': 'No results for %{filter}' });
        applyBentoDomainOverrides(overrides, i18n, { 'bento.data.grid.noResults': 'No results for {filter}' }, 'transactions');
        expect(overrides['bento.data.grid.noResults']).toBe('No results for {filter}');
    });

    test('uses the component-specific domain key for Overview elements', () => {
        const overrides: Record<string, string> = {};
        const bentoKey = 'bento.date.range.picker.calendar.lastMonth';
        const i18n = createI18n({
            ...getOverviewRouteTemplates('transactions'),
            'transactions.common.filters.types.date.rangeSelect.options.lastMonth': 'Common last month',
            'transactions.overview.common.filters.types.date.rangeSelect.options.lastMonth': 'Overview last month',
        });

        applyBentoDomainOverrides(overrides, i18n, { [bentoKey]: 'Last month' }, 'transactions', 'transactions');

        expect(overrides[bentoKey]).toBe('Overview last month');
    });

    test('uses each Overview component’s pagination key', () => {
        const overrides: Record<string, string> = {};
        const bentoKey = 'bento.data.grid.pagination';
        const i18n = createI18n({
            ...getOverviewRouteTemplates('payByLink'),
            'payByLink.overview.pagination.label': 'Payment links pagination',
        });

        applyBentoDomainOverrides(overrides, i18n, { [bentoKey]: 'Pagination' }, 'payByLink', 'paymentLinksOverview');

        expect(overrides[bentoKey]).toBe('Payment links pagination');
    });

    test('keeps the domain-common key for components without a specific route', () => {
        const overrides: Record<string, string> = {};
        const bentoKey = 'bento.date.range.picker.calendar.lastMonth';
        const i18n = createI18n({
            'payByLink.common.filters.types.date.rangeSelect.options.lastMonth': 'Common last month',
            'payByLink.overview.common.filters.types.date.rangeSelect.options.lastMonth': 'Overview last month',
        });

        applyBentoDomainOverrides(overrides, i18n, { [bentoKey]: 'Last month' }, 'payByLink', 'paymentLinkDetails');

        expect(overrides[bentoKey]).toBe('Common last month');
    });

    test('rejects a missing component-specific domain key instead of using the SDK Bento fallback', () => {
        const translationKey = 'transactions.overview.common.filters.types.date.rangeSelect.options.lastMonth';
        const { [translationKey]: _, ...templates } = getOverviewRouteTemplates('transactions');

        expect(() =>
            applyBentoDomainOverrides(
                {},
                createI18n(templates),
                {
                    'bento.date.range.picker.calendar.customRange': 'Custom',
                    'bento.date.range.picker.calendar.lastMonth': 'Last month',
                },
                'transactions',
                'transactions'
            )
        ).toThrow(
            '[Bento translations] Missing component-specific domain translation: transactions.overview.common.filters.types.date.rangeSelect.options.lastMonth'
        );
    });

    test('uses a localized SDK Bento fallback when a domain override is unavailable', () => {
        const overrides: Record<string, string> = { 'bento.alert.criticalIcon': 'stale translation' };
        const i18n = createI18n();
        applyBentoDomainOverrides(overrides, i18n, { 'bento.alert.criticalIcon': 'Critical icon' }, 'capital');
        expect(overrides['bento.alert.criticalIcon']).toBe('Critical icon');
    });

    test('removes an unavailable override so Bento uses its own local fallback', () => {
        const overrides: Record<string, string> = { 'bento.alert.criticalIcon': 'stale translation' };
        const i18n = createI18n();
        applyBentoDomainOverrides(overrides, i18n, {}, 'capital');
        expect(overrides['bento.alert.criticalIcon']).toBeUndefined();
    });

    test('keeps the SDK Bento fallback when domain placeholders do not match', () => {
        const overrides: Record<string, string> = {};
        const i18n = createI18n({ 'transactions.common.errors.noResults': 'No results for %{query}' });
        applyBentoDomainOverrides(overrides, i18n, { 'bento.data.grid.noResults': 'No results for {filter}' }, 'transactions');
        expect(overrides['bento.data.grid.noResults']).toBe('No results for {filter}');
    });

    test('uses the general plural form when exact count variants are unavailable in Bento', () => {
        const overrides: Record<string, string> = {};
        const translationKey = 'transactions.common.inputs.file.restrictions.maxUpload';

        const i18n = createI18n({
            [translationKey]: '%{count} result',
            [`${translationKey}__0`]: 'No results',
            [`${translationKey}__2`]: 'A pair of results',
            [`${translationKey}__plural`]: '%{count} results',
        });

        applyBentoDomainOverrides(
            overrides,
            i18n,
            { 'bento.file.uploader.restrictions.maxUpload': '{count} result | {count} results' },
            'transactions'
        );

        expect(overrides['bento.file.uploader.restrictions.maxUpload']).toBe('No results | {count} result | {count} results');
    });

    test('keeps the SDK Bento fallback when the target does not receive a plural count', () => {
        const overrides: Record<string, string> = {};
        const translationKey = 'transactions.common.errors.noResults';

        const i18n = createI18n({
            [translationKey]: '%{count} result',
            [`${translationKey}__plural`]: '%{count} results',
        });

        applyBentoDomainOverrides(overrides, i18n, { 'bento.data.grid.noResults': '{count} result' }, 'transactions');
        expect(overrides['bento.data.grid.noResults']).toBe('{count} result');
    });

    test('normalizes SDK Bento placeholders for Vue I18n', () => {
        expect(
            getBentoLocaleMessages(
                key => (key === 'bento.timeline.item.showMore' ? 'Show %{items} more' : null),
                key => key === 'bento.timeline.item.showMore'
            )
        ).toEqual({ 'bento.timeline.item.showMore': 'Show {items} more' });
    });

    describe('configured Bento domain-override compatibility', async () => {
        const compatibilityCases = await getCatalogCompatibilityCases();
        const componentRouteCases = await getComponentRouteCases();

        test.each(compatibilityCases)(
            '$locale $domain.$domainKey maps to $bentoKey',
            ({ bentoKey, bentoTemplate, domain, domainKey, family, locale }) => {
                const compiledTemplate = pluralTranslationKeys.has(bentoKey)
                    ? compileDomainTranslationFamilyForBento(family, bentoTemplate)
                    : compileDomainTemplateForBento(family.base!, bentoTemplate);

                expect(compiledTemplate, `${locale}: ${domain}.${domainKey} must match ${bentoKey}`).not.toBeNull();
            }
        );

        test.each(componentRouteCases)(
            '$locale $domain.$domainKey is available to $componentName through $bentoKey',
            ({ bentoKey, bentoTemplate, componentName, domain, domainKey, family, locale }) => {
                expect(family.base, `${locale}: ${domain}.${domainKey} is required by ${componentName}`).not.toBeNull();
                if (!family.base) return;

                expect(
                    compileDomainTemplateForBento(family.base, bentoTemplate),
                    `${locale}: ${domain}.${domainKey} must match ${bentoKey}`
                ).not.toBeNull();
            }
        );
    });

    test('uses the SDK English fallback for missing active-locale Bento translations', async () => {
        const localization = new Localization('da-DK', undefined, '', '', SDK_BENTO_TRANSLATION_SOURCES);
        await localization.ready;

        expect(localization.has('bento.alert.close')).toBe(true);
        expect(localization.has('bento.alert.criticalIcon')).toBe(true);
        expect(
            getBentoLocaleMessages(
                key => localization.getTemplate(key),
                key => localization.has(key)
            )
        ).toHaveProperty('bento.alert.criticalIcon', 'Critical icon');
    });
});
