import type { CoreOptions } from './types';
import type { I18n } from './Context/types';
import { createI18n } from './Context/i18n';
import { AuthSession } from './ConfigContext/session/AuthSession';
import { FALLBACK_ENV, resolveEnvironment, getConfigFromCdn, getDatasetFromCdn } from './utils';
import { EMPTY_OBJECT } from '../utils';

export class Core {
    public options: CoreOptions;
    public i18n: I18n;
    public loadingContext: string;
    public analyticsEnabled: boolean;
    public session = new AuthSession();
    public getCdnConfig: <Fallback>(props: { name: string; extension?: string; subFolder?: string; fallback?: Fallback }) => Promise<Fallback>;
    public getCdnDataset: <Fallback>(props: { name: string; extension?: string; subFolder?: string; fallback?: Fallback }) => Promise<Fallback>;

    constructor(options: CoreOptions) {
        this.options = { environment: FALLBACK_ENV, ...options };
        const { apiUrl, cdnAssetsUrl, cdnConfigUrl, cdnTranslationsUrl } = resolveEnvironment(this.options.environment);

        this.i18n = createI18n(options.locale || 'en-US', cdnTranslationsUrl);
        this.loadingContext = options.loadingContext || process.env.VITE_APP_LOADING_CONTEXT || apiUrl;
        this.analyticsEnabled = options.analytics?.enabled ?? true;
        this.session.analyticsEnabled = this.analyticsEnabled;
        this.getCdnConfig = getConfigFromCdn({ url: cdnConfigUrl });
        this.getCdnDataset = getDatasetFromCdn({ url: `${cdnAssetsUrl}/datasets` });
        this.setOptions(options);
    }

    async initialize(): Promise<this> {
        await this.i18n.ready;
        return this;
    }

    public update = async (options: Partial<CoreOptions> = EMPTY_OBJECT as Partial<CoreOptions>): Promise<this> => {
        this.setOptions(options);
        await this.initialize();
        return this;
    };

    private setOptions = (options: Partial<CoreOptions>): this => {
        this.options = { ...this.options, ...options };

        if (options.locale) {
            const { cdnTranslationsUrl } = resolveEnvironment(this.options.environment);
            this.i18n = createI18n(options.locale, cdnTranslationsUrl);
        }

        this.session.loadingContext = this.loadingContext;
        this.session.onSessionCreate = this.options.onSessionCreate;

        return this;
    };
}
