<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { type CoreInstance, type SupportedLocales, type CoreOptions } from '@integration-components/core/vue';
import type { DomainDefinition, DomainHandle } from '@integration-components/domain-integration';
import { getMySessionToken } from '@integration-components/testing/storybook-helpers';
import { Core } from '@integration-components/core';
import type { ReportsOverviewDomainProps } from '@integration-components/reports/vue/definitions';
import type { PayoutDetailsDomainProps, PayoutsOverviewDomainProps } from '@integration-components/payouts/vue/definitions';
import type { DisputeManagementDomainProps, DisputesOverviewDomainProps } from '@integration-components/disputes/vue/definitions';
import type { TransactionDetailsDomainProps, TransactionsOverviewDomainProps } from '@integration-components/transactions/vue/definitions';
import type {
    PaymentLinkCreationDomainProps,
    PaymentLinkDetailsDomainProps,
    PaymentLinkSettingsDomainProps,
    PaymentLinksOverviewDomainProps,
} from '@integration-components/payByLink/vue/definitions';
import '../../shared/styles.scss';

type StoryDefinition = DomainDefinition<Record<string, unknown>, unknown, Record<string, unknown>, Element | string>;
type StoryElement = {
    mount(target: Element | string): unknown;
    update(props: Record<string, unknown>): unknown;
    unmount(): unknown;
};
type StoryElementConstructor = new (options: Record<string, unknown> & { core: CoreInstance }) => StoryElement;
const isStoryDefinition = (component: StoryDefinition | StoryElementConstructor): component is StoryDefinition =>
    typeof component === 'object' && component !== null && 'create' in component;

const props = defineProps<{
    component: StoryDefinition | StoryElementConstructor;
    componentProps?: Record<string, any>;
    locale?: SupportedLocales;
    fontFamily?: string;
    session?: { roles: string[]; accountHolderId?: string };
    compact?: boolean;
}>();

const error = ref<string | null>(null);
const componentRoot = ref<HTMLElement | null>(null);
const isCoreReady = ref(false);

let core: CoreInstance | undefined;
let element: StoryElement | undefined;
let initialization = 0;

const componentPropsWithoutCoreOptions = computed(() => {
    const { coreOptions: _, ...rest } = props.componentProps ?? {};
    return rest;
});

async function initializeCore() {
    const currentInitialization = ++initialization;

    try {
        core = undefined;
        isCoreReady.value = false;
        error.value = null;

        const { coreOptions } = props.componentProps ?? {};

        const instance = new Core<[], Record<never, never>>({
            environment: 'test',
            locale: props.locale || 'en-US',
            onSessionCreate: (_signal: AbortSignal) => getMySessionToken(props.session),
            ...((coreOptions ?? {}) as Partial<CoreOptions>),
        });

        core = await instance.initialize();
        if (currentInitialization !== initialization) return;
        isCoreReady.value = true;

        // Setting isCoreReady schedules removal of the initializing placeholder.
        // Wait until Vue applies that update before mounting the component into componentRoot.
        await nextTick();
        if (currentInitialization !== initialization) return;

        let nextElement: StoryElement;
        if (isStoryDefinition(props.component)) {
            const [
                { ReportsOverviewDefinition },
                { PayoutDetailsDefinition, PayoutsOverviewDefinition },
                { DisputeManagementDefinition, DisputesOverviewDefinition },
                { TransactionDetailsDefinition, TransactionsOverviewDefinition },
                { PaymentLinkCreationDefinition, PaymentLinkDetailsDefinition, PaymentLinkSettingsDefinition, PaymentLinksOverviewDefinition },
                { bindReportsOverview },
                { bindPayoutsOverview, createPayoutDetailsHandle },
                { bindDisputesOverview, createDisputeManagementHandle },
                { bindTransactionsOverview, createTransactionDetailsHandle },
                { bindPaymentLinksOverview, createPaymentLinkCreationHandle, createPaymentLinkDetailsHandle, createPaymentLinkSettingsHandle },
            ] = await Promise.all([
                import('@integration-components/reports/vue/definitions'),
                import('@integration-components/payouts/vue/definitions'),
                import('@integration-components/disputes/vue/definitions'),
                import('@integration-components/transactions/vue/definitions'),
                import('@integration-components/payByLink/vue/definitions'),
                import('./internal/reports/bindReportsOverview'),
                import('./internal/payouts/bindPayouts'),
                import('./internal/disputes/bindDisputes'),
                import('./internal/transactions/bindTransactions'),
                import('./internal/payByLink/bindPayByLink'),
            ]);
            let handle: DomainHandle<Record<string, unknown>, Element | string>;
            if (props.component === (ReportsOverviewDefinition as StoryDefinition)) {
                handle = (await bindReportsOverview(core).create(
                    componentPropsWithoutCoreOptions.value as ReportsOverviewDomainProps
                )) as DomainHandle<Record<string, unknown>, Element | string>;
            } else if (props.component === (PayoutsOverviewDefinition as StoryDefinition)) {
                handle = (await bindPayoutsOverview(core).create(
                    componentPropsWithoutCoreOptions.value as PayoutsOverviewDomainProps
                )) as DomainHandle<Record<string, unknown>, Element | string>;
            } else if (props.component === (DisputesOverviewDefinition as StoryDefinition)) {
                handle = (await bindDisputesOverview(core).create(
                    componentPropsWithoutCoreOptions.value as DisputesOverviewDomainProps
                )) as DomainHandle<Record<string, unknown>, Element | string>;
            } else if (props.component === (TransactionsOverviewDefinition as StoryDefinition)) {
                handle = (await bindTransactionsOverview(core).create(
                    componentPropsWithoutCoreOptions.value as TransactionsOverviewDomainProps
                )) as DomainHandle<Record<string, unknown>, Element | string>;
            } else if (props.component === (PaymentLinksOverviewDefinition as StoryDefinition)) {
                handle = (await bindPaymentLinksOverview(core).create(
                    componentPropsWithoutCoreOptions.value as PaymentLinksOverviewDomainProps
                )) as DomainHandle<Record<string, unknown>, Element | string>;
            } else if (props.component === (PayoutDetailsDefinition as StoryDefinition)) {
                handle = (await createPayoutDetailsHandle(core, componentPropsWithoutCoreOptions.value as PayoutDetailsDomainProps)) as DomainHandle<
                    Record<string, unknown>,
                    Element | string
                >;
            } else if (props.component === (DisputeManagementDefinition as StoryDefinition)) {
                handle = (await createDisputeManagementHandle(
                    core,
                    componentPropsWithoutCoreOptions.value as DisputeManagementDomainProps
                )) as DomainHandle<Record<string, unknown>, Element | string>;
            } else if (props.component === (TransactionDetailsDefinition as StoryDefinition)) {
                handle = (await createTransactionDetailsHandle(
                    core,
                    componentPropsWithoutCoreOptions.value as TransactionDetailsDomainProps
                )) as DomainHandle<Record<string, unknown>, Element | string>;
            } else if (props.component === (PaymentLinkCreationDefinition as StoryDefinition)) {
                handle = (await createPaymentLinkCreationHandle(
                    core,
                    componentPropsWithoutCoreOptions.value as PaymentLinkCreationDomainProps
                )) as DomainHandle<Record<string, unknown>, Element | string>;
            } else if (props.component === (PaymentLinkDetailsDefinition as StoryDefinition)) {
                handle = (await createPaymentLinkDetailsHandle(
                    core,
                    componentPropsWithoutCoreOptions.value as PaymentLinkDetailsDomainProps
                )) as DomainHandle<Record<string, unknown>, Element | string>;
            } else if (props.component === (PaymentLinkSettingsDefinition as StoryDefinition)) {
                handle = (await createPaymentLinkSettingsHandle(
                    core,
                    componentPropsWithoutCoreOptions.value as PaymentLinkSettingsDomainProps
                )) as DomainHandle<Record<string, unknown>, Element | string>;
            } else {
                throw new Error('Unsupported Vue domain definition');
            }
            nextElement = {
                mount: target => handle.mount(target),
                update: nextProps => handle.update(nextProps),
                unmount: () => handle.unmount(),
            };
        } else {
            nextElement = new props.component({ ...componentPropsWithoutCoreOptions.value, core });
        }
        if (currentInitialization !== initialization) {
            await nextElement.unmount();
            return;
        }
        element = nextElement;
        try {
            await element.mount(componentRoot.value!);
        } catch (mountError) {
            element = undefined;
            try {
                await nextElement.unmount();
            } catch {
                // Preserve the mount failure after best-effort cleanup.
            }
            throw mountError;
        }
    } catch (e: any) {
        if (currentInitialization !== initialization) return;
        error.value = e?.message || 'Core initialization failed';
        console.error('Core initialization failed:', e);
    }
}

onMounted(initializeCore);

// prettier-ignore
watch(
    componentPropsWithoutCoreOptions,
    componentProps => void element?.update(componentProps),
    { deep: true }
);

onBeforeUnmount(() => {
    initialization++;
    void element?.unmount();
    element = undefined;
});
</script>

<template>
    <div ref="componentRoot" :class="compact ? 'compact-component-wrapper' : 'component-wrapper'" :style="{ fontFamily }">
        <div v-if="error" style="color: red; padding: 16px">Error: {{ error }}</div>
        <div v-else-if="!isCoreReady" style="padding: 16px; text-align: center">Initializing...</div>
    </div>
</template>
