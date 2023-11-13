import type { CoreOptions } from './types';
import { resolveEnvironment } from './utils';
import BPSession from './FPSession';
import Localization from './Localization';
import BaseElement from '../components/external/BaseElement';

class Core {
    public static readonly version = {
        version: process.env.VITE_VERSION,
        revision: process.env.VITE_COMMIT_HASH,
        branch: process.env.VITE_COMMIT_BRANCH,
        buildId: process.env.VITE_ADYEN_BUILD_ID,
    };
    public session?: BPSession;
    public modules: any;
    public options: CoreOptions;
    public components: BaseElement<any>[] = [];
    public localization;
    public loadingContext?: string;

    constructor(options: CoreOptions) {
        this.options = options;
        this.localization = new Localization(options.locale, options.availableTranslations);
        this.setOptions(options);
    }

    initialize(): Promise<this> {
        // TODO: Enable once we have sessions working
        // if (this.options.session) {
        //     this.session = new Session(this.options.session, this.options.clientKey, this.options.loadingContext);

        //     return this.session
        //         .setupSession(this.options)
        //         .then(sessionResponse => {
        //             this.setOptions(sessionResponse);
        //             return this;
        //         })
        //         .catch(error => {
        //             if (this.options.onError) this.options.onError(error);
        //             return this;
        //         });
        // }

        return Promise.all([this.localization.ready]).then(() => this);
    }

    /**
     * Updates global configurations, resets the internal state and remounts each element.
     * @param options - props to update
     * @returns this - the element instance
     */
    public update = (options: CoreOptions = {}): Promise<this> => {
        this.setOptions(options);

        return this.initialize().then(() => {
            // Update each component under this instance
            this.components.forEach(c => c.update(this.getPropsForComponent(this.options)));

            return this;
        });
    };

    /**
     * Remove the reference of a component
     * @param component - reference to the component to be removed
     * @returns this - the element instance
     */
    public remove = (component: BaseElement<any>): this => {
        this.components = this.components.filter(c => c._id !== component._id);
        component.unmount();

        return this;
    };

    /**
     * @internal
     * Enhances the config object passed when AdyenFP is initialised (environment, clientKey, etc...)
     * (Re)Initializes core properties & processes (i18n, etc...)
     * @param options - the config object passed when AdyenFP is initialised
     * @returns this
     */
    private setOptions = (options: CoreOptions): this => {
        this.options = { ...this.options, ...options };
        this.loadingContext = this.options.loadingContext ?? resolveEnvironment(this.options.environment);

        this.localization.locale = this.options?.locale;
        this.localization.customTranslations = this.options?.translations;
        this.localization.timezone = this.options?.timezone;

        this.modules = {
            // analytics: new Analytics(this.options),
            i18n: this.localization.i18n,
        };

        // Check for clientKey/environment mismatch
        const clientKeyType = this.options?.clientKey?.substring(0, 3) ?? '';
        if (['test', 'live'].includes(clientKeyType) && !this.options?.loadingContext?.includes(clientKeyType)) {
            throw new Error(`Error: you are using a ${clientKeyType} clientKey against the ${this.options?.environment} environment`);
        }

        return this;
    };

    /**
     * @internal
     * @param options - options that will be merged to the global Checkout props
     * @returns props for a new UIElement
     */
    private getPropsForComponent(options: any) {
        return {
            ...options,
            i18n: this.modules.i18n,
            modules: this.modules,
            session: this.session,
            loadingContext: this.loadingContext,
            _parentInstance: this,
        };
    }
}

export default Core;
