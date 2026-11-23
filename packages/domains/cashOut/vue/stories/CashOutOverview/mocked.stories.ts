import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Decorator, Meta, StoryObj } from '@storybook/vue3';
import { AdyenPlatformExperience } from '@integration-components/sdk-internal';
import { ElementProps, getMySessionToken } from '@integration-components/testing/storybook-helpers';
import { cashOutOverviewMeta } from './meta';
import { CashOutOverviewElement, type CashOutOverviewExternalProps } from '../../src/CashOutOverview';
import { CASH_OUT_HANDLERS } from '../../../mocks/mock-server/cashOut';

type ElementStory<ExtraProps = object> = StoryObj<CashOutOverviewExternalProps & ExtraProps & { mockedApi?: boolean; skipDecorators?: boolean }>;
type StateGuardArgs = CashOutOverviewExternalProps & Pick<ElementProps<typeof CashOutOverviewElement>, 'compact'> & { mountIfRestricted?: boolean };

const meta: Meta<ElementProps<typeof CashOutOverviewElement>> = {
    ...cashOutOverviewMeta,
    title: 'Mocked/CashOut/CashOut Overview',
};

// Like a platform that shows the component only when getState() tells it is available, without any restriction.
// It also shows what getState() told, once it has decided whether to show the component.
const stateGuardDecorator: Decorator<StateGuardArgs> = (_story, context) =>
    defineComponent({
        setup() {
            const componentRoot = ref<HTMLElement | null>(null);
            const toldState = ref('');
            let cashOutOverview: CashOutOverviewElement | undefined;
            let requestId = 0;

            const mountIfUnrestricted = async () => {
                const currentRequestId = ++requestId;
                cashOutOverview?.unmount();
                toldState.value = '';

                const core = await AdyenPlatformExperience({ onSessionCreate: getMySessionToken as any });
                const element = new CashOutOverviewElement({ core });
                const state = await element.getState();

                if (currentRequestId !== requestId) {
                    element.unmount();
                    return;
                }

                cashOutOverview = element;
                if (state.isAvailable && (!state.restrictions.length || context.args.mountIfRestricted)) element.mount(componentRoot.value!);
                toldState.value = JSON.stringify(state);
            };

            onMounted(() => {
                watch(
                    () => [context.args.mountIfRestricted],
                    () => void mountIfUnrestricted(),
                    { immediate: true }
                );
            });

            onBeforeUnmount(() => {
                requestId++;
                cashOutOverview?.unmount();
            });

            return () =>
                h('div', [
                    h('output', { 'aria-label': 'getState() result' }, toldState.value),
                    h('div', { ref: componentRoot, class: context.args.compact ? 'compact-component-wrapper' : 'component-wrapper' }),
                ]);
        },
    });

// The most complex happy flow: multiple balance accounts, and bank accounts that can and can't receive the cashOut.
export const Default: ElementStory = {
    name: 'Default',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.withIneligibleTransferInstruments },
    },
};

// The session gives one balance account: an account holder with a single one, or a session scoped to a balance account.
export const SingleBalanceAccount: ElementStory = {
    name: 'Single balance account (or balance account session)',
    args: { mockedApi: true },
    parameters: {
        msw: {
            handlers: [...CASH_OUT_HANDLERS.singleBalanceAccount.handlers, ...CASH_OUT_HANDLERS.withIneligibleTransferInstruments.handlers],
        },
    },
};

export const SomeAvailableAmountsMissing: ElementStory = {
    name: 'Some available amounts missing',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.someAvailableAmountsMissing },
    },
};

// The available amounts loaded again, once the list of balance accounts closes, tell the selected one can cash out less.
export const AvailableAmountsChanged: ElementStory = {
    name: 'Available amounts changed',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.availableAmountsChanged },
    },
};

export const CashOutStillProcessing: ElementStory = {
    name: 'CashOut still processing',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.cashOutStillProcessing },
    },
};

export const ZeroBalance: ElementStory = {
    name: 'Unavailable - Zero balance',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.zeroBalance },
    },
};

export const NoTransferInstruments: ElementStory = {
    name: 'Unavailable - No transfer instruments',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.noInstantReachableTransferInstruments },
    },
};

export const CashOutInProgress: ElementStory = {
    name: 'Unavailable - CashOut in progress',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.cashOutInProgress },
    },
};

export const DailyLimitReached: ElementStory = {
    name: 'Unavailable - Daily limit reached',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.dailyLimitReached },
    },
};

export const SendToBalanceAccountNotAllowed: ElementStory = {
    name: 'Unavailable - Send to balance account not allowed',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.sendToBalanceAccountNotAllowed },
    },
};

export const ReceiveFromBalanceAccountNotAllowed: ElementStory = {
    name: 'Unavailable - Receive from balance account not allowed',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.receiveFromBalanceAccountNotAllowed },
    },
};

export const SendToTransferInstrumentNotAllowed: ElementStory = {
    name: 'Unavailable - Send to transfer instrument not allowed',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.sendToTransferInstrumentNotAllowed },
    },
};

export const RiskRestriction: ElementStory = {
    name: 'Unavailable - Risk restriction',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.riskRestricted },
    },
};

export const CashOutNotConfigured: ElementStory = {
    name: 'Unavailable - CashOut not configured',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.cashOutNotConfigured },
    },
};

// Without the role to instruct a cashOut, the request in the modal shows the cashOut without "Cash out now".
export const ViewOnly: ElementStory = {
    name: 'View only - Role not assigned',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.instructRoleNotAssigned },
    },
};

// The fees load in the request modal, so this error shows once "Start instant CashOut" is clicked.
export const FeesError: ElementStory = {
    name: 'Error - Fees',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.feesInternalServerError },
    },
};

export const CashOutError: ElementStory = {
    name: 'Error - Cash out',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.instructInternalServerError },
    },
};

export const EligibilityError: ElementStory = {
    name: 'Error - Eligibility',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.eligibilityInternalServerError },
    },
};

export const BalanceAccountsError: ElementStory = {
    name: 'Error - Balance accounts',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.balanceAccountsInternalServerError },
    },
};

// From 10 balance accounts, their dropdown can be searched.
export const ManyBalanceAccounts: ElementStory = {
    name: 'Many balance accounts',
    args: { mockedApi: true },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.manyBalanceAccounts },
    },
};

export const StateWithoutRestrictions: ElementStory<{ mountIfRestricted: boolean }> = {
    name: 'State - Without restrictions',
    args: { mockedApi: true, skipDecorators: true, mountIfRestricted: false },
    decorators: [stateGuardDecorator],
};

export const StateRestricted: ElementStory<{ mountIfRestricted: boolean }> = {
    name: 'State - Restricted',
    args: { mockedApi: true, skipDecorators: true, mountIfRestricted: false },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.stateRestricted },
    },
    decorators: [stateGuardDecorator],
};

// getState() asks for the balance account of the session, whose account holder the API tells the state of.
export const StateBalanceAccountSession: ElementStory<{ mountIfRestricted: boolean }> = {
    name: 'State - Balance account session',
    args: { mockedApi: true, skipDecorators: true, mountIfRestricted: false },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.singleBalanceAccount },
    },
    decorators: [stateGuardDecorator],
};

// The state can't be told, so getState() tells the component isn't available.
export const StateError: ElementStory<{ mountIfRestricted: boolean }> = {
    name: 'State - Error',
    args: { mockedApi: true, skipDecorators: true, mountIfRestricted: false },
    parameters: {
        msw: { ...CASH_OUT_HANDLERS.stateInternalServerError },
    },
    decorators: [stateGuardDecorator],
};

export default meta;
