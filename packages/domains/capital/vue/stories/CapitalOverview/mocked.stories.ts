import { ElementProps, getMySessionToken } from '@integration-components/testing/storybook-helpers';
import { AdyenPlatformExperience } from '@integration-components/sdk-internal';
import { CapitalOverviewMeta } from './meta';
import { capitalOverviewHandlers } from '../../../mocks/mock-server';
import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import { CapitalOverviewElement, type CapitalOverviewExternalProps } from '../../src/CapitalOverview';

type ElementStory<ExtraProps = object> = StoryObj<CapitalOverviewExternalProps & ExtraProps & { mockedApi?: boolean; skipDecorators?: boolean }>;

const meta: Meta<ElementProps<typeof CapitalOverviewElement>> = {
    ...CapitalOverviewMeta,
    title: 'Mocked/Capital/Capital Overview',
};

export const UnsupportedRegion: ElementStory<{ mountIfInUnsupportedRegion: boolean }> = {
    name: 'Unsupported region',
    args: {
        mockedApi: true,
        skipDecorators: true,
        mountIfInUnsupportedRegion: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.unsupportedRegion,
        },
    },
    decorators: [
        (_story, context) =>
            defineComponent({
                setup() {
                    const componentRoot = ref<HTMLElement | null>(null);
                    let capitalOverview: CapitalOverviewElement | undefined;
                    let requestId = 0;

                    const mountCapitalOverview = async () => {
                        const currentRequestId = ++requestId;
                        capitalOverview?.unmount();

                        const core = await AdyenPlatformExperience({
                            onSessionCreate: getMySessionToken as any,
                        });
                        const element = new CapitalOverviewElement({
                            core,
                            hideTitle: context.args.hideTitle,
                        });
                        const { state } = await element.getState();

                        if (currentRequestId !== requestId) {
                            element.unmount();
                            return;
                        }

                        capitalOverview = element;
                        if (state !== 'isInUnsupportedRegion' || context.args.mountIfInUnsupportedRegion) {
                            element.mount(componentRoot.value!);
                        }
                    };

                    onMounted(() => {
                        watch(
                            () => [context.args.hideTitle, context.args.mountIfInUnsupportedRegion],
                            () => void mountCapitalOverview(),
                            { immediate: true }
                        );
                    });

                    onBeforeUnmount(() => {
                        requestId++;
                        capitalOverview?.unmount();
                    });

                    return () => h('div', { ref: componentRoot, class: 'component-wrapper' });
                },
            }),
    ],
};

export const Ineligible: ElementStory<{ mountIfIneligible: boolean }> = {
    name: 'Ineligible',
    args: {
        mockedApi: true,
        skipDecorators: true,
        mountIfIneligible: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.ineligible,
        },
    },
    decorators: [
        (_story, context) =>
            defineComponent({
                setup() {
                    const componentRoot = ref<HTMLElement | null>(null);
                    let capitalOverview: CapitalOverviewElement | undefined;
                    let requestId = 0;

                    const mountCapitalOverview = async () => {
                        const currentRequestId = ++requestId;
                        capitalOverview?.unmount();

                        const core = await AdyenPlatformExperience({
                            onSessionCreate: getMySessionToken as any,
                        });
                        const element = new CapitalOverviewElement({
                            core,
                            hideTitle: context.args.hideTitle,
                        });
                        const { state } = await element.getState();

                        if (currentRequestId !== requestId) {
                            element.unmount();
                            return;
                        }

                        capitalOverview = element;
                        if (state !== 'isUnqualified' || context.args.mountIfIneligible) {
                            element.mount(componentRoot.value!);
                        }
                    };

                    onMounted(() => {
                        watch(
                            () => [context.args.hideTitle, context.args.mountIfIneligible],
                            () => void mountCapitalOverview(),
                            { immediate: true }
                        );
                    });

                    onBeforeUnmount(() => {
                        requestId++;
                        capitalOverview?.unmount();
                    });

                    return () => h('div', { ref: componentRoot, class: 'component-wrapper' });
                },
            }),
    ],
};

export const FirstTimeEligible: ElementStory<typeof CapitalOverviewElement> = {
    name: 'First-time eligible',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.firstTimeEligible,
        },
    },
};

export const EarlyRenewal: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Early renewal',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.earlyRenewal,
    },
};

export const Eligible: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Eligible',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.eligible,
    },
};

export const Grants: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Grants',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.grants,
    },
};

export const Pending: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Pending',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.pending,
    },
};

export const MultipleActions: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Multiple actions',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.multipleActions,
    },
};

export const SingleAction: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Single action',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.singleAction,
    },
};

export const MultipleHostedActions: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Multiple hosted actions',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.multipleHostedActions,
    },
};

export const SingleHostedAction: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Single hosted action',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.singleHostedAction,
    },
};

export const RepaymentNL: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Repayment NL',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.repaymentNL,
    },
};

export const RepaymentGB: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Repayment GB',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.repaymentGB,
    },
};

export const RepaymentUS: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Repayment US',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.repaymentUS,
    },
};

export const RepaymentWithoutTransferInstruments: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Repayment without transfer instruments',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: capitalOverviewHandlers.repaymentWithoutTransferInstruments,
    },
};

export const ErrorOfferConfig: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Error - Offer config',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.errorOfferConfig,
        },
    },
};

export const ErrorAccountHolder: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Error - Account holder',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.errorAccountHolder,
        },
    },
};

export const ErrorOnboardingConfig: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Error - Onboarding config',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.errorOnboardingConfig,
        },
    },
};

export const ErrorHostedAction: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Error - Hosted action',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.errorHostedAction,
        },
    },
};

export default meta;
