export type TranslationDiagnosticCode =
    | 'deprecated_translation_key'
    | 'duplicate_translation_alias'
    | 'duplicate_translation_route'
    | 'invalid_translation_alias'
    | 'invalid_translation_fan_out'
    | 'invalid_translation_key'
    | 'invalid_translation_locale'
    | 'invalid_translation_template'
    | 'missing_translation_route'
    | 'stale_translation_route'
    | 'unknown_translation_key'
    | 'unmapped_domain_key'
    | 'unsupported_translation_target';

export type TranslationDiagnostic = Readonly<{
    code: TranslationDiagnosticCode;
    domain?: string;
    publicKey?: string;
    targetKey?: string;
}>;

export type TranslationOptions = Readonly<{
    count?: number;
    values?: Record<string, unknown> | ((placeholder: string, index: number, repetitionIndex: number) => unknown);
}>;

export type TranslationSource = Readonly<Record<string, string>>;
export type DomainTranslationSources = Readonly<Record<string, TranslationSource>>;
export type ConsumerTranslations = Readonly<Record<string, Readonly<Record<string, string>>>>;
export type CustomTranslationCandidates<Value = string> = Readonly<{
    defaultTranslation?: Value;
    localeTranslation?: Value;
}>;
export type GetCustomTranslations<DomainKey extends string, Value = string> = (key: DomainKey, locale: string) => CustomTranslationCandidates<Value>;
export type DomainTranslationInputs<DomainKey extends string, Value = string> = Readonly<{
    getCustomTranslations?: GetCustomTranslations<DomainKey, Value>;
    locale?: string;
}>;
export type DomainTranslationProvider<DomainKey extends string = string, Value = string> = Readonly<{
    getInputs(): DomainTranslationInputs<DomainKey, Value>;
    subscribe(listener: (inputs: DomainTranslationInputs<DomainKey, Value>) => void): () => void;
}>;
export type DomainTranslationConnection<DomainKey extends string = string, Value = string> = Readonly<{
    dispose(): void;
    translations: DomainTranslationProvider<DomainKey, Value>;
}>;

export type TranslationTargetFormat = 'bento' | 'v1';

export type TranslationTemplateNode = Readonly<{ type: 'placeholder'; name: string }> | Readonly<{ type: 'text'; value: string }>;

export type TranslationTemplate = Readonly<{
    nodes: readonly TranslationTemplateNode[];
    placeholders: readonly string[];
    source: string;
}>;

export type TranslationFamilyVariant = Readonly<{ type: 'base' }> | Readonly<{ type: 'exact'; count: number }> | Readonly<{ type: 'plural' }>;

export type ParsedTranslationFamilyKey = Readonly<{
    baseKey: string;
    variant: TranslationFamilyVariant;
}>;

export type TranslationFamily = Readonly<{
    base?: string;
    exact?: Readonly<Record<number, string>>;
    plural?: string;
}>;

export type CompiledTranslationFamily = Readonly<{ format: 'bento'; template: string }> | Readonly<{ format: 'v1'; templates: TranslationFamily }>;

export type DomainTranslationTarget = Readonly<{
    domain: string;
    format: 'v1';
    key: string;
    kind: 'domain';
}>;

export type BentoTranslationTarget = Readonly<{
    format: 'bento';
    key: string;
    kind: 'bento';
}>;

export type TranslationTarget = DomainTranslationTarget | BentoTranslationTarget;

export const translationTargetId = (target: TranslationTarget): string =>
    target.kind === 'domain' ? `domain:${target.domain}:${target.key}` : `bento:${target.key}`;

export type PublicTranslationRoute = Readonly<{
    publicKey: string;
    targets: readonly TranslationTarget[];
    /**
     * Required when a route has no SDK default or domain source from which to
     * derive its placeholder contract.
     */
    placeholders?: readonly string[];
}>;

export type PublicTranslationAlias = Readonly<{
    alias: string;
    deprecated?: boolean;
    targets: readonly string[];
}>;

export type TranslationContractRegistry = Readonly<{
    aliases: readonly PublicTranslationAlias[];
    domains: readonly string[];
    routes: readonly PublicTranslationRoute[];
}>;

export type TranslationPlaceholderContracts = Readonly<Record<string, readonly string[]>>;

export type TranslationResolverSources = Readonly<{
    consumerTranslations?: ConsumerTranslations;
    sdkDefaultTranslations: TranslationSource;
    sdkLocale?: string;
    sdkLocaleTranslations?: TranslationSource;
}>;
