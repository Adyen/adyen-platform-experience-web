import type { UIElementProps } from '@integration-components/core/vue';
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
type DismissibleComponents = Pick<
    PublishedProps,
    | 'CapitalOffer'
    | 'DisputeManagement'
    | 'PaymentLinkCreation'
    | 'PaymentLinkDetails'
    | 'PaymentLinkSettings'
    | 'PayoutDetails'
    | 'TransactionDetails'
>;

type PropPresence<TProps extends Record<string, unknown>, TKey extends string> = { [K in keyof TProps]: HasKey<TProps[K], TKey> };

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
export type _DismissibleComponentsTakeOnDismiss = Assert<Every<PropPresence<DismissibleComponents, 'onDismiss'>, true>>;
type ForbiddenProps = 'onError' | 'ref';
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
    PaymentLinkDetails: 'isDismissButtonHidden' | 'onTitleChange' | 'onUpdate';
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
export type _CapitalOfferPropsDoNotRequireFundsRequest = Assert<
    Pick<CapitalOfferProps, never> extends Pick<CapitalOfferProps, 'onSubmit'> ? true : false
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
