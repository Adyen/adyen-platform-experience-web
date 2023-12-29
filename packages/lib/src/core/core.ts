import { SessionResponse } from '@src/core/Session/types';
import type { CoreOptions } from './types';
import { resolveEnvironment } from './utils';
import Session from './Session';
import Localization from './Localization';
import BaseElement from '../components/external/BaseElement';

class Core<T extends CoreOptions<T> = any> {
    public static readonly version = {
        version: process.env.VITE_VERSION,
        revision: process.env.VITE_COMMIT_HASH,
        branch: process.env.VITE_COMMIT_BRANCH,
        buildId: process.env.VITE_ADYEN_BUILD_ID,
    };
    public session?: Session;
    public modules: any;
    public options: CoreOptions<T>;
    public components: BaseElement<any>[] = [];
    public localization;
    public loadingContext?: string;
    public onSessionCreate?: any;
    public error?: boolean;

    constructor(options: CoreOptions<T>) {
        this.options = options;
        this.localization = new Localization(options.locale, options.availableTranslations);
        this.setOptions(options);
    }

    async initialize(initSession: boolean = false): Promise<this> {
        if (!this.error && (initSession || (!this.session && this.onSessionCreate))) {
            await this.updateSession();
        }

        return Promise.all([this.localization.ready]).then(() => this);
    }

    public updateSession = async () => {
        try {
            if (this.options.onSessionCreate) {
                const res = await this.options.onSessionCreate();
                const body: SessionResponse = await res.json();
                const { id, token } = body;
                this.session = new Session(
                    { id: id, token: token },
                    'https://loop-platform-components-external.intapplb-np.nlzwo1o.adyen.com/platform-components-external/'
                );
                await this.session?.setupSession(this.options);
                await this.update({});
                return this;
            }
        } catch (error) {
            if (this.options.onError) this.options.onError(error);
            this.update({ error: true });
            return this;
        }
    };

    /**
     * Updates global configurations, resets the internal state and remounts each element.
     * @param options - props to update
     * @param initSession - should session be initiated again
     * @returns this - the element instance
     */
    public update = (options: CoreOptions<T> = {}, initSession: boolean = false): Promise<this> => {
        this.setOptions(options);

        return this.initialize(initSession).then(() => {
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
     * Register components in core to be able to update them all at once
     */

    public registerComponent = (component: BaseElement<any>) => {
        this.components.push(component);
    };

    /**
     * @internal
     * Enhances the config object passed when AdyenFP is initialised (environment, clientKey, etc...)
     * (Re)Initializes core properties & processes (i18n, etc...)
     * @param options - the config object passed when AdyenFP is initialised
     * @returns this
     */
    private setOptions = (options: CoreOptions<T>): this => {
        this.options = { ...this.options, ...options };
        this.loadingContext = this.options.loadingContext ?? resolveEnvironment(this.options.environment);

        this.localization.locale = this.options?.locale;
        this.localization.customTranslations = this.options?.translations;
        this.localization.timezone = this.options?.timezone;
        this.onSessionCreate = this.options.onSessionCreate;
        this.modules = {
            // analytics: new Analytics(this.options),
            i18n: this.localization.i18n,
        };

        this.error = this.options.error;

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
