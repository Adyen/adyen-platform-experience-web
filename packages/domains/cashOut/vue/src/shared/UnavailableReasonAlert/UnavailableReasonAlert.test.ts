/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp } from 'vue';
import { useCoreContext } from '@integration-components/core/vue';
import type { ICashOutEligibility, ICashOutUnavailableReason } from '@integration-components/types';
import UnavailableReasonAlert from './UnavailableReasonAlert.vue';

const REACH_OUT = 'cashOut.common.contactSupport.label';
const NOT_ALLOWED = 'cashOut.common.unavailableReasons.notAllowed';
const NOT_ALLOWED_WITH_CONTACT_SUPPORT = 'cashOut.common.unavailableReasons.notAllowedWithContactSupport';

vi.mock('@adyen/bento-vue3', async () => {
    const { h } = await import('vue');
    type Slots = { slots: Record<string, (() => unknown) | undefined> };

    return {
        // Like Bento's, the actions go in their own element, which a tip alert puts beside the message.
        BentoAlert: (props: { type?: string; variant?: string }, { slots }: Slots) =>
            h('div', { 'data-testid': 'alert', 'data-type': props.type, 'data-variant': props.variant }, [
                h('p', { 'data-testid': 'message' }, slots.description?.() as never),
                h('div', { 'data-testid': 'actions' }, slots.actions?.() as never),
            ]),
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

    // The message without the reach out button, which is shown with it
    const message = () => target.querySelector('[data-testid="message"] span')?.textContent;
    const alert = () => target.querySelector('[data-testid="alert"]');
    const reachOutButton = () => [...target.querySelectorAll('button')].find(button => button.textContent === REACH_OUT);

    return { alert, message, reachOutButton, target, unmount: () => app.unmount() };
};

describe('UnavailableReasonAlert', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useCoreContext).mockReturnValue({ i18n: { get: (key: string) => key } } as unknown as ReturnType<typeof useCoreContext>);
    });

    test.each<[ICashOutUnavailableReason, string, boolean]>([
        ['dailyLimitReached', 'cashOut.common.unavailableReasons.dailyLimitReached', false],
        ['cashOutNotConfigured', NOT_ALLOWED_WITH_CONTACT_SUPPORT, true],
    ])('should explain %s, offering contact support only when support can help', (reason, expectedMessage, offersContactSupport) => {
        const { message, reachOutButton, unmount } = renderAlert(eligibilityOf(false, [reason]), vi.fn());

        expect(message()).toBe(expectedMessage);
        expect(!!reachOutButton()).toBe(offersContactSupport);

        unmount();
    });

    test.each<[ICashOutUnavailableReason, string]>([
        ['dailyLimitReached', 'highlight'],
        ['cashOutInProgress', 'highlight'],
        ['riskRestricted', 'warning'],
        ['cashOutNotConfigured', 'warning'],
    ])('should show %s as a compact %s alert', (reason, type) => {
        const { alert, unmount } = renderAlert(eligibilityOf(false, [reason]));

        expect(alert()?.getAttribute('data-type')).toBe(type);
        expect(alert()?.getAttribute('data-variant')).toBe('tip');

        unmount();
    });

    // The reach out button already offers it
    test('should not ask to contact support in the message when the reach out button is shown', () => {
        const { message, reachOutButton, unmount } = renderAlert(eligibilityOf(false, ['cashOutNotConfigured']), vi.fn());

        expect(reachOutButton()).toBeDefined();
        expect(message()).toBe(NOT_ALLOWED_WITH_CONTACT_SUPPORT);

        unmount();
    });

    // A tip alert puts its actions beside the message, so the reach out button goes under the message instead, keeping the
    // compact alert and its text size
    test('should keep the compact alert when offering contact support', () => {
        const { alert, reachOutButton, unmount } = renderAlert(eligibilityOf(false, ['cashOutNotConfigured']), vi.fn());

        expect(reachOutButton()).toBeDefined();
        expect(alert()?.getAttribute('data-type')).toBe('warning');
        expect(alert()?.getAttribute('data-variant')).toBe('tip');

        unmount();
    });

    test('should put the reach out button with the message, not in the actions a tip alert shows beside it', () => {
        const { reachOutButton, target, unmount } = renderAlert(eligibilityOf(false, ['cashOutNotConfigured']), vi.fn());

        expect(target.querySelector('[data-testid="message"]')?.contains(reachOutButton()!)).toBe(true);
        expect(target.querySelector('[data-testid="actions"]')?.children).toHaveLength(0);

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
