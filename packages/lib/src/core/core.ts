import { DevEnvironment, SessionRequest } from './types';
import type { CoreOptions } from './types';
import { resolveEnvironment } from './utils';
import Localization from './Localization';
import BaseElement from '../components/external/BaseElement';
import { EMPTY_OBJECT } from '../primitives/utils';

const FALLBACK_ENV = 'test' satisfies DevEnvironment;

class Core<T extends CoreOptions<T> = any> {
    public static readonly version = {
        version: process.env.VITE_VERSION,
        revision: process.env.VITE_COMMIT_HASH,
        branch: process.env.VITE_COMMIT_BRANCH,
        buildId: process.env.VITE_ADYEN_BUILD_ID,
    };
    public modules: any;
    public options: CoreOptions<T>;
    public components: BaseElement<any>[] = [];
    public localization;
    public loadingContext: string;
    public onSessionCreate?: SessionRequest;
    //TODO: Change the error handling strategy.

    constructor(options: CoreOptions<T>) {
        this.options = { environment: FALLBACK_ENV, ...options };

        this.localization = new Localization(options.locale, options.availableTranslations);
        this.loadingContext = process.env.VITE_LOADING_CONTEXT ? process.env.VITE_LOADING_CONTEXT : resolveEnvironment(this.options.environment);
        this.setOptions(options);
    }

    async initialize(): Promise<this> {
        return Promise.all([this.localization.ready]).then(() => this);
    }

    /**
     * Updates global configurations, resets the internal state and remounts each element.
     * @param options - props to update
     * @returns this - the element instance
     */
    public update = async (options: Partial<CoreOptions<T>> = EMPTY_OBJECT): Promise<this> => {
        this.setOptions(options);

        await this.initialize();
        // Update each component under this instance
        this.components.forEach(c => c.update(this.getPropsForComponent(this.options)));

        return this;
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
     * Enhances the config object passed when AdyenPlatformExperience is initialised (environment, clientKey, etc...)
     * (Re)Initializes core properties & processes (i18n, etc...)
     * @param options - the config object passed when AdyenPlatformExperience is initialised
     * @returns this
     */
    private setOptions = (options: Partial<CoreOptions<T>>): this => {
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
            loadingContext: this.loadingContext,
            _parentInstance: this,
        };
    }
}

export default Core;
