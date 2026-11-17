import { ElementProps, getMySessionToken } from '@integration-components/testing/storybook-helpers';
import { AdyenPlatformExperience } from '@integration-components/sdk-internal';
import { capitalOverviewMeta } from './meta';
import { capitalOverviewHandlers } from '../../../mocks/mock-server';
import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Decorator, Meta, StoryObj } from '@storybook/vue3';
import { CapitalOverviewElement, type CapitalOverviewExternalProps } from '../../src/CapitalOverview';
import type { ExternalCapitalState } from '@integration-components/capital/domain';

type ElementStory<ExtraProps = object> = StoryObj<CapitalOverviewExternalProps & ExtraProps & { mockedApi?: boolean; skipDecorators?: boolean }>;
type ConditionalMountFlag = 'mountIfInUnsupportedRegion' | 'mountIfIneligible';
type ConditionalMountArgs = CapitalOverviewExternalProps &
    Pick<ElementProps<typeof CapitalOverviewElement>, 'compact'> &
    Partial<Record<ConditionalMountFlag, boolean>>;
type GuardedCapitalState = 'isInUnsupportedRegion' | 'isUnqualified';

const isGuardedCapitalState = (capitalState: ExternalCapitalState, guardedState: GuardedCapitalState): boolean => {
    if (!capitalState.isAvailable) return false;
    if (guardedState === 'isInUnsupportedRegion') return !capitalState.isRegionSupported;
    return capitalState.isRegionSupported && !capitalState.hasGrants && !capitalState.dynamicOfferConfig;
};

const meta: Meta<ElementProps<typeof CapitalOverviewElement>> = {
    ...capitalOverviewMeta,
    title: 'Mocked/Capital/Capital Overview',
};

const createConditionalMountDecorator = (guardedState: GuardedCapitalState, mountIfFlag: ConditionalMountFlag): Decorator<ConditionalMountArgs> => {
    return (_story, context) =>
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
                    });
                    const capitalState = await element.getState();

                    if (currentRequestId !== requestId) {
                        element.unmount();
                        return;
                    }

                    capitalOverview = element;
                    if (!isGuardedCapitalState(capitalState, guardedState) || context.args[mountIfFlag]) {
                        element.mount(componentRoot.value!);
                    }
                };

                onMounted(() => {
                    watch(
                        () => [context.args[mountIfFlag]],
                        () => void mountCapitalOverview(),
                        { immediate: true }
                    );
                });

                onBeforeUnmount(() => {
                    requestId++;
                    capitalOverview?.unmount();
                });

                return () => h('div', { ref: componentRoot, class: context.args.compact ? 'compact-component-wrapper' : 'component-wrapper' });
            },
        });
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
    decorators: [createConditionalMountDecorator('isInUnsupportedRegion', 'mountIfInUnsupportedRegion')],
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
    decorators: [createConditionalMountDecorator('isUnqualified', 'mountIfIneligible')],
};

export const FirstTimeEligibleLoan: ElementStory<typeof CapitalOverviewElement> = {
    name: 'First-time eligible - Loan',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.firstTimeEligibleLoan,
        },
    },
};

export const FirstTimeEligibleCashAdvance: ElementStory<typeof CapitalOverviewElement> = {
    name: 'First-time eligible - Cash advance',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.firstTimeEligibleCashAdvance,
        },
    },
};

export const EarlyRenewalLoan: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Early renewal - Loan',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.earlyRenewalLoan,
        },
    },
};

export const EarlyRenewalCashAdvance: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Early renewal - Cash advance',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.earlyRenewalCashAdvance,
        },
    },
};

export const EligibleLoan: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Eligible - Loan',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.eligibleLoan,
        },
    },
};

export const EligibleCashAdvance: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Eligible - Cash advance',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.eligibleCashAdvance,
        },
    },
};

export const GrantsLoan: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Grants - Loan',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.grantsLoan,
        },
    },
};

export const GrantsCashAdvance: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Grants - Cash advance',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.grantsCashAdvance,
        },
    },
};

export const PendingLoan: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Pending - Loan',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.pendingLoan,
        },
    },
};

export const PendingCashAdvance: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Pending - Cash advance',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.pendingCashAdvance,
        },
    },
};

export const ActionsLoan: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Actions - Loan',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.actionsLoan,
        },
    },
};

export const ActionsCashAdvance: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Actions - Cash advance',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.actionsCashAdvance,
        },
    },
};

export const SingleActionLoan: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Single action - Loan',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.singleActionLoan,
        },
    },
};

export const SingleActionCashAdvance: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Single action - Cash advance',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.singleActionCashAdvance,
        },
    },
};

export const HostedActionsLoan: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Hosted actions - Loan',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.hostedActionsLoan,
        },
    },
};

export const HostedActionsCashAdvance: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Hosted actions - Cash advance',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.hostedActionsCashAdvance,
        },
    },
};

export const SingleHostedActionLoan: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Single hosted action - Loan',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.singleHostedActionLoan,
        },
    },
};

export const SingleHostedActionCashAdvance: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Single hosted action cash advance',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.singleHostedActionCashAdvance,
        },
    },
};

export const RepaymentUS: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Repayment US',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.repaymentUS,
        },
    },
};

export const RepaymentWithoutTransferInstruments: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Repayment without transfer instruments',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.repaymentWithoutTransferInstruments,
        },
    },
};

export const WithoutRepayment: ElementStory<typeof CapitalOverviewElement> = {
    name: 'Without repayment',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            handlers: capitalOverviewHandlers.withoutRepayment,
        },
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
