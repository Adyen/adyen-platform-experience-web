import { createApp, h, reactive, ref, type App, type Component } from 'vue';
import { createI18n as createVueI18n, type I18n as VueI18n } from 'vue-i18n';
import type { ExternalComponentType } from '@integration-components/types';
import { uuid } from '@integration-components/utils';
import UIElementProvider from './UIElementProvider.vue';
import Localization from '../Localization';
import type { CustomTranslations } from '../translations';
import type { DomainTranslationBinding, V2TranslationDomain } from './Context/types';
import { DOMAIN_TRANSLATION_BINDING_KEY } from './Context/constants';
import { SDK_TRANSLATION_SOURCES } from '../../../../sdk/src/translations';

const getTranslationDomain = (componentName: ExternalComponentType): V2TranslationDomain => {
    switch (componentName) {
        case 'capitalOverview':
        case 'capitalOffer':
            return 'capital';
        case 'disputes':
        case 'disputesManagement':
            return 'disputes';
        case 'paymentLinkCreation':
        case 'paymentLinkDetails':
        case 'paymentLinksOverview':
        case 'paymentLinkSettings':
            return 'payByLink';
        case 'payouts':
        case 'payoutDetails':
            return 'payouts';
        case 'reports':
            return 'reports';
        default:
            return 'transactions';
    }
};

export const createRefreshContext = () => {
    const refreshCount = ref(0);
    const refresh: () => void = () => refreshCount.value++;
    return { refresh, refreshCount };
};

/**
 * Base class that mirrors the Preact BaseElement/UIElement mount/update/unmount lifecycle
 * for Vue components. Consumers instantiate a subclass with a set of props, call mount(target)
 * to render, update(props) to patch reactively, and unmount() to tear down.
 *
 * The mounted component is automatically wrapped in the standard provider stack
 * (CoreProvider → ConfigProvider → EventDispatcherProvider) via UIElementProvider
 *
 *     const reportsOverview = new ReportsOverviewElement({ core, balanceAccountId: 'BA...' });
 *     reportsOverview.mount('#reports-container');
 *     reportsOverview.update({ balanceAccountId: 'BA_NEW' });
 *     reportsOverview.unmount();
 */
export class UIElement<Props extends Record<string, any>> {
    public static type: ExternalComponentType;

    public customClassNames: string | undefined;
    public readonly _id = `${(this.constructor as typeof UIElement)?.type}-${uuid()}`;

    protected _app: App | null = null;
    protected _component: Component;
    protected _componentName: ExternalComponentType;
    protected _core: Props['core'];
    protected _props: Omit<Props, 'core'>;
    protected _target: Element | null = null;
    protected _localization: Localization | null = null;
    protected _customTranslations: CustomTranslations | undefined;
    protected _vueI18n: VueI18n<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>, string, false> | null = null;
    protected _translationDomain: V2TranslationDomain | null = null;
    protected _refreshTranslations: (() => void) | null = null;

    /**
     * Returns the core instance associated with this element, if any.
     */
    public get core(): any {
        return this._core;
    }

    get type(): ExternalComponentType {
        return (this.constructor as typeof UIElement)?.type;
    }

    get displayName(): ExternalComponentType {
        return this.type;
    }

    constructor(component: Component, props: Props, componentName: ExternalComponentType) {
        const { core, ...componentProps } = props;

        this._core = core;
        this._component = component;
        this._componentName = componentName;
        this._props = reactive(componentProps) as typeof componentProps;

        this.core?.registerComponent(this);
    }

    protected configureApp(app: App, domainTranslations: DomainTranslationBinding): void {
        if (!this._vueI18n) throw new Error('[UIElement] Vue I18n must be initialized before configuring the app.');

        app.use(this._vueI18n);
        app.provide(DOMAIN_TRANSLATION_BINDING_KEY, domainTranslations);
        this.configureComponentApp(app);
    }

    protected configureComponentApp(_app: App): void {
        // UI element subclasses can register framework-specific plugins before mounting.
    }

    public mount(target: Element | string): this {
        if (this._app) this.unmount();

        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) throw new Error(`[UIElement] Mount target not found: ${String(target)}`);

        this._target = el;

        const props = this._props;
        const core = this._core;
        const component = this._component;
        const componentName = this._componentName;
        const customClassNames = this.customClassNames;

        const localization = new Localization(core.options.locale, undefined, '', '', SDK_TRANSLATION_SOURCES);
        const customTranslations = core.options.translations as CustomTranslations;
        localization.customTranslations = customTranslations;

        const i18n = localization.i18n;
        this._localization = localization;
        this._customTranslations = customTranslations;

        const translationDomain = getTranslationDomain(componentName);
        this._translationDomain = translationDomain;

        const { refresh, refreshCount } = createRefreshContext();
        this._refreshTranslations = refresh;

        this._app = createApp({
            setup: () => () => {
                return h(
                    UIElementProvider,
                    {
                        core,
                        componentName,
                        customClassNames,
                        refreshComponent: refresh,
                    },
                    { default: () => h(component, { ...props, key: refreshCount.value }) }
                );
            },
        });

        // Bento's Vue components call `useI18n()` internally, which requires a
        // vue-i18n instance to be installed on the Vue app. Install a minimal
        // instance here so mounted components (and nested Bento primitives)
        // resolve without throwing "Need to install with `app.use` function".
        const locale = this._core?.options?.locale || 'en-US';

        this._vueI18n = createVueI18n({
            legacy: false,
            locale,
            fallbackLocale: 'en-US',
            messages: { [locale]: {}, 'en-US': {} },
        });

        void Promise.all([localization.ready]).then(() => {
            this.#syncTranslations();
        });

        this.configureApp(this._app, { i18n, translationDomain });
        this._app.mount(el);

        return this;
    }

    public update(props: Partial<Props>): this {
        const { core: _, ...componentProps } = props;
        Object.assign(this._props as Record<string, unknown>, componentProps);

        if (!this._localization || !this._vueI18n) return this;

        const locale = this.core.options.locale;
        const customTranslations = this.core.options.translations as CustomTranslations;
        const localeChanged = locale !== undefined && this._localization.locale !== locale;
        const customTranslationsChanged = this._customTranslations !== customTranslations;

        if (localeChanged || customTranslationsChanged) {
            if (localeChanged) this._localization.locale = locale;
            if (customTranslationsChanged) this._localization.customTranslations = customTranslations;

            this._customTranslations = customTranslations;
            this._vueI18n.global.locale.value = this._localization.locale;
            void Promise.all([this._localization.ready]).then(() => this.#syncTranslations());
        }

        return this;
    }

    public unmount(): this {
        this._app?.unmount();
        this._app = null;
        this._target = null;
        this._localization = null;
        this._customTranslations = undefined;
        this._vueI18n = null;
        this._translationDomain = null;
        this._refreshTranslations = null;
        return this;
    }

    public remove(): this {
        this.unmount();
        this.core?.remove(this);
        return this;
    }

    #syncTranslations(): void {
        if (!this._localization || !this._vueI18n || !this._translationDomain) return;
        this._refreshTranslations?.();
    }
}

export default UIElement;
