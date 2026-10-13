/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from 'vitest';
import { createApp, h, type App, type Component, type VNode } from 'vue';
import { useConfigContext } from '../ConfigContext';
import { useCoreContext } from '../Context';
import { ComponentAvailabilityGate } from './ComponentAvailabilityGate';

vi.mock('@adyen/bento-vue3', async () => {
    const { defineComponent, h } = await import('vue');
    return {
        BentoButton: defineComponent({
            name: 'BentoButton',
            setup:
                (_props, { slots }) =>
                () =>
                    h('button', slots.default?.()),
        }),
        BentoTypography: defineComponent({
            name: 'BentoTypography',
            setup:
                (_props, { slots }) =>
                () =>
                    h('div', slots.default?.()),
        }),
        BentoLoadingIndicator: defineComponent({
            name: 'BentoLoadingIndicator',
            setup: () => () => h('div', { 'data-testid': 'loading-indicator', 'aria-hidden': 'true' }),
        }),
    };
});

vi.mock('../ConfigContext', () => ({
    useConfigContext: vi.fn(),
}));

vi.mock('../Context', () => ({
    useCoreContext: vi.fn(),
}));

const CONTENT_TEST_ID = 'gated-content';
const ERROR_DISPLAY_TEST_ID = 'error-message-display';

const i18n = { get: vi.fn((key: string) => key) };

const setContext = ({ componentUnavailable = false, permissionPending = false, translationDomain = 'transactions' } = {}) => {
    vi.mocked(useConfigContext).mockReturnValue({ componentUnavailable, permissionPending } as unknown as ReturnType<typeof useConfigContext>);
    vi.mocked(useCoreContext).mockReturnValue({
        i18n,
        translationDomain,
        getImageAsset: vi.fn(() => 'error.svg'),
    } as unknown as ReturnType<typeof useCoreContext>);
};

describe('ComponentAvailabilityGate', () => {
    let mounted: Array<{ app: App; target: HTMLDivElement }> = [];

    afterEach(() => {
        mounted.forEach(({ app, target }) => {
            app.unmount();
            target.remove();
        });
        mounted = [];
    });

    const mountWithSlot = (component: Component, props: Record<string, unknown>, slotContent?: () => VNode) => {
        const target = document.createElement('div');
        const app = createApp({
            setup: () => () => h(component, props, slotContent ? { default: slotContent } : undefined),
        });
        app.mount(target);
        mounted.push({ app, target });
        return target;
    };

    const slotContent = () => h('div', { 'data-testid': CONTENT_TEST_ID }, 'domain component');

    test('renders the shared error message display instead of the component when unavailable', () => {
        setContext({ componentUnavailable: true });

        const target = mountWithSlot(ComponentAvailabilityGate, { type: 'transactions' }, slotContent);
        const text = target.textContent ?? '';

        expect(target.querySelector(`[data-testid="${ERROR_DISPLAY_TEST_ID}"]`)).toBeTruthy();
        expect(target.querySelector(`[data-testid="${CONTENT_TEST_ID}"]`)).toBeNull();
        expect(text).toContain('transactions.common.errors.somethingWentWrong');
        expect(text).toContain('transactions.overview.errors.unavailable');
        expect(text).toContain('transactions.common.errors.contactSupport');
    });

    test('renders the error without a heading, which belongs to the component', () => {
        setContext({ componentUnavailable: true });

        const target = mountWithSlot(ComponentAvailabilityGate, { type: 'transactions' }, slotContent);

        expect(target.querySelector(`[data-testid="${ERROR_DISPLAY_TEST_ID}"]`)).toBeTruthy();
        expect(target.textContent).not.toContain('transactions.overview.title');
    });

    test('renders the shell loading state and keeps the component unmounted while the permission check is pending', () => {
        setContext({ permissionPending: true });

        const target = mountWithSlot(ComponentAvailabilityGate, { type: 'transactions' }, slotContent);

        expect(target.querySelector('[data-testid="loading-indicator"]')).toBeTruthy();
        expect(target.querySelector(`[data-testid="${CONTENT_TEST_ID}"]`)).toBeNull();
        expect(target.querySelector(`[data-testid="${ERROR_DISPLAY_TEST_ID}"]`)).toBeNull();
        expect(target.textContent).not.toContain('transactions.overview.title');
    });

    test('prefers the loading state over the error while the permission check is still pending', () => {
        setContext({ permissionPending: true, componentUnavailable: true });

        const target = mountWithSlot(ComponentAvailabilityGate, { type: 'transactions' }, slotContent);

        expect(target.querySelector('[data-testid="loading-indicator"]')).toBeTruthy();
        expect(target.querySelector(`[data-testid="${ERROR_DISPLAY_TEST_ID}"]`)).toBeNull();
    });

    test('renders the component as-is when available, so its own chrome is not doubled', () => {
        setContext({ componentUnavailable: false });

        const target = mountWithSlot(ComponentAvailabilityGate, { type: 'transactions' }, slotContent);

        expect(target.querySelector(`[data-testid="${CONTENT_TEST_ID}"]`)).toBeTruthy();
        expect(target.firstElementChild?.getAttribute('data-testid')).toBe(CONTENT_TEST_ID);
        expect(target.textContent).not.toContain('transactions.overview.title');
    });

    test('renders the component when available', () => {
        setContext({ componentUnavailable: false });

        const target = mountWithSlot(ComponentAvailabilityGate, { type: 'transactions' }, slotContent);

        expect(target.querySelector(`[data-testid="${CONTENT_TEST_ID}"]`)).toBeTruthy();
        expect(target.querySelector(`[data-testid="${ERROR_DISPLAY_TEST_ID}"]`)).toBeNull();
    });

    test('forwards onContactSupport to the error message display', () => {
        setContext({ componentUnavailable: true });
        const onContactSupport = vi.fn();

        const target = mountWithSlot(ComponentAvailabilityGate, { type: 'transactions', onContactSupport }, slotContent);
        const supportButton = target.querySelector<HTMLButtonElement>('button');

        expect(supportButton?.textContent).toBe('transactions.common.actions.contactSupport.labels.reachOut');

        supportButton?.click();
        expect(onContactSupport).toHaveBeenCalledOnce();
    });

    test('falls back to the common unavailable message when the component type is unknown', () => {
        setContext({ componentUnavailable: true, translationDomain: 'capital' });

        const target = mountWithSlot(ComponentAvailabilityGate, {}, slotContent);
        const text = target.textContent ?? '';

        expect(text).toContain('capital.common.errors.componentUnavailable');
        expect(text).toContain('capital.common.errors.contactSupport');
    });
});
