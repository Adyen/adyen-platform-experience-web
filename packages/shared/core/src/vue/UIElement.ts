import { createApp, h, reactive, ref, shallowRef, type App, type Component } from 'vue';
import { createI18n as createVueI18n, type I18n as VueI18n } from 'vue-i18n';
import type { ExternalComponentType, GlobalAppearance } from '@integration-components/types';
import { isShallowEqual, uuid } from '@integration-components/utils';
import UIElementProvider from './UIElementProvider.vue';
import type { DomainTranslationBinding } from './Context/types';
import { applyBentoDomainOverrides, getBentoLocaleMessages } from './bentoTranslations';
import { DOMAIN_TRANSLATION_BINDING_KEY } from './Context/constants';
import type { CustomTranslations, TranslationDomain } from '../translations';

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
        case 'transactions':
        case 'transactionDetails':
            return 'transactions';
        default: {
            // Typing the unhandled case as `never` turns a new component type without a domain
            // into a compile error, and still fails loudly for untyped integrations at runtime.
            const unknownComponent: never = componentName;
            throw new Error(`[UIElement] No translation domain is registered for component "${String(unknownComponent)}".`);
        }
    }
};

/**
 * The resolved Bento messages and domain-override table for one (locale, domain, component) triple.
 * Both are pure functions of the two localizations' current state, so they can be resolved once and
 * shared: the second element mounting the same component, and every locale flip back, reuse the
 * first resolution instead of recompiling the Bento templates and re-probing every route.
 */
type BentoTranslationBundle = Readonly<{
    messages: Record<string, string>;
    overrides: Readonly<Record<string, string>>;
}>;

// Keyed by Core instance so two integrations on one page cannot share a bundle. The generation
// stamp changes whenever either localization refreshes (locale or customTranslations), so a
// merchant's translation change can never be served from a stale bundle.
const bentoTranslationBundles = new WeakMap<object, { generation: string; bundles: Map<string, BentoTranslationBundle> }>();

// The `customTranslations` accessor hands back a fresh empty object on every read while unset, so
// identity is only meaningful for a non-empty translation set. `performance.now()` is coarsened in
// browsers, so the customTranslations identity is part of the stamp rather than relying on the
// timestamps alone.
const translationIdentities = new WeakMap<object, number>();
let nextTranslationIdentity = 0;

const getTranslationIdentity = (customTranslations: Record<string, unknown> | undefined): number => {
    if (!customTranslations || Object.keys(customTranslations).length === 0) return 0;

    let identity = translationIdentities.get(customTranslations);
    if (identity === undefined) {
        identity = ++nextTranslationIdentity;
        translationIdentities.set(customTranslations, identity);
    }
    return identity;
};

export const resolveBentoTranslationBundle = (core: any, domain: TranslationDomain, componentName: ExternalComponentType): BentoTranslationBundle => {
    const { localization, bentoLocalization } = core;
    const generation = [
        bentoLocalization.locale,
        localization.locale,
        getTranslationIdentity(localization.customTranslations),
        bentoLocalization.lastRefreshTimestamp,
        localization.lastRefreshTimestamp,
    ].join(':');

    let cache = bentoTranslationBundles.get(core);
    if (!cache || cache.generation !== generation) {
        cache = { generation, bundles: new Map() };
        bentoTranslationBundles.set(core, cache);
    }

    const cacheKey = `${bentoLocalization.locale}:${domain}:${componentName}`;
    const cachedBundle = cache.bundles.get(cacheKey);
    if (cachedBundle) return cachedBundle;

    const messages = getBentoLocaleMessages(
        key => bentoLocalization.getTemplate(key),
        key => bentoLocalization.has(key)
    );
    const overrides: Record<string, string> = {};
    applyBentoDomainOverrides(overrides, localization.i18n, messages, domain, componentName);

    const bundle: BentoTranslationBundle = { messages, overrides };
    cache.bundles.set(cacheKey, bundle);
    return bundle;
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
 *     const reportsOverview = new ReportsOverviewElement({ core });
 *     reportsOverview.mount('#reports-container');
 *     reportsOverview.update({ appearance: { titles: 'hidden' } });
 *     reportsOverview.unmount();
 */
export class UIElement<Props extends Record<string, any> & { appearance?: GlobalAppearance }> {
    public static readonly type: ExternalComponentType;

    public readonly _id = `${(this.constructor as typeof UIElement)?.type}-${uuid()}`;

    protected _app: App | null = null;
    protected _component: Component;
    protected _componentName: ExternalComponentType;
    protected _core: Props['core'];
    protected _globalAppearance = shallowRef<GlobalAppearance | undefined>(undefined);
    protected _props: Omit<Props, 'core'>;
    protected _target: Element | null = null;
    protected _bentoOverrides: Record<string, string> | null = null;
    protected _customTranslations: CustomTranslations | undefined;
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
        this._globalAppearance.value = core?.options?.appearance;
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

        this.core?.registerThemeRoot?.(el);
        this._target = el;

        try {
            const props = this._props;
            const core = this._core;
            const component = this._component;
            const componentName = this._componentName;
            const globalAppearance = this._globalAppearance;

            const localization = core.localization;
            const customTranslations = core.options.translations as CustomTranslations | undefined;

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
                    const { appearance, ...componentProps } = props;

                    return h(
                        UIElementProvider,
                        {
                            core,
                            bentoOverrides,
                            componentName,
                            componentAppearance: appearance,
                            globalAppearance: globalAppearance.value,
                            refreshComponent: refresh,
                        },
                        { default: () => h(component, { ...componentProps, key: refreshCount.value }) }
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

            this.#syncTranslationsWhenReady();

            this.configureApp(this._app, { i18n, translationDomain });
            this._app.mount(el);
        } catch (error) {
            this.unmount();
            throw error;
        }

        return this;
    }

    public update(props: Partial<Props>): this {
        const isCoreUpdate = props === this.core?.options;

        // The global appearance is owned by Core. Refresh it from Core options whenever it changes,
        // guarding with a shallow-equal check to avoid unnecessary re-renders.
        const nextGlobalAppearance = this.core?.options?.appearance;

        if (!isShallowEqual(this._globalAppearance.value, nextGlobalAppearance)) {
            this._globalAppearance.value = nextGlobalAppearance;
        }

        if (isCoreUpdate) {
            // Core.update forwards its full options, where `appearance` is the global one (synced
            // above). Keep it out of the component props so it cannot clobber the component appearance.
            const { appearance: _appearance, core: _core, ...componentProps } = props;
            Object.assign(this._props as Record<string, unknown>, componentProps);
        } else {
            // A direct update carries component props, where `appearance` is component-specific,
            // exactly like the appearance prop at construction.
            const { core: _core, ...componentProps } = props;
            Object.assign(this._props as Record<string, unknown>, componentProps);
        }

        if (!this._vueI18n) return this;

        const customTranslations = this.core.options.translations as CustomTranslations | undefined;
        const localeChanged = this._locale !== this.core.localization.locale;
        const customTranslationsChanged = this._customTranslations !== customTranslations;

        if (localeChanged || customTranslationsChanged) {
            if (localeChanged) {
                const locale = this.core.localization.locale;
                this._vueI18n.global.locale.value = locale;
                this._locale = locale;
            }

            this._customTranslations = customTranslations;
            this.#syncTranslationsWhenReady();
        }

        return this;
    }

    public unmount(): this {
        this._app?.unmount();
        if (this._target) {
            this.core?.unregisterThemeRoot?.(this._target);
        }
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

    /**
     * Runs the background translation sync once both localization stores are ready. The sync happens after
     * the component has mounted, so a failure there is reported through the Core error handler (or logged)
     * instead of escaping as an unhandled promise rejection.
     */
    #syncTranslationsWhenReady(): void {
        Promise.all([this.core.localization.ready, this.core.bentoLocalization.ready])
            .then(() => this.#syncTranslations())
            .catch((error: unknown) => this.#reportTranslationSyncError(error));
    }

    #reportTranslationSyncError(error: unknown): void {
        const onError = this.core?.options?.onError;

        if (onError) {
            try {
                onError(error instanceof Error ? error : new Error(String(error)));
                return;
            } catch (ex) {
                console.error(ex);
            }
        }

        console.error(error);
    }

    #syncTranslations(): void {
        if (!this._vueI18n || !this._bentoOverrides || !this._translationDomain) return;

        const { messages, overrides } = resolveBentoTranslationBundle(this.core, this._translationDomain, this._componentName);
        const bentoLocale = this.core.bentoLocalization.locale;

        this._vueI18n.global.locale.value = bentoLocale;
        this._vueI18n.global.setLocaleMessage(bentoLocale, messages);

        // The bundle is shared, so its entries are copied into this element's reactive object
        // rather than provided by reference; routes the bundle dropped are removed to match it.
        for (const key of Object.keys(this._bentoOverrides)) {
            if (!(key in overrides)) delete this._bentoOverrides[key];
        }
        Object.assign(this._bentoOverrides, overrides);

        this._refreshTranslations?.();
    }
}

export default UIElement;
