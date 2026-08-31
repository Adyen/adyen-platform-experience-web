import { createBalanceAccounts, createConfigController, type EndpointHttpCallables } from '@integration-components/core';
import { createDomainTranslations, type CoreInstance } from '@integration-components/core/vue';
import { bindDomainComponent } from '@integration-components/domain-integration';
import {
    DISPUTES_EN_US,
    DISPUTES_PROTECTED_TRANSLATION_KEYS,
    DISPUTES_TRANSLATION_LOADERS,
    type DisputesTranslationKey,
    type DisputesTranslationLocale,
} from '@integration-components/disputes/domain';
import {
    DisputeManagementDefinition,
    DisputesOverviewDefinition,
    type DisputeManagementDomainProps,
    type DisputesDependencies,
    type DisputesRuntime,
    type DisputesRuntimeSnapshot,
} from '@integration-components/disputes/vue/definitions';
import { abortSignalForAny } from '@integration-components/utils';

const createDisputesRuntime = (
    core: CoreInstance,
    configController: ReturnType<typeof createConfigController>,
    signal: AbortSignal,
    reloadBalanceAccounts: () => void
): DisputesRuntime => {
    let wasRefreshing = configController.getSnapshot().contextValue.refreshing;
    const getSnapshot = (): DisputesRuntimeSnapshot => {
        const snapshot = configController.getSnapshot();
        const endpoints = snapshot.contextValue.endpoints;
        return {
            available: snapshot.hasPermission,
            canAccept: !!endpoints.acceptDispute,
            canDefend: !!endpoints.getApplicableDefenseDocuments && !!endpoints.defendDispute,
            refreshing: snapshot.contextValue.refreshing,
        };
    };

    return {
        acceptDispute: ({ disputePspReference, signal: requestSignal }) => {
            const endpoint = configController.getSnapshot().contextValue.endpoints.acceptDispute;
            if (!endpoint) throw new Error('Accept dispute endpoint is unavailable');
            return endpoint({ signal: abortSignalForAny([signal, requestSignal]) }, { path: { disputePspReference } });
        },
        defendDispute: ({ body, disputePspReference, signal: requestSignal }) => {
            const endpoint = configController.getSnapshot().contextValue.endpoints.defendDispute;
            if (!endpoint) throw new Error('Defend dispute endpoint is unavailable');
            type Request = Parameters<EndpointHttpCallables<'defendDispute'>>[0];
            return endpoint(
                {
                    contentType: 'multipart/form-data',
                    body: body as unknown as Request['body'],
                    signal: abortSignalForAny([signal, requestSignal]),
                },
                { path: { disputePspReference } }
            );
        },
        downloadDefenseDocument: ({ disputePspReference, documentType, signal: requestSignal }) => {
            const endpoint = configController.getSnapshot().contextValue.endpoints.downloadDefenseDocument;
            if (!endpoint) throw new Error('Download defense document endpoint is unavailable');
            return endpoint({ signal: abortSignalForAny([signal, requestSignal]) }, { path: { disputePspReference }, query: { documentType } });
        },
        getApplicableDefenseDocuments: ({ defenseReason, disputePspReference, signal: requestSignal }) => {
            const endpoint = configController.getSnapshot().contextValue.endpoints.getApplicableDefenseDocuments;
            if (!endpoint) throw new Error('Applicable defense documents endpoint is unavailable');
            return endpoint({ signal: abortSignalForAny([signal, requestSignal]) }, { path: { disputePspReference }, query: { defenseReason } });
        },
        getDispute: ({ disputePspReference, signal: requestSignal }) => {
            const endpoint = configController.getSnapshot().contextValue.endpoints.getDisputeDetail;
            if (!endpoint) throw new Error('Dispute details endpoint is unavailable');
            return endpoint({ signal: abortSignalForAny([signal, requestSignal]) }, { path: { disputePspReference } });
        },
        getDisputes: ({ signal: requestSignal, ...query }) => {
            const endpoint = configController.getSnapshot().contextValue.endpoints.getDisputeList;
            if (!endpoint) throw new Error('Disputes endpoint is unavailable');
            return endpoint({ errorLevel: 'error', signal: abortSignalForAny([signal, requestSignal]) }, { query });
        },
        getDisputesConfig: async (name, fallback) => {
            if (signal.aborted) return fallback;
            const result = await core.getCdnConfig({ fallback, name, subFolder: 'disputes' });
            return signal.aborted ? fallback : result;
        },
        getSnapshot,
        refresh: () => configController.getSnapshot().contextValue.refresh(),
        subscribe: listener =>
            configController.connect(() => {
                const snapshot = getSnapshot();
                if (wasRefreshing && !snapshot.refreshing) reloadBalanceAccounts();
                wasRefreshing = snapshot.refreshing;
                listener(snapshot);
            }),
    };
};

const createDisputesBinding = async (core: CoreInstance, component: 'disputes' | 'disputesManagement', signal: AbortSignal) => {
    const configController = createConfigController(core.session, component);
    const translationBinding = await createDomainTranslations<DisputesTranslationKey, DisputesTranslationLocale>({
        core,
        domain: 'disputes',
        loaders: DISPUTES_TRANSLATION_LOADERS,
        protectedKeys: DISPUTES_PROTECTED_TRANSLATION_KEYS,
        signal,
        source: DISPUTES_EN_US,
    });
    const balanceAccounts = createBalanceAccounts(configController, signal);
    const dependencies: DisputesDependencies = {
        balanceAccounts,
        runtime: createDisputesRuntime(core, configController, signal, balanceAccounts.reload),
        translations: {
            ...translationBinding.translations,
            i18n: translationBinding.translations.i18n as DisputesDependencies['translations']['i18n'],
        },
    };
    return { dependencies, dispose: translationBinding.dispose };
};

export const bindDisputesOverview = (core: CoreInstance) =>
    bindDomainComponent(DisputesOverviewDefinition, ({ signal }) => createDisputesBinding(core, 'disputes', signal));

export const createDisputeManagementHandle = (core: CoreInstance, props: DisputeManagementDomainProps) =>
    bindDomainComponent(DisputeManagementDefinition, ({ signal }) => createDisputesBinding(core, 'disputesManagement', signal)).create(props);
