/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, type Component, type VNode } from 'vue';
import { createI18n } from 'vue-i18n';
import { UIElement } from './UIElement';
import type { CoreOptions } from './types';
import deDE from '../../../../sdk/translations/de-DE.json' with { type: 'json' };
import { DOMAIN_TRANSLATION_BINDING_KEY } from './Context/constants';
import type { DomainTranslationBinding } from './Context/types';

vi.mock('./UIElementProvider.vue', () => ({
    default: 'ui-element-provider',
}));

vi.mock('vue', async () => {
    const vue = await vi.importActual<typeof import('vue')>('vue');
    return { ...vue, createApp: vi.fn() };
});

vi.mock('vue-i18n', () => ({
    createI18n: vi.fn(() => ({ global: { locale: { value: 'en-US' }, setLocaleMessage: vi.fn() } })),
}));

const getComponentSubtree = (view: VNode) => (view.children as { default: () => VNode }).default();

describe('UIElement', () => {
    const app = {
        mount: vi.fn(),
        unmount: vi.fn(),
        use: vi.fn(),
        provide: vi.fn(),
    };

    let rootComponent: { setup: () => () => VNode };

    beforeEach(() => {
        vi.clearAllMocks();
        app.use.mockReturnValue(app);
        app.provide.mockReturnValue(app);

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

    test('does not remount when Core forwards unchanged translation options', async () => {
        const core = {
            options: { locale: 'en-US' },
            registerComponent: vi.fn(),
            remove: vi.fn(),
            update: vi.fn(),
        };

        const component = { render: () => null } as Component;
        const element = new UIElement(component, { core, locale: 'en-US' }, 'transactions');
        element.mount(document.createElement('div'));

        const renderElement = rootComponent.setup();

        const [, domainTranslations] = app.provide.mock.calls.find(([key]) => key === DOMAIN_TRANSLATION_BINDING_KEY) as [
            typeof DOMAIN_TRANSLATION_BINDING_KEY,
            DomainTranslationBinding,
        ];

        await domainTranslations.i18n.ready;
        await Promise.resolve();

        const initialComponentKey = getComponentSubtree(renderElement()).key;

        element.update({ locale: 'en-US' });

        await Promise.resolve();
        expect(getComponentSubtree(renderElement()).key).toBe(initialComponentKey);
    });

    test('provides V2 SDK translations to the component', async () => {
        const core = {
            options: { locale: 'en-US' },
            registerComponent: vi.fn(),
            remove: vi.fn(),
            update: vi.fn(),
        };
        const component = { render: () => null } as Component;
        const element = new UIElement(component, { core }, 'transactions');

        element.mount(document.createElement('div'));
        const [, domainTranslations] = app.provide.mock.calls.find(([key]) => key === DOMAIN_TRANSLATION_BINDING_KEY) as [
            typeof DOMAIN_TRANSLATION_BINDING_KEY,
            DomainTranslationBinding,
        ];
        const i18n = domainTranslations.i18n;

        await i18n.ready;

        expect(i18n.get('transactions.common.errors.updateFilters')).toBe('Try a different search or reset your filters, and we’ll try again.');
    });

    test('updates V2 translations after a Core locale or custom translation update', async () => {
        const options: CoreOptions = {
            locale: 'en-US',
            onSessionCreate: vi.fn(),
            translations: {
                'en-US': {
                    'transactions.common.errors.updateFilters': 'Use a custom filter message.',
                },
            },
        };
        const core = {
            options,
            registerComponent: vi.fn(),
            remove: vi.fn(),
            update: vi.fn(),
        };
        const component = { render: () => null } as Component;
        const element = new UIElement(component, { core, locale: 'en-US' }, 'transactions');

        element.mount(document.createElement('div'));
        const [, domainTranslations] = app.provide.mock.calls.find(([key]) => key === DOMAIN_TRANSLATION_BINDING_KEY) as [
            typeof DOMAIN_TRANSLATION_BINDING_KEY,
            DomainTranslationBinding,
        ];
        const i18n = domainTranslations.i18n;

        await i18n.ready;
        expect(i18n.get('transactions.common.errors.updateFilters')).toBe('Use a custom filter message.');

        core.options.locale = 'de-DE';
        core.options.translations = undefined;
        element.update({ locale: 'de-DE' });

        await i18n.ready;
        expect(i18n.get('transactions.common.errors.updateFilters')).toBe(deDE['transactions.common.errors.updateFilters']);
    });

    test('updates the Bento Vue I18n locale after its locale messages load', async () => {
        const core = {
            options: { locale: 'en-US' },
            registerComponent: vi.fn(),
            remove: vi.fn(),
            update: vi.fn(),
        };
        const component = { render: () => null } as Component;
        const element = new UIElement(component, { core, locale: 'en-US' }, 'transactions');

        element.mount(document.createElement('div'));

        core.options.locale = 'de-DE';
        element.update({ locale: 'de-DE' });

        await vi.waitFor(() => {
            expect(vi.mocked(createI18n).mock.results[0]?.value.global.locale.value).toBe('de-DE');
        });
    });
});
