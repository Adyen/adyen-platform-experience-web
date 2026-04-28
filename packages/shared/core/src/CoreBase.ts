import { EMPTY_OBJECT } from '@integration-components/utils';
import { AuthSession } from './session/AuthSession';
import { FALLBACK_ENV, getConfigFromCdn, getDatasetFromCdn, resolveEnvironment } from './utils';
import type { SessionRequest } from './ConfigContext.types';
import type { AnalyticsConfig, DevEnvironment, onErrorHandler } from './types';

/**
 * Minimal options surface shared by every Core subclass (Preact / Vue / future frameworks).
 * Framework-specific Cores extend this with translations / availableTranslations / etc.
 */
export interface CoreOptionsBase {
    environment?: DevEnvironment;
    locale?: string;
    onSessionCreate: SessionRequest;
    onError?: onErrorHandler;
    analytics?: AnalyticsConfig;
    loadingContext?: string;
}

export interface ResolvedEnvironment {
    apiUrl: string;
    cdnTranslationsUrl: string;
    cdnAssetsUrl: string;
    cdnConfigUrl: string;
}

export type CdnFetcher = <Fallback>(props: { name: string; extension?: string; subFolder?: string; fallback?: Fallback }) => Promise<Fallback>;

/**
 * Framework-agnostic base for the Core runtime. Concentrates everything that has no
 * dependency on Preact or Vue: option resolution, environment, session wiring, CDN helpers
 * and the generic `update()` lifecycle.
 *
 * Subclasses are responsible for:
 *  - constructing their localization / i18n implementation
 *  - awaiting it inside `initialize()`
 *  - reacting to locale (and other) option changes inside `onOptionsChanged()`
 *  - invoking `this.setOptions(options)` once their localization is ready (typically at the
 *    end of their constructor)
 */
export abstract class CoreBase<O extends CoreOptionsBase = CoreOptionsBase> {
    public options: O;
    public loadingContext: string;
    public analyticsEnabled: boolean;
    public session = new AuthSession();
    public getCdnConfig: CdnFetcher;
    public getCdnDataset: CdnFetcher;

    protected constructor(options: O) {
        this.options = { environment: FALLBACK_ENV, ...options } as O;
        const { apiUrl, cdnAssetsUrl, cdnConfigUrl } = this.resolveEnvironment();

        this.loadingContext = options.loadingContext || process.env.VITE_APP_LOADING_CONTEXT || apiUrl;
        this.analyticsEnabled = options.analytics?.enabled ?? true;
        this.session.analyticsEnabled = this.analyticsEnabled;
        this.getCdnConfig = getConfigFromCdn({ url: cdnConfigUrl });
        this.getCdnDataset = getDatasetFromCdn({ url: `${cdnAssetsUrl}/datasets` });
    }

    /**
     * Re-resolve environment URLs from the current `options.environment`.
     */
    protected resolveEnvironment(): ResolvedEnvironment {
        return resolveEnvironment(this.options.environment);
    }

    /**
     * Merge incoming options, propagate locale-dependent state via `onOptionsChanged`,
     * and re-wire the session.
     */
    protected setOptions(options: Partial<O>): this {
        this.options = { ...this.options, ...options };

        this.onOptionsChanged(options);

        this.session.loadingContext = this.loadingContext;
        this.session.onSessionCreate = this.options.onSessionCreate;

        return this;
    }

    /**
     * Subclass hook: react to option changes (e.g. update locale on `localization` / `i18n`).
     * Called from `setOptions` *after* `this.options` has been merged.
     */
    protected abstract onOptionsChanged(options: Partial<O>): void;

    /**
     * Subclasses must override to await any async readiness (translations, etc.).
     */
    public abstract initialize(): Promise<this>;

    /**
     * Apply a partial options patch and re-initialize. Subclasses can override
     * to add extra behavior (e.g. remounting registered components).
     */
    public update = async (options: Partial<O> = EMPTY_OBJECT as Partial<O>): Promise<this> => {
        this.setOptions(options);
        await this.initialize();
        return this;
    };
}

export default CoreBase;
