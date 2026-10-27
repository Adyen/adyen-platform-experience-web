import { EMPTY_OBJECT, hasOwnProperty } from '@integration-components/utils';
import { AuthSession } from './session/AuthSession';
import Localization from './Localization';
import { Assets, AssetOptions } from './Assets/Assets';
import { getCustomTranslationsAnalyticsPayload } from './EventDispatcher/eventDispatcher/customTranslations';
import { SDK_BENTO_TRANSLATION_SOURCES, SDK_TRANSLATION_SOURCES } from '../../../sdk/src/translations';
import { SERVER_SIDE_INITIALIZATION_WARNING, shouldWarnAboutServerSideInitialization } from './runtime';
import { ThemeManager } from './theme/ThemeManager';
import { FALLBACK_ENV, getConfigFromCdn, getDatasetFromCdn, resolveEnvironment } from './utils';
import type { CoreOptions, OnErrorHandler, ResolvedEnvironment } from './types';
import type { I18n } from './vue/Context/types';

/**
 * Minimal contract that UI element classes must satisfy so Core can manage them uniformly.
 */
export interface ManagedElement {
    readonly _id: string;
    readonly core: unknown;
    update(props: any): any;
    unmount(): any;
}

export type CdnFetcher = <Fallback>(props: { name: string; extension?: string; subFolder?: string; fallback?: Fallback }) => Promise<Fallback>;

/**
 * Framework-neutral source of truth for the Core runtime. Owns option resolution,
 * environment, session wiring, theming, the shared `Localization` instance, asset
 * getters, CDN helpers, the component registry, and the generic `initialize()` /
 * `update()` lifecycle.
 *
 * Rendering, mounting, and unmounting live in the Vue UIElement classes, not here.
 */

export class Core<CustomTranslations extends object = Record<never, never>> {
    public static readonly version = process.env.SDK_VERSION!;
    public options: CoreOptions<CustomTranslations>;
    public loadingContext!: string;
    public analyticsEnabled!: boolean;
    public session = new AuthSession();
    public localization: Localization;
    public bentoLocalization: Localization;
    public onError?: OnErrorHandler;
    public getImageAsset!: (props: AssetOptions) => string;
    public getDatasetAsset!: (props: AssetOptions) => string;
    public getCdnConfig!: CdnFetcher;
    public getCdnDataset!: CdnFetcher;
    public components: ManagedElement[] = [];

    private hasWarnedAboutServerSideInitialization = false;
    private readyCustomTranslationsAnalytics = false;
    private themeInitialized = false;
    private readonly themeManager = new ThemeManager();

    constructor(options: CoreOptions<CustomTranslations>) {
        this.options = { environment: FALLBACK_ENV, ...options };
        const { cdnTranslationsUrl } = this.resolveEnvironment();

        this.applyEnvironmentAssets();
        this.applyAnalyticsOptions();

        this.localization = new Localization(this.options.locale, cdnTranslationsUrl, SDK_TRANSLATION_SOURCES);
        this.bentoLocalization = new Localization(this.options.locale, `${cdnTranslationsUrl}/bento`, SDK_BENTO_TRANSLATION_SOURCES);

        this.setOptions(this.options);
    }

    /**
     * Re-resolve environment URLs from the current `options.environment`.
     */
    protected resolveEnvironment(): ResolvedEnvironment {
        return resolveEnvironment(this.options.environment);
    }

    /**
     * Merge incoming options, propagate locale / custom translations to the shared
     * `Localization`, then sync the session.
     */
    protected setOptions(options: Partial<CoreOptions<CustomTranslations>>): this {
        const environmentChanged = options.environment !== undefined && options.environment !== this.options.environment;
        const loadingContextChanged = options.loadingContext !== undefined && options.loadingContext !== this.options.loadingContext;
        const analyticsChanged = options.analytics !== undefined && options.analytics !== this.options.analytics;
        const nextThemeMode = hasOwnProperty(options, 'themeMode') ? options.themeMode : this.options.themeMode;
        const nextCustomTheme = hasOwnProperty(options, 'customTheme') ? options.customTheme : this.options.customTheme;
        const themeChanged = !this.themeInitialized || nextThemeMode !== this.options.themeMode || nextCustomTheme !== this.options.customTheme;

        if (themeChanged) {
            this.themeManager.apply(nextThemeMode, nextCustomTheme);
        }

        this.options = { ...this.options, ...options };
        this.themeInitialized = true;

        this.localization.locale = this.options.locale;
        this.localization.customTranslations = this.options.translations;
        this.bentoLocalization.locale = this.options.locale;

        if (environmentChanged) {
            this.applyEnvironmentAssets();
        } else if (loadingContextChanged) {
            const { apiUrl } = this.resolveEnvironment();
            this.loadingContext = this.options.loadingContext || process.env.VITE_APP_LOADING_CONTEXT || apiUrl;
        }

        if (analyticsChanged) {
            this.applyAnalyticsOptions();
        }

        this.session.loadingContext = this.loadingContext;
        this.session.onSessionCreate = this.options.onSessionCreate;

        return this;
    }

    private applyEnvironmentAssets(): void {
        const { apiUrl, cdnAssetsUrl, cdnConfigUrl } = this.resolveEnvironment();
        this.loadingContext = this.options.loadingContext || process.env.VITE_APP_LOADING_CONTEXT || apiUrl;
        this.getCdnConfig = getConfigFromCdn({ url: cdnConfigUrl });
        this.getCdnDataset = getDatasetFromCdn({ url: `${cdnAssetsUrl}/datasets` });
        this.getImageAsset = new Assets(cdnAssetsUrl).getAsset({ extension: 'svg', subFolder: 'images' });
        this.getDatasetAsset = new Assets(cdnAssetsUrl).getAsset({ extension: 'json', mainFolder: 'datasets' });
    }

    private applyAnalyticsOptions(): void {
        this.analyticsEnabled = this.options.analytics?.enabled ?? true;
        this.session.analyticsEnabled = this.analyticsEnabled;
    }

    public get i18n(): I18n {
        return this.localization.i18n;
    }

    /**
     * Emit the SSR warning at most once, await translation readiness, and register
     * the custom-translations analytics payload on the session.
     */
    public async initialize(): Promise<this> {
        if (!this.hasWarnedAboutServerSideInitialization && shouldWarnAboutServerSideInitialization()) {
            console.warn(SERVER_SIDE_INITIALIZATION_WARNING);
            this.hasWarnedAboutServerSideInitialization = true;
        }

        await Promise.all([this.localization.ready, this.bentoLocalization.ready]);

        if (!this.readyCustomTranslationsAnalytics && this.analyticsEnabled) {
            const analyticsPayload = getCustomTranslationsAnalyticsPayload(this.localization.i18n.customTranslations);
            if (analyticsPayload.length > 0) {
                this.session.analyticsPayload = analyticsPayload;
                this.readyCustomTranslationsAnalytics = true;
            }
        }

        return this;
    }

    /**
     * Apply a partial options patch, re-initialize, and propagate the update to
     * every registered component that belongs to this Core instance.
     */
    public async update(options: Partial<CoreOptions<CustomTranslations>> = EMPTY_OBJECT as Partial<CoreOptions<CustomTranslations>>): Promise<this> {
        this.setOptions(options);

        const optionKeys = Object.keys(options);
        const hasOnlyThemeOptions = optionKeys.length > 0 && optionKeys.every(option => option === 'themeMode' || option === 'customTheme');
        if (hasOnlyThemeOptions) return this;

        await this.initialize();

        this.components.forEach(component => {
            if (component.core === this) {
                component.update(this.options);
            }
        });

        return this;
    }

    /**
     * Remove the reference of a component
     * @param component - reference to the component to be removed
     * @returns this - the element instance
     */
    public remove(component: ManagedElement): this {
        this.components = this.components.filter(c => c._id !== component._id);
        component.unmount();
        return this;
    }

    /**
     * @internal
     * Register components in core to be able to update them all at once
     */
    public registerComponent(component: ManagedElement) {
        if (component.core === this) {
            this.components.push(component);
        }
    }

    public registerThemeRoot(root: Element): void {
        this.themeManager.register(root);
    }

    public unregisterThemeRoot(root: Element): void {
        this.themeManager.unregister(root);
    }
}

export default Core;
