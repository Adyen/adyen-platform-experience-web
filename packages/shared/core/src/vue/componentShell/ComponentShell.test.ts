/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from 'vitest';
import { createApp, h, type App, type VNode } from 'vue';
import { useCoreContext } from '../Context';
import { ComponentShell } from './ComponentShell';

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

vi.mock('../Context', () => ({
    useCoreContext: vi.fn(),
}));

const CONTENT_TEST_ID = 'shell-content';
const SKELETON_TEST_ID = 'domain-skeleton';

const setCoreContext = () => {
    vi.mocked(useCoreContext).mockReturnValue({
        i18n: { get: vi.fn((key: string) => key) },
        translationDomain: 'transactions',
        getImageAsset: vi.fn(() => 'error.svg'),
    } as unknown as ReturnType<typeof useCoreContext>);
};

describe('ComponentShell', () => {
    let mounted: Array<{ app: App; target: HTMLDivElement }> = [];

    afterEach(() => {
        mounted.forEach(({ app, target }) => {
            app.unmount();
            target.remove();
        });
        mounted = [];
    });

    const mountShell = (props: Record<string, unknown>, slots: Record<string, () => VNode> = {}) => {
        const target = document.createElement('div');
        const app = createApp({
            setup: () => () => h(ComponentShell, props, { default: () => h('div', { 'data-testid': CONTENT_TEST_ID }, 'content'), ...slots }),
        });
        app.mount(target);
        mounted.push({ app, target });
        return target;
    };

    test('renders the slot content when ready', () => {
        setCoreContext();

        const target = mountShell({ state: 'ready' });

        expect(target.querySelector(`[data-testid="${CONTENT_TEST_ID}"]`)).toBeTruthy();
    });

    test('renders no chrome of its own around the content, since the component owns its heading', () => {
        setCoreContext();

        const target = mountShell({ state: 'ready' });

        expect(target.textContent).toBe('content');
    });

    test('renders the loading indicator instead of the content when loading', () => {
        setCoreContext();

        const target = mountShell({ state: 'loading' });
        const loading = target.querySelector('[data-testid="loading-indicator"]');

        expect(loading).toBeTruthy();
        expect(target.querySelector(`[data-testid="${CONTENT_TEST_ID}"]`)).toBeNull();
    });

    test('flags the loading wrapper as busy, since the Bento spinner is hidden from assistive tech', () => {
        setCoreContext();

        const target = mountShell({ state: 'loading' });
        const loading = target.querySelector('[data-testid="loading-indicator"]');

        expect(loading?.getAttribute('aria-hidden')).toBe('true');
        expect(loading?.parentElement?.getAttribute('aria-busy')).toBe('true');
    });

    test('renders the loading slot instead of the spinner, so a component can show its own skeleton', () => {
        setCoreContext();

        const target = mountShell({ state: 'loading' }, { loading: () => h('div', { 'data-testid': SKELETON_TEST_ID }) });

        expect(target.querySelector(`[data-testid="${SKELETON_TEST_ID}"]`)).toBeTruthy();
        expect(target.querySelector('[data-testid="loading-indicator"]')).toBeNull();
        expect(target.querySelector(`[data-testid="${CONTENT_TEST_ID}"]`)).toBeNull();
    });

    test('keeps the wrapper busy when the component provides its own loading content', () => {
        setCoreContext();

        const target = mountShell({ state: 'loading' }, { loading: () => h('div', { 'data-testid': SKELETON_TEST_ID }) });

        expect(target.querySelector(`[data-testid="${SKELETON_TEST_ID}"]`)?.parentElement?.getAttribute('aria-busy')).toBe('true');
    });

    test('centres the spinner but leaves a component-provided skeleton to lay itself out', () => {
        setCoreContext();

        const spinner = mountShell({ state: 'loading' }).querySelector('[data-testid="loading-indicator"]');
        const skeleton = mountShell({ state: 'loading' }, { loading: () => h('div', { 'data-testid': SKELETON_TEST_ID }) }).querySelector(
            `[data-testid="${SKELETON_TEST_ID}"]`
        );

        expect(spinner?.parentElement?.className).toBeTruthy();
        expect(skeleton?.parentElement?.className).toBe('');
    });

    test('renders the shared error message display instead of the content when in error', () => {
        setCoreContext();

        const target = mountShell({
            state: 'error',
            errorInfo: { title: 'transactions.common.errors.somethingWentWrong', messages: ['transactions.overview.errors.unavailable'] },
        });
        const errorDisplay = target.querySelector('[data-testid="error-message-display"]');

        expect(errorDisplay).toBeTruthy();
        expect(errorDisplay?.textContent).toContain('transactions.overview.errors.unavailable');
        expect(target.querySelector(`[data-testid="${CONTENT_TEST_ID}"]`)).toBeNull();
    });

    test('derives the error content from the caught error when no errorInfo is given', () => {
        setCoreContext();

        const target = mountShell({
            state: 'error',
            error: new Error('boom'),
            errorMessage: 'transactions.details.errors.unavailable',
        });

        expect(target.textContent).toContain('transactions.details.errors.unavailable');
    });

    test('forwards the dismiss and refresh actions to the shared error message display', () => {
        setCoreContext();
        const onDismiss = vi.fn();
        const onRefresh = vi.fn();

        const target = mountShell({
            state: 'error',
            error: new Error('boom'),
            errorMessage: 'transactions.details.errors.unavailable',
            dismissLabel: 'transactions.details.common.actions.goBack',
            onDismiss,
            onRefresh,
        });
        const buttons = [...target.querySelectorAll('button')];

        const dismissButton = buttons.find(button => button.textContent === 'transactions.details.common.actions.goBack');
        expect(dismissButton).toBeTruthy();
        dismissButton?.click();
        expect(onDismiss).toHaveBeenCalledOnce();

        // The error carries no code, so the display offers a refresh rather than contact support.
        const refreshButton = buttons.find(button => button.textContent?.includes('refresh'));
        refreshButton?.click();
        expect(onRefresh).toHaveBeenCalledOnce();
    });
});
