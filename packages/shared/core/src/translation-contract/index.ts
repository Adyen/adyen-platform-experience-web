export { CoreDomainTranslations } from './domainTranslations';
export { TranslationDiagnostics } from './diagnostics';
export type { TranslationDiagnosticReporter } from './diagnostics';
export { createDomainI18n, DomainLocalization } from './domainI18n';
export type { DomainCustomTranslations, DomainI18n, DomainI18nFormatters, DomainI18nOptions } from './domainI18n';
export {
    V2_BENTO_TRANSLATION_KEYS,
    V2_PUBLIC_TRANSLATION_KEYS,
    V2_PUBLIC_TRANSLATION_PLACEHOLDER_CONTRACTS,
    V2_ROUTED_BENTO_TRANSLATION_KEYS,
    V2_SDK_BENTO_FALLBACK_TRANSLATION_KEYS,
    V2_TRANSLATION_ALIASES,
    V2_TRANSLATION_ROUTES,
} from './generated';
export type { V2BentoTranslationKey, V2PublicTranslationKey } from './generated';
export { canonicalizeTranslationLocale, translationLocalesMatch } from './locale';
export {
    compileTranslationFamily,
    compileTranslationTemplate,
    formatV1TranslationTemplate,
    haveMatchingPlaceholders,
    InvalidTranslationTemplateError,
    parseTranslationFamilyKey,
    parseV1TranslationTemplate,
} from './message';
export { TranslationContractResolver } from './resolver';
export { assertValidTranslationContract, validateTranslationContract } from './validate';
export type { TranslationContractValidationInput } from './validate';
export type {
    BentoTranslationTarget,
    CompiledTranslationFamily,
    ConsumerTranslations,
    CustomTranslationCandidates,
    DomainTranslationInputs,
    DomainTranslationConnection,
    DomainTranslationProvider,
    DomainTranslationSources,
    DomainTranslationTarget,
    GetCustomTranslations,
    ParsedTranslationFamilyKey,
    PublicTranslationAlias,
    PublicTranslationRoute,
    TranslationContractRegistry,
    TranslationDiagnostic,
    TranslationDiagnosticCode,
    TranslationFamily,
    TranslationFamilyVariant,
    TranslationOptions,
    TranslationPlaceholderContracts,
    TranslationResolverSources,
    TranslationSource,
    TranslationTarget,
    TranslationTargetFormat,
    TranslationTemplate,
    TranslationTemplateNode,
} from './types';
