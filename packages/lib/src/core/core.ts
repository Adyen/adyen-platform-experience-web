import { SessionRequest } from './types';
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
    public loadingContext: string;
    public onSessionCreate?: SessionRequest;
    //TODO: Change the error handling strategy.
    public sessionSetupError?: boolean;

    constructor(options: CoreOptions<T>) {
        this.options = options;
        this.localization = new Localization(options.locale, options.availableTranslations);
        this.loadingContext = process.env.VITE_LOADING_CONTEXT || resolveEnvironment(this.options.environment);
        this.setOptions(options);
    }

    async initialize(initSession = false): Promise<this> {
        if (!this.sessionSetupError && (initSession || (!this.session && this.onSessionCreate))) {
            await this.updateSession();
        }

        return Promise.all([this.localization.ready]).then(() => this);
    }

    public updateSession = async () => {
        try {
            if (this.options.onSessionCreate) {
                this.session = new Session(await this.options.onSessionCreate(), this.loadingContext!);
                await this.session?.setupSession(this.options);
                await this.update({});
                return this;
            }
        } catch (error) {
            if (this.options.onError) this.options.onError(error);
            //TODO: this is heavy change the way to update core
            this.sessionSetupError = true;
            this.update();
            return this;
        }
    };

    /**
     * Updates global configurations, resets the internal state and remounts each element.
     * @param options - props to update
     * @param initSession - should session be initiated again
     * @returns this - the element instance
     */
    public update = (options: CoreOptions<T> = {}, initSession = false): Promise<this> => {
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

        this.localization.locale = this.options?.locale;
        this.localization.customTranslations = this.options?.translations;
        this.localization.timezone = this.options?.timezone;
        this.onSessionCreate = this.options.onSessionCreate;
        this.modules = {
            // analytics: new Analytics(this.options),
            i18n: this.localization.i18n,
        };

        // Check for clientKey/environment mismatch
        // const clientKeyType = this.options?.clientKey?.substring(0, 3) ?? '';
        // if (['test', 'live'].includes(clientKeyType) && !this.loadingContext?.includes(clientKeyType)) {
        //     throw new Error(`Error: you are using a ${clientKeyType} clientKey against the ${this.options?.environment} environment`);
        // }

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
