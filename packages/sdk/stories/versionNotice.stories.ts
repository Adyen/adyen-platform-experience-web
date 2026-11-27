import type { Meta } from '@storybook/vue3';
import { defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue';
import { Core } from '@integration-components/core';
import { getMySessionToken, type ElementProps, type ElementStory } from '@integration-components/testing/storybook-helpers';
import { PayoutsOverviewElement } from '../../domains/payouts/vue/src';
import { TransactionsOverviewElement, type TransactionsOverviewExternalProps } from '../../domains/transactions/vue/src';
import { VERSION_NOTICE_HANDLERS } from '../../../mocks/mock-server/versionNotice';

/** Mounts two components on one Core, the way a platform page usually does. */
const TwoComponentsOnOneCore = defineComponent({
    name: 'TwoComponentsOnOneCore',
    setup() {
        const transactionsRoot = ref<HTMLElement | null>(null);
        const payoutsRoot = ref<HTMLElement | null>(null);
        let elements: { unmount: () => unknown }[] = [];

        onMounted(async () => {
            const core = await new Core({ environment: 'test', locale: 'en-US', onSessionCreate: () => getMySessionToken() }).initialize();
            const transactions = new TransactionsOverviewElement({ core });
            const payouts = new PayoutsOverviewElement({ core });

            transactions.mount(transactionsRoot.value!);
            payouts.mount(payoutsRoot.value!);
            elements = [transactions, payouts];
        });

        onBeforeUnmount(() => elements.forEach(element => element.unmount()));

        return () =>
            h('div', { style: { display: 'grid', gap: '32px' } }, [
                h('div', { ref: transactionsRoot, class: 'component-wrapper' }),
                h('div', { ref: payoutsRoot, class: 'component-wrapper' }),
            ]);
    },
});

const meta: Meta<ElementProps<TransactionsOverviewExternalProps>> = {
    title: 'SDK/Version notice',
    args: {
        component: TransactionsOverviewElement,
        mockedApi: true,
    },
};

export default meta;

/**
 * Any mocked component works here. Every component shows the notice from the shared provider, outside the live
 * environment. A dismissed notice stays hidden until local storage is cleared.
 */
export const Deprecated: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Deprecated version',
    parameters: {
        msw: VERSION_NOTICE_HANDLERS.deprecated,
    },
};

/**
 * Two components share one Core: the registry is queried once, both show the notice, and closing either hides both.
 */
export const TwoComponents: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Deprecated version - two components',
    parameters: {
        msw: VERSION_NOTICE_HANDLERS.deprecated,
    },
    render: () => ({ components: { TwoComponentsOnOneCore }, template: '<TwoComponentsOnOneCore />' }),
};

/**
 * Only shows a notice when Storybook runs a prerelease build, because stable versions are never outdated.
 */
export const NewerPrerelease: ElementStory<TransactionsOverviewExternalProps> = {
    name: 'Newer pre-release available',
    parameters: {
        msw: VERSION_NOTICE_HANDLERS.newerPrerelease,
    },
};
