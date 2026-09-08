import { createApp, h, reactive, ref, type App, type Component } from 'vue';
import { createI18n as createVueI18n, type I18n as VueI18n } from 'vue-i18n';
import type { ExternalComponentType } from '@integration-components/types';
import { uuid } from '@integration-components/utils';
import UIElementProvider from './UIElementProvider.vue';
import type { DomainCustomTranslations } from './types';
import type { DomainTranslationBinding, TranslationDomain } from './Context/types';
import { applyBentoDomainOverrides, getBentoLocaleMessages } from './bentoTranslations';
import { DOMAIN_TRANSLATION_BINDING_KEY } from './Context/constants';

const getTranslationDomain = (componentName: ExternalComponentType): TranslationDomain => {
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
 * Base class for the Vue component mount/update/unmount lifecycle. Consumers instantiate a subclass with a set of props, call mount(target)
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
    protected _bentoOverrides: Record<string, string> | null = null;
    protected _customTranslations: DomainCustomTranslations | undefined;
    protected _locale: string | undefined;
    protected _vueI18n: VueI18n<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>, string, false> | null = null;
    protected _translationDomain: TranslationDomain | null = null;
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

        const localization = core.localization;
        const bentoLocalization = core.bentoLocalization;
        const customTranslations = core.options.translations as DomainCustomTranslations | undefined;

        const i18n = localization.i18n;
        this._customTranslations = customTranslations;
        this._locale = localization.locale;

        const bentoOverrides = reactive<Record<string, string>>({});
        const translationDomain = getTranslationDomain(componentName);

        this._bentoOverrides = bentoOverrides;
        this._translationDomain = translationDomain;

        const { refresh, refreshCount } = createRefreshContext();
        this._refreshTranslations = refresh;

        this._app = createApp({
            setup: () => () => {
                return h(
                    UIElementProvider,
                    {
                        core,
                        bentoOverrides,
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

        void Promise.all([localization.ready, bentoLocalization.ready]).then(() => {
            this.#syncTranslations();
        });

        this.configureApp(this._app, { i18n, translationDomain });
        this._app.mount(el);

        return this;
    }

    public update(props: Partial<Props>): this {
        const { core: _, ...componentProps } = props;
        Object.assign(this._props as Record<string, unknown>, componentProps);

        if (!this._vueI18n) return this;

        const customTranslations = this.core.options.translations as DomainCustomTranslations | undefined;
        const localeChanged = this._locale !== this.core.localization.locale;
        const customTranslationsChanged = this._customTranslations !== customTranslations;

        if (localeChanged || customTranslationsChanged) {
            if (localeChanged) {
                const locale = this.core.localization.locale;
                this._vueI18n.global.locale.value = locale;
                this._locale = locale;
            }

            this._customTranslations = customTranslations;
            void Promise.all([this.core.localization.ready, this.core.bentoLocalization.ready]).then(() => this.#syncTranslations());
        }

        return this;
    }

    public unmount(): this {
        this._app?.unmount();
        this._app = null;
        this._target = null;
        this._bentoOverrides = null;
        this._customTranslations = undefined;
        this._locale = undefined;
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
        if (!this._vueI18n || !this._bentoOverrides || !this._translationDomain) return;

        const bentoTranslations = getBentoLocaleMessages(
            key => this.core.bentoLocalization.getTemplate(key),
            key => this.core.bentoLocalization.has(key)
        );

        const bentoLocale = this.core.bentoLocalization.locale;

        this._vueI18n.global.locale.value = bentoLocale;
        this._vueI18n.global.setLocaleMessage(bentoLocale, bentoTranslations);
        applyBentoDomainOverrides(this._bentoOverrides, this.core.localization.i18n, bentoTranslations, this._translationDomain, this._componentName);
        this._refreshTranslations?.();
    }
}

export default UIElement;
