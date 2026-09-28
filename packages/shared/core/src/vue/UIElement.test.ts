/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, type Component, type VNode } from 'vue';
import { createI18n } from 'vue-i18n';
import { UIElement } from './UIElement';
import type { Appearance, CoreOptions } from './types';
import deDE from '../../../../sdk/translations/de-DE.json' with { type: 'json' };
import { SDK_BENTO_TRANSLATION_SOURCES, SDK_TRANSLATION_SOURCES } from '../../../../sdk/src/translations';
import { DOMAIN_TRANSLATION_BINDING_KEY } from './Context/constants';
import type { DomainTranslationBinding } from './Context/types';
import Localization from '../Localization';
import Core from '../Core';
import type { ExternalComponentType } from '@integration-components/types';

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
const createLocalization = (locale = 'en-US') => new Localization(locale, '', SDK_TRANSLATION_SOURCES);
const createBentoLocalization = (locale = 'en-US') => new Localization(locale, '', SDK_BENTO_TRANSLATION_SOURCES);

// A Core-like fixture whose domain translations lack the component-specific keys routed by BENTO_COMPONENT_DOMAIN_OVERRIDES,
// so applying Bento domain overrides during the background translation sync throws.
const createCoreWithMissingDomainTranslation = (options: Record<string, unknown>) => ({
    options,
    localization: {
        ready: Promise.resolve(),
        locale: 'en-US',
        i18n: { getTranslationFamily: () => ({ base: null, zero: null, one: null, plural: null, unsupportedExactCounts: [] }) },
    },
    bentoLocalization: {
        ready: Promise.resolve(),
        locale: 'en-US',
        has: () => false,
        getTemplate: () => null,
    },
    registerComponent: vi.fn(),
    remove: vi.fn(),
    update: vi.fn(),
});

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
            localization: createLocalization(),
            bentoLocalization: createBentoLocalization(),
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
            localization: createLocalization(),
            bentoLocalization: createBentoLocalization(),
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
            localization: createLocalization(),
            bentoLocalization: createBentoLocalization(),
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
            localization: createLocalization(),
            bentoLocalization: createBentoLocalization(),
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
        const core = new Core(options);
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

        await core.update({ locale: 'de-DE', translations: undefined });

        await i18n.ready;
        expect(i18n.get('transactions.common.errors.updateFilters')).toBe(deDE['transactions.common.errors.updateFilters']);
    });

    test('reacts to global appearance updates from Core.update', async () => {
        const core = new Core({ locale: 'en-US', onSessionCreate: vi.fn() });
        const component = { render: () => null } as Component;
        const element = new UIElement(component, { core }, 'transactions');

        element.mount(document.createElement('div'));

        const renderElement = rootComponent.setup();
        expect(renderElement().props?.globalAppearance).toBeUndefined();

        await core.update({ appearance: { illustrations: 'hidden' } });

        const view = renderElement();
        expect(view.props?.globalAppearance).toEqual({ illustrations: 'hidden' });
        expect(getComponentSubtree(view).props?.appearance).toBeUndefined();
    });

    test('forwards non-appearance options from Core.update to the component', async () => {
        const core = new Core({ locale: 'en-US', onSessionCreate: vi.fn() });
        const component = { render: () => null } as Component;
        const element = new UIElement(component, { core, locale: 'en-US' }, 'transactions');

        element.mount(document.createElement('div'));

        const renderElement = rootComponent.setup();
        expect(getComponentSubtree(renderElement()).props?.locale).toBe('en-US');

        await core.update({ locale: 'de-DE', appearance: { illustrations: 'hidden' } });

        const view = renderElement();
        expect(getComponentSubtree(view).props?.locale).toBe('de-DE');
        expect(getComponentSubtree(view).props?.appearance).toBeUndefined();
        expect(view.props?.globalAppearance).toEqual({ illustrations: 'hidden' });
    });

    test('preserves component appearance when global appearance updates', async () => {
        const core = new Core({ locale: 'en-US', onSessionCreate: vi.fn() });
        const appearance = { illustrations: 'hidden' as const };
        const component = { render: () => null } as Component;
        const element = new UIElement(component, { core, appearance }, 'transactions');

        element.mount(document.createElement('div'));

        const renderElement = rootComponent.setup();
        expect(renderElement().props?.componentAppearance).toEqual(appearance);

        await core.update({ appearance: { illustrations: 'visible' } });

        const view = renderElement();
        expect(view.props?.componentAppearance).toEqual(appearance);
        expect(view.props?.globalAppearance).toEqual({ illustrations: 'visible' });
        expect(getComponentSubtree(view).props?.appearance).toBeUndefined();
    });

    test('applies a direct appearance update to the component appearance, never to the global', () => {
        const core = new Core({ locale: 'en-US', onSessionCreate: vi.fn() });
        const appearance: Appearance = { illustrations: 'visible' };
        const component = { render: () => null } as Component;
        const element = new UIElement(component, { core, appearance }, 'transactions');

        element.mount(document.createElement('div'));

        const renderElement = rootComponent.setup();
        expect(renderElement().props?.componentAppearance).toEqual(appearance);

        element.update({ appearance: { illustrations: 'hidden' } });

        const view = renderElement();
        expect(view.props?.componentAppearance).toEqual({ illustrations: 'hidden' }); // The component appearance updates.
        expect(view.props?.globalAppearance).toBeUndefined(); // The global appearance stays with Core.
        expect(getComponentSubtree(view).props?.appearance).toBeUndefined();
    });

    test('clears the component appearance when a direct update provides an explicit undefined appearance', () => {
        const core = new Core({ locale: 'en-US', appearance: { illustrations: 'hidden' }, onSessionCreate: vi.fn() });
        const componentAppearance: Appearance = { titles: 'hidden' };
        const component = { render: () => null } as Component;
        const element = new UIElement(component, { core, appearance: componentAppearance }, 'transactions');

        element.mount(document.createElement('div'));

        const renderElement = rootComponent.setup();
        expect(renderElement().props?.componentAppearance).toEqual(componentAppearance);

        element.update({ appearance: undefined });

        const view = renderElement();
        expect(view.props?.componentAppearance).toBeUndefined(); // An explicit undefined clears the component appearance.
        expect(view.props?.globalAppearance).toEqual({ illustrations: 'hidden' }); // The global appearance stays with Core.
    });

    test('registers and unregisters its mount target as a theme root', () => {
        const core = {
            options: { locale: 'en-US' },
            localization: createLocalization(),
            bentoLocalization: createBentoLocalization(),
            registerComponent: vi.fn(),
            registerThemeRoot: vi.fn(),
            unregisterThemeRoot: vi.fn(),
            remove: vi.fn(),
        };
        const target = document.createElement('div');
        const element = new UIElement({ render: () => null } as Component, { core }, 'transactions');

        element.mount(target);
        expect(core.registerThemeRoot).toHaveBeenCalledWith(target);

        element.unmount();
        expect(core.unregisterThemeRoot).toHaveBeenCalledWith(target);
    });

    test('does not mount when another Core already owns the target', () => {
        const ownershipError = new Error('already themed by another Core instance');
        const core = {
            options: { locale: 'en-US' },
            localization: createLocalization(),
            bentoLocalization: createBentoLocalization(),
            registerComponent: vi.fn(),
            registerThemeRoot: vi.fn(() => {
                throw ownershipError;
            }),
            unregisterThemeRoot: vi.fn(),
            remove: vi.fn(),
        };
        const element = new UIElement({ render: () => null } as Component, { core }, 'transactions');

        expect(() => element.mount(document.createElement('div'))).toThrow(ownershipError);
        expect(app.mount).not.toHaveBeenCalled();
        expect(core.unregisterThemeRoot).not.toHaveBeenCalled();
    });

    test('unregisters its theme root when mounting fails', () => {
        const mountError = new Error('mount failed');
        const core = {
            options: { locale: 'en-US' },
            localization: createLocalization(),
            bentoLocalization: createBentoLocalization(),
            registerComponent: vi.fn(),
            registerThemeRoot: vi.fn(),
            unregisterThemeRoot: vi.fn(),
            remove: vi.fn(),
        };
        const target = document.createElement('div');
        const element = new UIElement({ render: () => null } as Component, { core }, 'transactions');
        app.mount.mockImplementationOnce(() => {
            throw mountError;
        });

        expect(() => element.mount(target)).toThrow(mountError);
        expect(core.registerThemeRoot).toHaveBeenCalledWith(target);
        expect(core.unregisterThemeRoot).toHaveBeenCalledWith(target);
        expect(app.unmount).toHaveBeenCalledOnce();
    });

    test('resolves the translation domain from the component name', () => {
        const core = {
            options: { locale: 'en-US' },
            localization: createLocalization(),
            bentoLocalization: createBentoLocalization(),
            registerComponent: vi.fn(),
            remove: vi.fn(),
            update: vi.fn(),
        };
        const element = new UIElement({ render: () => null } as Component, { core }, 'capitalOffer');

        element.mount(document.createElement('div'));

        const [, domainTranslations] = app.provide.mock.calls.find(([key]) => key === DOMAIN_TRANSLATION_BINDING_KEY) as [
            typeof DOMAIN_TRANSLATION_BINDING_KEY,
            DomainTranslationBinding,
        ];

        expect(domainTranslations.translationDomain).toBe('capital');
    });

    test('does not mount a component that has no registered translation domain', () => {
        const core = {
            options: { locale: 'en-US' },
            localization: createLocalization(),
            bentoLocalization: createBentoLocalization(),
            registerComponent: vi.fn(),
            remove: vi.fn(),
            update: vi.fn(),
        };
        const element = new UIElement({ render: () => null } as Component, { core }, 'unregisteredComponent' as ExternalComponentType);

        expect(() => element.mount(document.createElement('div'))).toThrow(/No translation domain is registered/);
        expect(app.mount).not.toHaveBeenCalled();
    });

    test('updates the Bento Vue I18n locale after its locale messages load', async () => {
        const core = new Core({ locale: 'en-US', onSessionCreate: vi.fn() });
        const component = { render: () => null } as Component;
        const element = new UIElement(component, { core, locale: 'en-US' }, 'transactions');

        element.mount(document.createElement('div'));

        await core.update({ locale: 'de-DE' });

        await vi.waitFor(() => {
            expect(vi.mocked(createI18n).mock.results[0]?.value.global.locale.value).toBe('de-DE');
        });
    });

    test('reports translation sync failures through the Core error handler instead of an unhandled rejection', async () => {
        const onError = vi.fn();
        const core = createCoreWithMissingDomainTranslation({ locale: 'en-US', onError });

        const component = { render: () => null } as Component;
        const element = new UIElement(component, { core }, 'transactions');

        element.mount(document.createElement('div'));

        await vi.waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
        expect(onError).toHaveBeenCalledWith(
            expect.objectContaining({ message: expect.stringContaining('[Bento translations] Missing component-specific domain translation') })
        );
    });

    test('logs translation sync failures when no Core error handler is configured', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        const core = createCoreWithMissingDomainTranslation({ locale: 'en-US' });

        const component = { render: () => null } as Component;
        const element = new UIElement(component, { core }, 'transactions');

        try {
            element.mount(document.createElement('div'));

            await vi.waitFor(() => expect(consoleError).toHaveBeenCalledTimes(1));
            expect(consoleError).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.stringContaining('[Bento translations] Missing component-specific domain translation') })
            );
        } finally {
            consoleError.mockRestore();
        }
    });

    test('logs both the handler error and the original error when the Core error handler itself throws', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
        const onError = vi.fn(() => {
            throw new Error('handler bug');
        });
        const core = createCoreWithMissingDomainTranslation({ locale: 'en-US', onError });

        const component = { render: () => null } as Component;
        const element = new UIElement(component, { core }, 'transactions');

        try {
            element.mount(document.createElement('div'));

            await vi.waitFor(() => expect(consoleError).toHaveBeenCalledTimes(2));
            expect(onError).toHaveBeenCalledTimes(1);
            expect(consoleError).toHaveBeenNthCalledWith(1, expect.objectContaining({ message: 'handler bug' }));
            expect(consoleError).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({ message: expect.stringContaining('[Bento translations] Missing component-specific domain translation') })
            );
        } finally {
            consoleError.mockRestore();
        }
    });
});
