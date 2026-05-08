import { EMPTY_OBJECT } from '@integration-components/utils';
import { AuthSession } from './session/AuthSession';
import Localization from './Localization';
import { Assets, AssetOptions } from './Assets/Assets';
import { getCustomTranslationsAnalyticsPayload } from './EventDispatcher/eventDispatcher/customTranslations';
import { SERVER_SIDE_INITIALIZATION_WARNING, shouldWarnAboutServerSideInitialization } from './runtime';
import { FALLBACK_ENV, getConfigFromCdn, getDatasetFromCdn, resolveEnvironment } from './utils';
import type { SessionRequest } from './ConfigContext.types';
import type { AnalyticsConfig, DevEnvironment, onErrorHandler } from './types';
import type { CustomTranslations as Translations, TranslationSourceRecord } from '../../../../src/translations';

/**
 * Minimal contract that framework-specific element classes (Preact BaseElement,
 * Vue UIElement, ...) must satisfy so Core can manage them uniformly.
 */
export interface ManagedElement {
    readonly _id: string;
    readonly core: unknown;
    update(props: any): any;
    unmount(): any;
}

/**
 * Minimal options surface shared by every Core subclass (Preact / Vue / future frameworks).
 * Framework-specific Cores can extend this to refine `locale` typing, etc.
 */
export interface CoreOptionsBase {
    environment?: DevEnvironment;
    locale?: string;
    onSessionCreate: SessionRequest;
    onError?: onErrorHandler;
    analytics?: AnalyticsConfig;
    loadingContext?: string;
    availableTranslations?: TranslationSourceRecord[];
    translations?: Translations;
}

export interface ResolvedEnvironment {
    apiUrl: string;
    cdnTranslationsUrl: string;
    cdnAssetsUrl: string;
    cdnConfigUrl: string;
}

export type CdnFetcher = <Fallback>(props: { name: string; extension?: string; subFolder?: string; fallback?: Fallback }) => Promise<Fallback>;

/**
 * Framework-agnostic source of truth for the Core runtime. Owns option resolution,
 * environment, session wiring, the shared `Localization` instance, asset getters, CDN
 * helpers, the component registry, and the generic `initialize()` / `update()` lifecycle.
 *
 * Framework-specific rendering / mounting / unmounting lives in the element classes
 * (Preact `BaseElement`, Vue `UIElement`, ...), not here.
 */
export class Core<O extends CoreOptionsBase = CoreOptionsBase> {
    public static readonly version = process.env.SDK_VERSION!;
    public options: O;
    public loadingContext: string;
    public analyticsEnabled: boolean;
    public session = new AuthSession();
    public localization: Localization;
    public onError?: onErrorHandler;
    public getImageAsset: (props: AssetOptions) => string;
    public getDatasetAsset: (props: AssetOptions) => string;
    public getCdnConfig: CdnFetcher;
    public getCdnDataset: CdnFetcher;
    public components: ManagedElement[] = [];

    private hasWarnedAboutServerSideInitialization = false;
    private readyCustomTranslationsAnalytics = false;

    constructor(options: O) {
        this.options = { environment: FALLBACK_ENV, ...options } as O;
        const { apiUrl, cdnTranslationsUrl, cdnAssetsUrl, cdnConfigUrl } = this.resolveEnvironment();

        this.loadingContext = this.options.loadingContext || process.env.VITE_APP_LOADING_CONTEXT || apiUrl;
        this.analyticsEnabled = this.options.analytics?.enabled ?? true;
        this.session.analyticsEnabled = this.analyticsEnabled;
        this.getCdnConfig = getConfigFromCdn({ url: cdnConfigUrl });
        this.getCdnDataset = getDatasetFromCdn({ url: `${cdnAssetsUrl}/datasets` });

        this.localization = new Localization(this.options.locale, this.options.availableTranslations, cdnTranslationsUrl, cdnConfigUrl);
        this.getImageAsset = new Assets(cdnAssetsUrl).getAsset({ extension: 'svg', subFolder: 'images' });
        this.getDatasetAsset = new Assets(cdnAssetsUrl).getAsset({ extension: 'json', mainFolder: 'datasets' });

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
     * `Localization`, hand off to the subclass hook, then sync the session.
     */
    protected setOptions(options: Partial<O>): this {
        const environmentChanged = options.environment !== undefined && options.environment !== this.options.environment;
        const loadingContextChanged = options.loadingContext !== undefined && options.loadingContext !== this.options.loadingContext;
        const analyticsChanged = options.analytics !== undefined && options.analytics !== this.options.analytics;

        this.options = { ...this.options, ...options };

        this.localization.locale = this.options.locale;
        this.localization.customTranslations = this.options.translations;

        if (environmentChanged) {
            const { apiUrl, cdnAssetsUrl, cdnConfigUrl } = this.resolveEnvironment();

            this.loadingContext = this.options.loadingContext || process.env.VITE_APP_LOADING_CONTEXT || apiUrl;
            this.getCdnConfig = getConfigFromCdn({ url: cdnConfigUrl });
            this.getCdnDataset = getDatasetFromCdn({ url: `${cdnAssetsUrl}/datasets` });
            this.getImageAsset = new Assets(cdnAssetsUrl).getAsset({ extension: 'svg', subFolder: 'images' });
            this.getDatasetAsset = new Assets(cdnAssetsUrl).getAsset({ extension: 'json', mainFolder: 'datasets' });
        } else if (loadingContextChanged) {
            const { apiUrl } = this.resolveEnvironment();
            this.loadingContext = this.options.loadingContext || process.env.VITE_APP_LOADING_CONTEXT || apiUrl;
        }

        if (analyticsChanged) {
            this.analyticsEnabled = this.options.analytics?.enabled ?? true;
            this.session.analyticsEnabled = this.analyticsEnabled;
        }

        this.onOptionsChanged?.(options);

        this.session.loadingContext = this.loadingContext;
        this.session.onSessionCreate = this.options.onSessionCreate;

        return this;
    }

    public get i18n() {
        return this.localization.i18n;
    }

    /**
     * Optional subclass hook for framework-specific reactions to option changes
     * (e.g. rebuilding env-bound assets when `options.environment` changes).
     * Called from `setOptions` *after* `this.options` has been merged and shared
     * localization state has been refreshed.
     */
    protected onOptionsChanged?(options: Partial<O>): void;

    /**
     * Emit the SSR warning at most once, await translation readiness, and register
     * the custom-translations analytics payload on the session.
     */
    public async initialize(): Promise<this> {
        if (!this.hasWarnedAboutServerSideInitialization && shouldWarnAboutServerSideInitialization()) {
            console.warn(SERVER_SIDE_INITIALIZATION_WARNING);
            this.hasWarnedAboutServerSideInitialization = true;
        }

        await this.localization.ready;

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
    public async update(options: Partial<O> = EMPTY_OBJECT as Partial<O>): Promise<this> {
        this.setOptions(options);
        await this.initialize();

        this.components.forEach(component => {
            if (component.core === this) {
                component.update({ ...this.options });
            }
        });

        return this;
    }

    /**
     * Remove the reference of a component
     * @param component - reference to the component to be removed
     * @returns this - the element instance
     */
    public remove = (component: ManagedElement): this => {
        this.components = this.components.filter(c => c._id !== component._id);
        component.unmount();
        return this;
    };

    /**
     * @internal
     * Register components in core to be able to update them all at once
     */
    public registerComponent = (component: ManagedElement) => {
        if (component.core === this) {
            this.components.push(component);
        }
    };
}

export default Core;
