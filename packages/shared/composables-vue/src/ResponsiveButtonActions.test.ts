// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { computed, createRenderer, h, nextTick, reactive, ref, type App } from 'vue';
import type { BentoButtonActionsList } from '@adyen/bento-vue3';
import ResponsiveButtonActions from './ResponsiveButtonActions.vue';
import { containerQueries, useResponsiveContainer } from './useResponsiveContainer.js';
import styles from './ResponsiveButtonActions.module.scss';

const { renderButtonActions } = vi.hoisted(() => ({
    renderButtonActions: vi.fn((_props: { actions: BentoButtonActionsList; layout: string; class: string }) => null),
}));

vi.mock('@adyen/bento-vue3', () => ({
    BentoButtonActions: renderButtonActions,
}));

vi.mock('./useResponsiveContainer', async importOriginal => {
    const original = await importOriginal<typeof import('./useResponsiveContainer.js')>();
    return { ...original, useResponsiveContainer: vi.fn() };
});

const { createApp } = createRenderer<object, object>({
    createElement: () => ({}),
    createText: () => ({}),
    createComment: () => ({}),
    insert: vi.fn(),
    remove: vi.fn(),
    setText: vi.fn(),
    setElementText: vi.fn(),
    parentNode: () => null,
    nextSibling: () => null,
    patchProp: vi.fn(),
});

describe('ResponsiveButtonActions', () => {
    const isMobile = ref(false);
    const actions: BentoButtonActionsList = [
        { title: 'Back', event: vi.fn(), variant: 'secondary' },
        { title: 'Details', event: vi.fn(), variant: 'secondary' },
    ];
    let app: App<object>;

    beforeEach(() => {
        vi.clearAllMocks();
        isMobile.value = false;
        vi.mocked(useResponsiveContainer).mockReturnValue(computed(() => isMobile.value));
    });

    afterEach(() => app?.unmount());

    const mountActions = (props = { actions }) => {
        app = createApp({ render: () => h(ResponsiveButtonActions, props) });
        app.mount({});
    };
    const buttonActionsProps = () => renderButtonActions.mock.lastCall?.[0];

    test('mounts and renders actions without an SSR context', () => {
        expect(() => mountActions()).not.toThrow();
        expect(renderButtonActions).toHaveBeenCalledOnce();
    });

    test('passes actions through and uses the existing container breakpoint', () => {
        mountActions();

        expect(buttonActionsProps()?.actions).toBe(actions);
        expect(useResponsiveContainer).toHaveBeenCalledWith(containerQueries.down.xs);
    });

    test('uses the space-between layout and centering styles on larger containers', () => {
        mountActions();

        expect(buttonActionsProps()?.layout).toBe('space-between');
        expect(buttonActionsProps()?.class).toContain(styles.actions);
        expect(buttonActionsProps()?.class).not.toContain(styles.actionsStacked);
    });

    test('switches to stacked buttons in small containers and back when resized', async () => {
        mountActions();
        isMobile.value = true;
        await nextTick();

        expect(buttonActionsProps()?.layout).toBe('stacked-buttons');
        expect(buttonActionsProps()?.class).toContain(styles.actions);
        expect(buttonActionsProps()?.class).toContain(styles.actionsStacked);

        isMobile.value = false;
        await nextTick();

        expect(buttonActionsProps()?.layout).toBe('space-between');
        expect(buttonActionsProps()?.class).not.toContain(styles.actionsStacked);
    });

    test('forwards updated actions without changing their callbacks', async () => {
        const props = reactive({ actions });
        mountActions(props);
        props.actions = [actions[1]!];
        await nextTick();

        expect(buttonActionsProps()?.actions).toBe(props.actions);
        expect(buttonActionsProps()?.actions[0]?.event).toBe(actions[1]!.event);
    });
});
