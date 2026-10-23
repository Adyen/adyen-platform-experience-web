/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import type { ICashOutEligibility, ICashOutUnavailableReason } from '@integration-components/types';
import UnavailableReasonAlert from './UnavailableReasonAlert.vue';

const REACH_OUT = 'cashOut.common.actions.contactSupport.labels.reachOut';
const NOT_ALLOWED = 'cashOut.common.unavailableReasons.notAllowed';

vi.mock('@adyen/bento-vue3', async () => {
    const { h } = await import('vue');
    type Slots = { slots: Record<string, (() => unknown) | undefined> };

    return {
        BentoAlert: (_: unknown, { slots }: Slots) =>
            h('div', { 'data-testid': 'alert' }, [h('p', { 'data-testid': 'message' }, slots.description?.() as never), slots.actions?.() as never]),
        BentoButton: (props: { onClick?: () => void }, { slots }: Slots) => h('button', { onClick: props.onClick }, slots.default?.() as never),
    };
});

vi.mock('@integration-components/core/vue', () => ({
    useCoreContext: vi.fn(),
}));

const eligibilityOf = (isCashoutAvailable: boolean, unavailableReasons: string[] = []) =>
    ({ isCashoutAvailable, unavailableReasons }) as unknown as ICashOutEligibility;

const renderAlert = (eligibility: ICashOutEligibility, onContactSupport?: () => void) => {
    const target = document.createElement('div');
    const app = createApp(UnavailableReasonAlert, { eligibility, onContactSupport });
    app.mount(target);

    const message = () => target.querySelector('[data-testid="message"]')?.textContent;
    const reachOutButton = () => [...target.querySelectorAll('button')].find(button => button.textContent === REACH_OUT);

    return { message, reachOutButton, target, unmount: () => app.unmount() };
};

describe('UnavailableReasonAlert', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoreContext).mockReturnValue({ i18n: { get: (key: string) => key } } as unknown as ReturnType<typeof useCoreContext>);
    });

    test.each<[ICashOutUnavailableReason, string, boolean]>([
        ['noInstantReachableTransferInstruments', 'cashOut.common.unavailableReasons.noInstantReachableTransferInstruments', false],
        ['cashOutInProgress', 'cashOut.common.unavailableReasons.cashOutInProgress', false],
        ['dailyLimitReached', 'cashOut.common.unavailableReasons.dailyLimitReached', false],
        ['sendToBalanceAccountNotAllowed', NOT_ALLOWED, true],
        ['receiveFromBalanceAccountNotAllowed', NOT_ALLOWED, true],
        ['riskRestricted', 'cashOut.common.unavailableReasons.riskRestricted', false],
        ['cashOutNotConfigured', NOT_ALLOWED, true],
    ])('should explain %s, offering contact support only when support can help', (reason, expectedMessage, offersContactSupport) => {
        const { message, reachOutButton, unmount } = renderAlert(eligibilityOf(false, [reason]), vi.fn());

        expect(message()).toBe(expectedMessage);
        expect(!!reachOutButton()).toBe(offersContactSupport);

        unmount();
    });

    test('should not show an alert for a zero balance, which already shows as an amount of 0', () => {
        const { target, unmount } = renderAlert(eligibilityOf(false, ['zeroBalance']), vi.fn());

        expect(target.querySelector('[data-testid="alert"]')).toBeNull();

        unmount();
    });

    test('should not show an alert while cashOut is available', () => {
        const { target, unmount } = renderAlert(eligibilityOf(true), vi.fn());

        expect(target.querySelector('[data-testid="alert"]')).toBeNull();

        unmount();
    });

    test.each([
        ['without a reason', []],
        ['for a reason the component does not know yet', ['reasonAddedLater']],
    ])('should show the generic message %s', (_, reasons) => {
        const { message, unmount } = renderAlert(eligibilityOf(false, reasons));

        expect(message()).toBe(NOT_ALLOWED);

        unmount();
    });

    test('should call onContactSupport when the reach out button is clicked', () => {
        const onContactSupport = vi.fn();
        const { reachOutButton, unmount } = renderAlert(eligibilityOf(false, ['cashOutNotConfigured']), onContactSupport);

        reachOutButton()?.click();

        expect(onContactSupport).toHaveBeenCalledTimes(1);

        unmount();
    });

    test('should not offer contact support without an onContactSupport callback', () => {
        const { message, reachOutButton, unmount } = renderAlert(eligibilityOf(false, ['cashOutNotConfigured']));

        expect(message()).toBe(NOT_ALLOWED);
        expect(reachOutButton()).toBeUndefined();

        unmount();
    });
});
