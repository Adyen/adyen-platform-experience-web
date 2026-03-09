import type { CoreOptions, CoreInstance } from './types';
import type { I18n } from './Context/types';
import { createI18n } from './Context/i18n';
import { FALLBACK_ENV, resolveEnvironment, getConfigFromCdn, getDatasetFromCdn } from './utils';

export class Core implements CoreInstance {
    public options: CoreOptions;
    public i18n: I18n;
    public loadingContext: string;
    public analyticsEnabled: boolean;
    public session: { id: string; token: string } | null = null;
    public getCdnConfig: <Fallback>(props: { name: string; extension?: string; subFolder?: string; fallback?: Fallback }) => Promise<Fallback>;
    public getCdnDataset: <Fallback>(props: { name: string; extension?: string; subFolder?: string; fallback?: Fallback }) => Promise<Fallback>;

    constructor(options: CoreOptions) {
        this.options = { environment: FALLBACK_ENV, ...options };
        const { apiUrl, cdnAssetsUrl, cdnConfigUrl, cdnTranslationsUrl } = resolveEnvironment(this.options.environment);

        this.i18n = createI18n(options.locale || 'en-US', cdnTranslationsUrl);
        this.loadingContext = options.loadingContext || process.env.VITE_APP_LOADING_CONTEXT || apiUrl;
        this.analyticsEnabled = options.analytics?.enabled ?? true;
        this.getCdnConfig = getConfigFromCdn({ url: cdnConfigUrl });
        this.getCdnDataset = getDatasetFromCdn({ url: `${cdnAssetsUrl}/datasets` });
    }

    async initialize(): Promise<this> {
        await this.i18n.ready;

        if (this.options.onSessionCreate) {
            try {
                this.session = await this.options.onSessionCreate();
            } catch (error) {
                if (this.options.onError) {
                    this.options.onError(error as Error);
                }
                console.error('Failed to create session:', error);
            }
        }

        return this;
    }

    public update = async (options: Partial<CoreOptions> = {}): Promise<this> => {
        this.options = { ...this.options, ...options };

        if (options.locale) {
            const { cdnTranslationsUrl } = resolveEnvironment(this.options.environment);
            this.i18n = createI18n(options.locale, cdnTranslationsUrl);
        }

        await this.initialize();
        return this;
    };
}

export default Core;
