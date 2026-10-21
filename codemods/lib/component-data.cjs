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

// Merged rule (#1493, e7c90f99b): on the list components, `preferredLimit` and
// `allowLimitSelection` are replaced by a single `pagination` object.
// `preferredLimit` moves to `pagination.defaultLimit` (mode 'move': the value
// is carried over as-is), and `allowLimitSelection` flips polarity into
// `pagination.disableLimitSelection` (mode 'invert': `false` becomes `true`,
// and `true` is the V2 default and is dropped).
const PAGINATION_RULE = {
    components: LIST_COMPONENTS,
    oldProps: {
        preferredLimit: { field: 'defaultLimit', mode: 'move' },
        allowLimitSelection: { field: 'disableLimitSelection', mode: 'invert' },
    },
};

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
    PaymentLinkDetails: {
        onUpdate: 'internal wiring — the details view reports its own updates',
    },
    PaymentLinkSettings: {
        embeddedInOverview: 'internal wiring — the Overview sets this itself',
        navigateBack: 'internal wiring — standalone Settings no longer exposes back navigation',
        settingsItems: 'internal wiring — the settings sections are no longer selectable',
    },
    PaymentLinksOverview: {
        balanceAccountId: 'the Overview is store-scoped; pass storeIds instead',
        onFiltersChanged: 'filters are handled internally; the callback no longer fires',
        showDetails: 'the built-in details view opens by default on record selection',
    },
    PayoutsOverview: {
        onFiltersChanged: 'filters are handled internally; the callback no longer fires',
        showDetails: 'the built-in details view opens by default on record selection',
    },
    ReportsOverview: {
        onFiltersChanged: 'filters are handled internally; the callback no longer fires',
        onRecordSelection: 'report rows are not selectable (the row action is the download button) and the callback was never invoked in V1',
    },
    TransactionsOverview: {
        onFiltersChanged: 'filters are handled internally; the callback no longer fires',
        showDetails: 'the built-in details view opens by default on record selection',
    },
};

// Prop renames per component: { component: { oldProp: newProp } }.
// Capital Offer's `onOfferDismiss` → `onDismiss` (#1510) is folded into the
// props-convention stack, alongside Dispute Management's
// `onDisputeAccept`/`onDisputeDefend` → `onAccept`/`onDefend` and Pay by Link
// Creation's `onPaymentLinkCreated` → `onCreate`. All three existed in V1.
const RENAMED_PROPS = {
    CapitalOffer: {
        onOfferDismiss: 'onDismiss',
    },
    DisputeManagement: {
        onDisputeAccept: 'onAccept',
        onDisputeDefend: 'onDefend',
    },
    PaymentLinkCreation: {
        onCreationDismiss: 'onDismiss',
        onPaymentLinkCreated: 'onCreate',
    },
};

// Rules for object-valued sub-configurations on the Overview components.
// Merged rename (#1495, beb0f9bb1): `dataCustomization.list` was renamed to
// `dataCustomization.dataGrid` on Transactions, Payouts, Reports and
// Disputes — the only components that accept `dataCustomization`.
// Pay by Link Overview's `paymentLinkCreation`/`paymentLinkSettings` are no
// longer public at all: see REMOVED_SUBCONFIGS.
const SUBCONFIG_RULES = {
    DisputesOverview: {
        dataCustomization: {
            renames: {
                list: 'dataGrid',
            },
        },
    },
    PayoutsOverview: {
        dataCustomization: {
            renames: {
                list: 'dataGrid',
            },
        },
    },
    ReportsOverview: {
        dataCustomization: {
            renames: {
                list: 'dataGrid',
            },
        },
    },
    TransactionsOverview: {
        dataCustomization: {
            renames: {
                list: 'dataGrid',
            },
        },
    },
};

// Sub-configurations dropped from the public props entirely: they became
// internal wiring on the Overview, which now configures the modal itself.
// Pay by Link Overview exposed both in V1, so a V1 integration has to give
// them up. Values that have a V2 top-level home are hoisted before the
// sub-configuration is removed (`hoistToProps`); everything else inside is
// reported in a marker, because dropping it changes behaviour.
const REMOVED_SUBCONFIGS = {
    PaymentLinksOverview: {
        paymentLinkCreation: {
            reason: 'the creation modal is now configured internally',
            hoistToProps: {},
        },
        paymentLinkSettings: {
            reason: 'the settings modal is now configured internally',
            // V1 allowed `paymentLinkSettings.storeIds`; the Overview's own
            // top-level `storeIds` is where that value belongs in V2.
            hoistToProps: { storeIds: 'storeIds' },
        },
    },
};

// Callback selection-object field renames per component:
// { component: { propName: { oldField: newField } } }. The selection object
// passed to `onRecordSelection` renamed `showModal` to `showDetails`
// (#1522, merged into develop); Payouts Overview additionally renamed its
// `balanceAccountId` field to `id` — the same value under the V2 name, which
// now matches the other list components. Reports Overview lost the whole
// `onRecordSelection` prop instead (see REMOVED_PROPS).
const CALLBACK_FIELD_RENAMES = {
    DisputesOverview: {
        onRecordSelection: {
            showModal: 'showDetails',
        },
    },
    PaymentLinksOverview: {
        onRecordSelection: {
            showModal: 'showDetails',
        },
    },
    PayoutsOverview: {
        onRecordSelection: {
            balanceAccountId: 'id',
            showModal: 'showDetails',
        },
    },
    TransactionsOverview: {
        onRecordSelection: {
            showModal: 'showDetails',
        },
    },
};

// Removed props inside custom-column entries — the objects in the `fields`
// array of a `dataCustomization` list/dataGrid customization (Transactions,
// Payouts, Reports and Disputes; Pay by Link has no `dataCustomization`).
// Merged V2 change (50e6b43d7): `align` was removed — V2 grids align columns
// internally. `flex` and `visibility` are unchanged, and the `details`
// customization never had `align`. `list` is the V1 spelling of the
// sub-configuration; `dataGrid` is its V2 name (#1495).
// Customizations declared on their own and passed in by reference
// (`const columns: PayoutsListCustomization = { fields: [...] }`) carry the
// same column entries, and are cleaned up through their type annotation; see
// COLUMN_CUSTOMIZATION_TYPES below.
const COLUMN_REMOVED_PROPS = {
    subConfigs: ['list', 'dataGrid'],
    removedProps: {
        align: 'V2 grids align columns internally',
    },
};

// V1 type/export names that still exist in V2 under a new name.
// The data-customization renames (#1495, beb0f9bb1) follow the
// `dataCustomization.list` → `dataCustomization.dataGrid` rename.
const TYPE_RENAMES = {
    CapitalComponentState: 'CapitalState',
    CapitalOfferComponentProps: 'CapitalOfferProps',
    CapitalOverviewComponentProps: 'CapitalOverviewProps',
    DisputeOverviewComponentProps: 'DisputesOverviewProps', // V1 published this name with a typo
    DisputesListCustomization: 'DisputesDataGridCustomization',
    DisputesOverviewComponentProps: 'DisputesOverviewProps',
    ExternalCapitalState: 'CapitalState',
    onErrorHandler: 'ErrorHandler',
    PaymentLinkCreationComponentProps: 'PaymentLinkCreationProps',
    PaymentLinkDetailsComponentProps: 'PaymentLinkDetailsProps',
    PaymentLinkSettingsComponentProps: 'PaymentLinkSettingsProps',
    PaymentLinksOverviewComponentProps: 'PaymentLinksOverviewProps',
    PayoutDetailsComponentProps: 'PayoutDetailsProps',
    PayoutsListCustomization: 'PayoutsDataGridCustomization',
    PayoutsOverviewComponentProps: 'PayoutsOverviewProps',
    ReportsListCustomization: 'ReportsDataGridCustomization',
    ReportsOverviewComponentProps: 'ReportsOverviewProps',
    TransactionDetailsComponentProps: 'TransactionDetailsProps',
    TransactionsListCustomization: 'TransactionsDataGridCustomization',
    TransactionsOverviewComponentProps: 'TransactionsOverviewProps',
};

// The grid-customization type names, under both their V1 (`*ListCustomization`)
// and V2 (`*DataGridCustomization`) spellings: a standalone customization
// object can carry either, since fix-imports may already have renamed the
// annotation. The `*DetailsCustomization` types are excluded — detail fields
// never had the removed column props.
const COLUMN_CUSTOMIZATION_TYPES = Object.entries(TYPE_RENAMES)
    .filter(([oldName]) => oldName.endsWith('ListCustomization'))
    .flatMap(([oldName, newName]) => [oldName, newName]);

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

// Sub-configuration keys that must not feed V1_ONLY_PROP_KEYS: they name
// keys nested inside a sub-configuration (never top-level component props)
// and are far too generic to flag on `.update()` receivers that cannot be
// identified.
const UNFLAGGED_SUBCONFIG_KEYS = new Set(['list']);

// Top-level prop names that are valid on some components and gone from others,
// so an unattributed `.update()` cannot be judged: `balanceAccountId` was
// dropped from Pay by Link Overview but is still required by the four
// balance-account-scoped Overviews.
const SHARED_PROP_KEYS = new Set(['balanceAccountId']);

// Prop names that were removed or renamed on at least one component in V2.
// Used to flag `.update()` calls whose receiving component cannot be
// identified (instance constructed in another file, indirect references):
// whether the prop is still valid depends on the component, so they are
// left in place and pointed at the migration guide.
const V1_ONLY_PROP_KEYS = Array.from(
    new Set([
        ...Object.keys(GLOBAL_REMOVED_PROPS),
        HIDE_TITLE_PROP,
        ...Object.keys(PAGINATION_RULE.oldProps),
        ...Object.values(REMOVED_PROPS).flatMap(rules => Object.keys(rules)),
        ...Object.values(RENAMED_PROPS).flatMap(rules => Object.keys(rules)),
        ...Object.values(REMOVED_SUBCONFIGS).flatMap(componentRules => Object.keys(componentRules)),
        ...Object.values(SUBCONFIG_RULES).flatMap(componentRules =>
            Object.values(componentRules)
                .flatMap(rules => [...Object.keys(rules.renames || {}), ...Object.keys(rules.removedProps || {})])
                .filter(key => !UNFLAGGED_SUBCONFIG_KEYS.has(key))
        ),
    ])
).filter(key => !SHARED_PROP_KEYS.has(key));

module.exports = {
    COMPONENTS,
    UMD_GLOBAL,
    LIST_COMPONENTS,
    GLOBAL_REMOVED_PROPS,
    HIDE_TITLE_PROP,
    PAGINATION_RULE,
    REMOVED_PROPS,
    RENAMED_PROPS,
    SUBCONFIG_RULES,
    REMOVED_SUBCONFIGS,
    CALLBACK_FIELD_RENAMES,
    COLUMN_REMOVED_PROPS,
    COLUMN_CUSTOMIZATION_TYPES,
    TYPE_RENAMES,
    REMOVED_EXPORTS,
    PACKAGE_NAME,
    V1_ONLY_PROP_KEYS,
};
