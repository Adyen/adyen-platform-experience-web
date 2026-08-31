import type { App } from 'vue';
import type { IBalanceAccountBase } from '@integration-components/types';
import type { EndpointData } from '@integration-components/types/api/endpoints';
import type { IDisputeReasonCategory, IDisputeStatusGroup } from '@integration-components/types/api/models/disputes';
import type {
    DISPUTE_PAYMENT_SCHEMES,
    DisputeManagementProps,
    DisputesOverviewProps,
    DisputesTranslationKey,
    TranslationConfigItem,
} from '../../../domain/src';

export type DisputesOverviewDomainProps = Omit<DisputesOverviewProps, 'ref'>;
export type DisputeManagementDomainProps = Omit<DisputeManagementProps, 'ref'>;
export type DisputeManagementRenderMode = 'modal' | 'standalone';

export type DisputesTranslationOptions = Readonly<{
    count?: number;
    values?: Record<string, unknown> | ((placeholder: string, index: number, repetitionIndex: number) => unknown);
}>;

export interface DisputesI18n {
    amount(amount: number, currencyCode: string, options?: Record<string, unknown>): string;
    date(date: number | string | Date, options?: Intl.DateTimeFormatOptions): string;
    fullDate(date: number | string | Date): string;
    get(key: DisputesTranslationKey, options?: DisputesTranslationOptions): string;
    has(key: string, options?: DisputesTranslationOptions): key is DisputesTranslationKey;
    readonly locale: string;
    timezone?: string;
}

export interface DisputesTranslations {
    configure(app: App): void;
    i18n: DisputesI18n;
    provideOverrides(): void;
}

export type DisputesRuntimeSnapshot = Readonly<{
    available?: boolean;
    canAccept: boolean;
    canDefend: boolean;
    refreshing: boolean;
}>;

export type DisputesBalanceAccountsSnapshot = Readonly<{
    accounts?: readonly IBalanceAccountBase[];
    error?: Error;
    loading: boolean;
}>;

export interface DisputesBalanceAccounts {
    getSnapshot(): DisputesBalanceAccountsSnapshot;
    subscribe(listener: (snapshot: DisputesBalanceAccountsSnapshot) => void): () => void;
}

export type DisputesListRequest = Readonly<{
    balanceAccountId?: string;
    createdSince?: string;
    createdUntil?: string;
    cursor?: string;
    limit: number;
    reasonCategories?: IDisputeReasonCategory[];
    schemeCodes?: (keyof typeof DISPUTE_PAYMENT_SCHEMES)[];
    signal: AbortSignal;
    statusGroup: IDisputeStatusGroup;
}>;

export type DisputeDetailsRequest = Readonly<{
    disputePspReference: string;
    signal: AbortSignal;
}>;

export type DisputeOperationRequest = DisputeDetailsRequest;

export type ApplicableDefenseDocumentsRequest = DisputeDetailsRequest &
    Readonly<{
        defenseReason: string;
    }>;

export type DefendDisputeRequest = DisputeDetailsRequest &
    Readonly<{
        body: FormData;
    }>;

export type DownloadDefenseDocumentRequest = DisputeDetailsRequest &
    Readonly<{
        documentType: string;
    }>;

export interface DisputesRuntime {
    acceptDispute(request: DisputeOperationRequest): Promise<EndpointData<'acceptDispute'>>;
    defendDispute(request: DefendDisputeRequest): Promise<EndpointData<'defendDispute'>>;
    downloadDefenseDocument(request: DownloadDefenseDocumentRequest): Promise<EndpointData<'downloadDefenseDocument'>>;
    getApplicableDefenseDocuments(request: ApplicableDefenseDocumentsRequest): Promise<EndpointData<'getApplicableDefenseDocuments'>>;
    getDispute(request: DisputeDetailsRequest): Promise<EndpointData<'getDisputeDetail'>>;
    getDisputes(request: DisputesListRequest): Promise<EndpointData<'getDisputeList'>>;
    getDisputesConfig(
        name: 'defenseDocumentConfig' | 'defenseReasonConfig',
        fallback: Record<string, TranslationConfigItem>
    ): Promise<Record<string, TranslationConfigItem>>;
    getSnapshot(): DisputesRuntimeSnapshot;
    refresh(): void | Promise<void>;
    subscribe(listener: (snapshot: DisputesRuntimeSnapshot) => void): () => void;
}

export type DisputesDependencies = Readonly<{
    balanceAccounts: DisputesBalanceAccounts;
    runtime: DisputesRuntime;
    translations: DisputesTranslations;
}>;

type DisputesContextRuntime = DisputesRuntimeSnapshot &
    Pick<
        DisputesRuntime,
        | 'acceptDispute'
        | 'defendDispute'
        | 'downloadDefenseDocument'
        | 'getApplicableDefenseDocuments'
        | 'getDispute'
        | 'getDisputes'
        | 'getDisputesConfig'
        | 'refresh'
    >;

export type DisputesContextValue = Readonly<{
    balanceAccounts: DisputesBalanceAccountsSnapshot;
    i18n: DisputesI18n;
    provideTranslationOverrides(): void;
    runtime: DisputesContextRuntime;
}>;
