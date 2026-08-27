/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, type Component, type VNode } from 'vue';
import { UIElement } from './UIElement';

vi.mock('./UIElementProvider.vue', () => ({
    default: 'ui-element-provider',
}));

vi.mock('vue', async () => {
    const vue = await vi.importActual<typeof import('vue')>('vue');
    return { ...vue, createApp: vi.fn() };
});

vi.mock('vue-i18n', () => ({
    createI18n: vi.fn(() => ({})),
}));

const getComponentSubtree = (view: VNode) => (view.children as { default: () => VNode }).default();

describe('UIElement', () => {
    const app = {
        mount: vi.fn(),
        unmount: vi.fn(),
        use: vi.fn(),
    };

    let rootComponent: { setup: () => () => VNode };

    beforeEach(() => {
        vi.clearAllMocks();
        app.use.mockReturnValue(app);

        vi.mocked(createApp).mockImplementation(component => {
            rootComponent = component as typeof rootComponent;
            return app as any;
        });
    });

    test('provides a refresh callback scoped to the current element', () => {
        const core = {
            options: { locale: 'en-US' },
            registerComponent: vi.fn(),
            remove: vi.fn(),
            update: vi.fn(),
        };

        const component = { render: () => null } as Component;
        const element = new UIElement(component, { core }, 'transactions');
        const sibling = new UIElement(component, { core }, 'transactions');

        element.mount(document.createElement('div'));
        const renderElement = rootComponent.setup();
        const view = renderElement();
        const initialElementKey = getComponentSubtree(view).key;

        sibling.mount(document.createElement('div'));
        const renderSibling = rootComponent.setup();
        const initialSiblingKey = getComponentSubtree(renderSibling()).key;

        view.props?.refreshComponent();

        expect(getComponentSubtree(renderElement()).key).not.toBe(initialElementKey);
        expect(getComponentSubtree(renderSibling()).key).toBe(initialSiblingKey);
        expect(core.update).not.toHaveBeenCalled();
    });

    test('preserves the remount key on prop update and changes it on refresh', () => {
        const core = {
            options: { locale: 'en-US' },
            registerComponent: vi.fn(),
            remove: vi.fn(),
            update: vi.fn(),
        };

        const component = { render: () => null } as Component;
        const element = new UIElement(component, { core, balanceAccountId: 'BA_OLD' }, 'transactions');

        element.mount(document.createElement('div'));

        const renderElement = rootComponent.setup();
        let view = renderElement();
        const initialProviderKey = view.key;
        const initialComponentKey = getComponentSubtree(view).key;

        element.update({ balanceAccountId: 'BA_NEW' });
        view = renderElement();

        const updatedComponent = getComponentSubtree(view);

        expect(view.key).toBe(initialProviderKey);
        expect(updatedComponent.key).toBe(initialComponentKey);
        expect(updatedComponent.props?.balanceAccountId).toBe('BA_NEW');

        view.props?.refreshComponent();
        view = renderElement();

        expect(view.key).toBe(initialProviderKey);
        expect(getComponentSubtree(view).key).not.toBe(initialComponentKey);
    });
});
