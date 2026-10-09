'use strict';

/**
 * V1 → V2 knowledge base for @adyen/adyen-platform-experience-web.
 *
 * Source of truth: docs/v2/v1-to-v2-migration-guide.md and
 * docs/v2/v1-to-v2-changelog.md, cross-checked against the V1
 * (`version/v1.x`) and V2 (`develop`) public export surfaces.
 */

// The 13 components published by the SDK (unchanged names between V1 and V2).
const COMPONENTS = [
    'CapitalOffer',
    'CapitalOverview',
    'DisputeManagement',
    'DisputesOverview',
    'PaymentLinkCreation',
    'PaymentLinkDetails',
    'PaymentLinkSettings',
    'PaymentLinksOverview',
    'PayoutDetails',
    'PayoutsOverview',
    'ReportsOverview',
    'TransactionDetails',
    'TransactionsOverview',
];

// The UMD/CDN global that exposes the same components as properties.
const UMD_GLOBAL = 'AdyenPlatformExperienceWeb';

// Overview ("list") components that lost `showDetails` and `onFiltersChanged`.
const LIST_COMPONENTS = [
    'DisputesOverview',
    'PaymentLinksOverview',
    'PayoutsOverview',
    'ReportsOverview',
    'TransactionsOverview',
];

// Props removed from every component, with the migration-guide reason.
const GLOBAL_REMOVED_PROPS = {
    onError: 'V2 wires error handling only through the core-level `onError` option on AdyenPlatformExperience(); move this handler there',
};

// `hideTitle` is removed from every component and replaced by
// `appearance: { titles: 'hidden' }` (handled by component-props codemod).
const HIDE_TITLE_PROP = 'hideTitle';

// Props removed per component, with the migration-guide reason.
const REMOVED_PROPS = {
    CapitalOffer: {
        externalCapitalState: 'the component now always resolves its own state',
        onOfferSelect: 'the component now always runs its own summary step',
    },
    CapitalOverview: {
        onFundsRequest: 'offer and early-renewal flows are handled internally',
        onOfferDismiss: 'offer and early-renewal flows are handled internally',
        onOfferOptionsRequest: 'offer and early-renewal flows are handled internally',
        skipPreQualifiedIntro: 'replaced by a persistent offer alert over the grant list',
    },
    DisputesOverview: {
        onFiltersChanged: 'filters are handled internally; the callback no longer fires',
        showDetails: 'the built-in details view opens by default on record selection',
    },
    PaymentLinksOverview: {
        onFiltersChanged: 'filters are handled internally; the callback no longer fires',
        showDetails: 'the built-in details view opens by default on record selection',
    },
    PayoutsOverview: {
        onFiltersChanged: 'filters are handled internally; the callback no longer fires',
        showDetails: 'the built-in details view opens by default on record selection',
    },
    ReportsOverview: {
        onFiltersChanged: 'filters are handled internally; the callback no longer fires',
    },
    TransactionsOverview: {
        onFiltersChanged: 'filters are handled internally; the callback no longer fires',
        showDetails: 'the built-in details view opens by default on record selection',
    },
};

// Prop renames per component: { component: { oldProp: newProp } }.
const RENAMED_PROPS = {
    PaymentLinkCreation: {
        onCreationDismiss: 'onDismiss',
    },
};

// Rules for object-valued sub-configurations on the Overview components.
// `paymentLinkCreation.onCreationDismiss` was renamed to `onDismiss`, and
// `paymentLinkSettings` now only accepts a required `onDismiss`
// (`hideTitle`/`storeIds` moved or were removed).
const SUBCONFIG_RULES = {
    PaymentLinksOverview: {
        paymentLinkCreation: {
            renames: {
                onCreationDismiss: 'onDismiss',
            },
        },
        paymentLinkSettings: {
            removedProps: {
                hideTitle: 'the sub-configuration no longer accepts hideTitle',
                storeIds: 'pass storeIds at the top level of the Overview instead',
            },
            // When the parent object has no `storeIds` of its own, the
            // sub-configuration value is hoisted there automatically.
            hoistToProps: {
                storeIds: 'storeIds',
            },
            requiredProps: ['onDismiss'],
        },
    },
};

// V1 type/export names that still exist in V2 under a new name.
const TYPE_RENAMES = {
    CapitalComponentState: 'CapitalState',
    CapitalOfferComponentProps: 'CapitalOfferProps',
    CapitalOverviewComponentProps: 'CapitalOverviewProps',
    DisputeOverviewComponentProps: 'DisputesOverviewProps', // V1 published this name with a typo
    DisputesOverviewComponentProps: 'DisputesOverviewProps',
    ExternalCapitalState: 'CapitalState',
    onErrorHandler: 'ErrorHandler',
    PaymentLinkCreationComponentProps: 'PaymentLinkCreationProps',
    PaymentLinkDetailsComponentProps: 'PaymentLinkDetailsProps',
    PaymentLinkSettingsComponentProps: 'PaymentLinkSettingsProps',
    PaymentLinksOverviewComponentProps: 'PaymentLinksOverviewProps',
    PayoutDetailsComponentProps: 'PayoutDetailsProps',
    PayoutsOverviewComponentProps: 'PayoutsOverviewProps',
    ReportsOverviewComponentProps: 'ReportsOverviewProps',
    TransactionDetailsComponentProps: 'TransactionDetailsProps',
    TransactionsOverviewComponentProps: 'TransactionsOverviewProps',
};

// Names V1 leaked through wildcard re-exports that V2 no longer publishes.
// (Renamed names are NOT listed here; they are in TYPE_RENAMES.)
const REMOVED_EXPORTS = [
    // Core runtime
    'Core',
    'Localization',
    'Assets',
    'http',
    'httpGet',
    'httpPost',
    'ErrorTypes',
    'getErrorType',
    'getApiVersion',
    'getRequestObject',
    'handleFetchError',
    'isAdyenErrorResponse',
    'parseSearchParams',
    'API_VERSION',
    'CURRENCY_DECIMALS',
    'createKeyFactoryFromConfig',
    'createDynamicTranslationFactory',
    'AuthSession',
    'AuthSessionSpecification',
    'createConfigContextValue',
    'createConfigController',
    'checkComponentPermission',
    'subscribeToSession',
    'createCoreContextValue',
    'waitForI18n',
    'setupAnalytics',
    'Analytics',
    'API_ENVIRONMENTS',
    'CDN_ENVIRONMENTS',
    'resolveEnvironment',
    'FALLBACK_ENV',
    'FALLBACK_CDN_ENV',
    'normalizeLoadingContext',
    'normalizeUrl',
    'getConfigFromCdn',
    'getDatasetFromCdn',
    'getUserAgent',
    'getCurrentUrl',
    'getScreenWidth',
    'isServerSideRuntime',
    'shouldWarnAboutServerSideInitialization',
    'SERVER_SIDE_INITIALIZATION_WARNING',
    // Core types
    'InvalidField',
    'AssetOptions',
    'HttpOptions',
    'ErrorLevel',
    'HttpMethod',
    'AdyenErrorResponse',
    'TranslationSourceRecord',
    'Locale',
    'Translations',
    'TranslationSource',
    'TranslationOptions',
    'KeyFactoryConfig',
    'KeyFactoryFunction',
    'TranslationFactoryFunction',
    'TranslationFallbackFunction',
    'CoreProviderProps',
    'ComponentRef',
    'CommonPropsTypes',
    'ConfigProviderProps',
    'SetupResponse',
    'SetupContextObject',
    'EndpointHttpCallable',
    'EndpointHttpCallables',
    'EndpointSuccessResponse',
    'AnalyticsSetupOptions',
    'AnalyticsSetupResult',
    'AnalyticsOptions',
    'Experiment',
    'ResolvedEnvironment',
    'CdnFetcher',
    'ManagedElement',
    // Domain types
    'TransactionsTableFields',
    'TransactionsFilters',
    'TransactionDetailsFields',
    'DetailsWithExtraData',
    'RefundReason',
    'RefundResult',
    'RefundLineItem',
    'RefundLineItemUpdates',
    'DisputeDetailsFields',
    'DisputeCallbackData',
    'DisputesTableFields',
    'DisputeStatusGroup',
    'PayoutsTableFields',
    'ReportsTableFields',
    'StoreIds',
    'PaymentLinkFieldsVisibilityConfig',
    'PaymentLinkCreationFieldsConfig',
    // Runtime enums
    'ActiveView',
    'DetailsTab',
    'RefundedState',
    'RefundMode',
    'RefundType',
];

// The npm package specifier these codemods target.
const PACKAGE_NAME = '@adyen/adyen-platform-experience-web';

// Prop names that were removed or renamed on at least one component in V2.
// Used to flag `.update()` calls whose receiving component cannot be
// identified (instance constructed in another file, indirect references):
// whether the prop is still valid depends on the component, so they are
// left in place and pointed at the migration guide.
const V1_ONLY_PROP_KEYS = Array.from(
    new Set([
        ...Object.keys(GLOBAL_REMOVED_PROPS),
        HIDE_TITLE_PROP,
        ...Object.values(REMOVED_PROPS).flatMap(rules => Object.keys(rules)),
        ...Object.values(RENAMED_PROPS).flatMap(rules => Object.keys(rules)),
        ...Object.values(SUBCONFIG_RULES).flatMap(componentRules =>
            Object.values(componentRules).flatMap(rules => [
                ...Object.keys(rules.renames || {}),
                ...Object.keys(rules.removedProps || {}),
            ])
        ),
    ])
);

module.exports = {
    COMPONENTS,
    UMD_GLOBAL,
    LIST_COMPONENTS,
    GLOBAL_REMOVED_PROPS,
    HIDE_TITLE_PROP,
    REMOVED_PROPS,
    RENAMED_PROPS,
    SUBCONFIG_RULES,
    TYPE_RENAMES,
    REMOVED_EXPORTS,
    PACKAGE_NAME,
    V1_ONLY_PROP_KEYS,
};
