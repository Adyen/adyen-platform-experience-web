import type { COMPONENT_DATA_EVENT_CAPABILITIES } from '@integration-components/core/EventDispatcher/eventDispatcher/component-data-capabilities';
import type { ComponentDataEventCapabilityConfiguration } from '@integration-components/core/EventDispatcher/eventDispatcher/core-events';
import type { UIElementProps } from '@integration-components/core/vue';
import type { ExternalComponentType } from '@integration-components/types';
import type * as SDK from '../../src';
import type {
    CapitalOfferProps,
    CapitalOverviewProps,
    CoreOptions,
    DisputeManagementProps,
    DisputesOverviewProps,
    PaymentLinkCreationProps,
    PaymentLinkDetailsProps,
    PaymentLinkSettingsProps,
    PaymentLinksOverviewProps,
    PayoutDetailsProps,
    PayoutsOverviewProps,
    ReportsOverviewProps,
    TransactionDetailsProps,
    TransactionsOverviewProps,
} from '../../src';

type Assert<T extends true> = T;
type Every<TChecks extends Record<string, boolean>, TExpected extends boolean> = TChecks[keyof TChecks] extends TExpected ? true : false;
type HasKey<TProps, TKey extends string> = TKey extends keyof TProps ? true : false;
type LacksKey<TProps, TKey extends string> = TKey extends keyof TProps ? false : true;
type Same<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false;

type AcceptsDataGridAppearance<TProps> = TProps extends { appearance?: infer TAppearance } ? HasKey<NonNullable<TAppearance>, 'dataGrid'> : false;

type PropsAliases = {
    CapitalOffer: CapitalOfferProps;
    CapitalOverview: CapitalOverviewProps;
    DisputeManagement: DisputeManagementProps;
    DisputesOverview: DisputesOverviewProps;
    PaymentLinkCreation: PaymentLinkCreationProps;
    PaymentLinkDetails: PaymentLinkDetailsProps;
    PaymentLinkSettings: PaymentLinkSettingsProps;
    PaymentLinksOverview: PaymentLinksOverviewProps;
    PayoutDetails: PayoutDetailsProps;
    PayoutsOverview: PayoutsOverviewProps;
    ReportsOverview: ReportsOverviewProps;
    TransactionDetails: TransactionDetailsProps;
    TransactionsOverview: TransactionsOverviewProps;
};

type ConstructibleExportNames = {
    [K in keyof typeof SDK]: (typeof SDK)[K] extends abstract new (...args: never[]) => unknown ? K : never;
}[keyof typeof SDK];
type ComponentExportNames = Exclude<ConstructibleExportNames, 'AdyenPlatformExperienceError'>;
type ComponentConstructors = {
    [K in ComponentExportNames]: (typeof SDK)[K];
};
type PublishedProps = {
    [K in ComponentExportNames]: ConstructorParameters<ComponentConstructors[K]>[0];
};

type DataGridComponents = Pick<
    PublishedProps,
    'DisputesOverview' | 'PaymentLinksOverview' | 'PayoutsOverview' | 'ReportsOverview' | 'TransactionsOverview'
>;
type NonDataGridComponents = Omit<PublishedProps, keyof DataGridComponents>;

export type _SdkExportsAtLeastOneComponent = Assert<[ComponentExportNames] extends [never] ? false : true>;
export type _EverySdkComponentHasPublishedProps = Assert<Every<{ [K in ComponentExportNames]: K extends keyof PropsAliases ? true : false }, true>>;
export type _EveryPublishedPropsAliasIsAnSdkComponent = Assert<
    Every<{ [K in keyof PropsAliases]: K extends ComponentExportNames ? true : false }, true>
>;
export type _PublishedPropsMatchConstructors = Assert<
    Every<{ [K in keyof PropsAliases]: Same<PropsAliases[K], PublishedProps[K & ComponentExportNames]> }, true>
>;
export type _CoreOptionsMatchFactoryParameters = Assert<Same<CoreOptions, Parameters<typeof SDK.AdyenPlatformExperience>[0]>>;
export type _EveryComponentUsesUIElementProps = Assert<
    Every<{ [K in keyof PublishedProps]: PublishedProps[K] extends UIElementProps ? true : false }, true>
>;
type ForbiddenProps = 'onDismiss' | 'onError' | 'ref';
export type _NoComponentTakesForbiddenProps = Assert<
    Every<{ [K in keyof PublishedProps]: [Extract<keyof PublishedProps[K], ForbiddenProps>] extends [never] ? true : false }, true>
>;

export type _OverviewComponentsTakeDataGridAppearance = Assert<
    Every<{ [K in keyof DataGridComponents]: AcceptsDataGridAppearance<DataGridComponents[K]> }, true>
>;

export type _OtherComponentsRejectDataGridAppearance = Assert<
    Every<{ [K in keyof NonDataGridComponents]: AcceptsDataGridAppearance<NonDataGridComponents[K]> }, false>
>;

type InternalOnlyProps = {
    CapitalOffer: 'capitalState' | 'hideSubtitle' | 'hideTitle' | 'onTitleChange';
    PaymentLinkCreation: 'embeddedInOverview' | 'onShowDetails';
    PaymentLinkDetails: 'onTitleChange' | 'onUpdate';
    PaymentLinkSettings: 'embeddedInOverview' | 'hideTitle' | 'navigateBack' | 'settingsItems';
    PayoutDetails: 'balanceAccountDescription';
    PaymentLinksOverview: 'paymentLinkCreation' | 'paymentLinkSettings';
};

export type _NoComponentPublishesInternalOnlyProps = Assert<
    Every<{ [K in keyof InternalOnlyProps]: LacksKey<PublishedProps[K], InternalOnlyProps[K]> }, true>
>;

type RemovedProps = {
    CapitalOffer: 'onOfferDismiss';
    DisputesOverview: 'balanceAccountId';
    PaymentLinkCreation: 'onPaymentLinkCreated';
    PaymentLinksOverview: 'balanceAccountId';
    PayoutsOverview: 'balanceAccountId';
    ReportsOverview: 'balanceAccountId';
    TransactionsOverview: 'balanceAccountId';
};

export type _NoComponentPublishesRemovedProps = Assert<Every<{ [K in keyof RemovedProps]: LacksKey<PublishedProps[K], RemovedProps[K]> }, true>>;
export type _PaymentLinkCreationTakesOnCreate = Assert<HasKey<PaymentLinkCreationProps, 'onCreate'>>;
export type _PayoutDetailsKeepsRequiredIdAndDate = Assert<Same<Pick<PayoutDetailsProps, 'id' | 'date'>, { id: string; date: string }>>;
export type _CapitalOfferPropsDoNotRequireSubmit = Assert<Pick<CapitalOfferProps, never> extends Pick<CapitalOfferProps, 'onSubmit'> ? true : false>;
export type _CapitalOfferDoesNotPublishFundsRequest = Assert<LacksKey<CapitalOfferProps, 'onFundsRequest'>>;

/**
 * The "Customized component data" analytics event only reports what each component's public props can carry.
 * Adding, renaming or removing a public callback, `dataCustomization` section, `pagination` or `fieldsConfig`
 * prop fails this check until `COMPONENT_DATA_EVENT_CAPABILITIES` is updated to match.
 */
type PublishedPropsByComponentType = {
    [K in ComponentExportNames as (typeof SDK)[K] extends { type: infer TType extends string } ? TType : never]: PublishedProps[K];
};

type PublicDataEventProps<TProps> = TProps extends unknown
    ?
          | {
                [K in keyof TProps & string]-?: K extends `on${string}`
                    ? NonNullable<TProps[K]> extends (...args: never[]) => unknown
                        ? K
                        : never
                    : never;
            }[keyof TProps & string]
          | (TProps extends { dataCustomization?: infer TCustomization } ? `dataCustomization.${keyof NonNullable<TCustomization> & string}` : never)
          | Extract<keyof TProps, 'pagination' | 'fieldsConfig'>
    : never;

type TrackedDataEventProps<TCapabilities> =
    | (TCapabilities extends { callbackProps: readonly (infer TName)[] } ? TName : never)
    | (TCapabilities extends { dataCustomization: readonly (infer TSection extends string)[] } ? `dataCustomization.${TSection}` : never)
    | (TCapabilities extends { pagination: true } ? 'pagination' : never)
    | (TCapabilities extends { fieldsConfig: infer TPath } ? TPath : never);

/** Fails when a capability field is added or removed, so `TrackedDataEventProps` keeps reading every field. */
export type _TrackedDataEventPropsCoversEveryCapability = Assert<
    Same<keyof ComponentDataEventCapabilityConfiguration, 'callbackProps' | 'dataCustomization' | 'fieldsConfig' | 'pagination'>
>;

type ExpectNever<T extends never> = T;
type Drift<C extends string, TPublic, TTracked> = `${C}:${(Exclude<TPublic, TTracked> | Exclude<TTracked, TPublic>) & string}`;

export type _EveryExternalComponentTypeIsAnSdkComponent = Assert<Same<keyof PublishedPropsByComponentType, ExternalComponentType>>;

/** Lists `component:prop` for every prop that is public but untracked, or tracked but not public. */
export type _DataEventCapabilitiesMatchPublicProps = ExpectNever<
    {
        [C in ExternalComponentType]: Drift<
            C,
            PublicDataEventProps<PublishedPropsByComponentType[C & keyof PublishedPropsByComponentType]>,
            TrackedDataEventProps<(typeof COMPONENT_DATA_EVENT_CAPABILITIES)[C]>
        >;
    }[ExternalComponentType]
>;

type SelectionPayload<TProps extends { onRecordSelection?: (...args: never[]) => void }> = Parameters<NonNullable<TProps['onRecordSelection']>>[0];
type SelectionComponents = Pick<PublishedProps, 'TransactionsOverview' | 'PayoutsOverview' | 'DisputesOverview' | 'PaymentLinksOverview'>;

export type _SelectionPayloadsCarryIdAndShowDetails = Assert<
    Every<
        { [K in keyof SelectionComponents]: SelectionPayload<SelectionComponents[K]> extends { id: string; showDetails: () => void } ? true : false },
        true
    >
>;

export type _PayoutsSelectionPayloadAlsoCarriesDate = Assert<
    Same<SelectionPayload<PayoutsOverviewProps>, { id: string; date: string; showDetails: () => void }>
>;
