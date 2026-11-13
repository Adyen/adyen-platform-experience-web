// @vitest-environment jsdom

import { describe, expect, test, vi } from 'vitest';
import { createApp, h, type PropType } from 'vue';
import EmptyState from './EmptyState.vue';
import styles from './EmptyState.module.scss';

vi.mock('@adyen/bento-vue3', async () => {
    const { defineComponent, h } = await import('vue');
    return {
        BentoButtonActions: defineComponent({
            props: { actions: { type: Array as PropType<{ title: string }[]>, required: true } },
            setup: props => () =>
                h(
                    'div',
                    props.actions.map(action => h('button', action.title))
                ),
        }),
        BentoEmptyState: defineComponent({
            props: { title: { type: String, required: true } },
            setup:
                (props, { slots }) =>
                () =>
                    h('div', [h('h2', props.title), h('p', slots.default?.())]),
        }),
    };
});

vi.mock('@adyen/ui-assets-icons-24/vue/checkmark-circle', async () => {
    const { h } = await import('vue');
    return { default: (_: unknown, { attrs }: { attrs: Record<string, unknown> }) => h('svg', { ...attrs, 'data-icon': 'checkmark-circle' }) };
});

vi.mock('@adyen/ui-assets-icons-24/vue/cross-circle', async () => {
    const { h } = await import('vue');
    return { default: (_: unknown, { attrs }: { attrs: Record<string, unknown> }) => h('svg', { ...attrs, 'data-icon': 'cross-circle' }) };
});

vi.mock('@adyen/ui-assets-icons-24/vue/info', async () => {
    const { h } = await import('vue');
    return { default: (_: unknown, { attrs }: { attrs: Record<string, unknown> }) => h('svg', { ...attrs, 'data-icon': 'info' }) };
});

const renderEmptyState = (props: { type: 'highlight' | 'error' | 'success'; actions?: { title: string }[] }) => {
    const target = document.createElement('div');
    const app = createApp({ render: () => h(EmptyState, { title: 'Title', ...props }, () => 'Description') });
    app.mount(target);
    const icon = target.querySelector('svg');
    return { icon, target, unmount: () => app.unmount() };
};

describe('EmptyState', () => {
    test.each([
        ['highlight', 'info', undefined],
        ['error', 'cross-circle', styles.iconCritical],
        ['success', 'checkmark-circle', styles.iconSuccess],
    ] as const)('should show the %s icon', (type, iconName, iconClass) => {
        const { icon, unmount } = renderEmptyState({ type });

        expect(icon?.getAttribute('data-icon')).toBe(iconName);
        expect(icon?.getAttribute('aria-hidden')).toBe('true');
        expect(icon?.getAttribute('class') || undefined).toBe(iconClass);

        unmount();
    });

    test('should show the title and the description', () => {
        const { target, unmount } = renderEmptyState({ type: 'success' });

        expect(target.querySelector('h2')?.textContent).toBe('Title');
        expect(target.querySelector('p')?.textContent).toBe('Description');

        unmount();
    });

    test('should show the actions only when there are any', () => {
        const view = renderEmptyState({ type: 'error', actions: [{ title: 'Refresh' }] });
        expect(view.target.querySelector('button')?.textContent).toBe('Refresh');
        view.unmount();

        const { target, unmount } = renderEmptyState({ type: 'error' });
        expect(target.querySelector('button')).toBeNull();
        unmount();
    });
});
