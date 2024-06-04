import type { CoreOptions } from './types';
import type { LangFile } from './Localization/types';
import { FALLBACK_ENV, resolveEnvironment } from './utils';
import { AuthSession } from './Auth/session/AuthSession';
import BaseElement from '../components/external/BaseElement';
import Localization from './Localization';
import { EMPTY_OBJECT } from '../utils';

class Core<AvailableTranslations extends LangFile[]> {
    public static readonly version = process.env.VITE_VERSION!;

    public components: BaseElement<any>[] = [];
    public options: CoreOptions<AvailableTranslations>;

    public localization: Localization;
    public loadingContext: string;
    public session = new AuthSession();

    // [TODO]: Change the error handling strategy.

    constructor(options: CoreOptions<AvailableTranslations>) {
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
    public update = async (options: Partial<typeof this.options> = EMPTY_OBJECT): Promise<this> => {
        this.setOptions(options);
        await this.initialize();

        this.components.forEach(component => {
            if (component.props.core === this) {
                // Update each component under this instance
                component.update(this.getPropsForComponent(this.options));
            }
        });

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
        if (component.props.core === this) {
            this.components.push(component);
        }
    };

    /**
     * @internal
     * Enhances the config object passed when AdyenPlatformExperience is initialised (environment, clientKey, etc...)
     * (Re)Initializes core properties & processes (i18n, etc...)
     * @param options - the config object passed when AdyenPlatformExperience is initialised
     * @returns this
     */
    private setOptions = (options: Partial<typeof this.options>): this => {
        this.options = { ...this.options, ...options };

        this.localization.locale = this.options?.locale;
        this.localization.customTranslations = this.options?.translations;

        this.session.loadingContext = this.loadingContext;
        this.session.onSessionCreate = this.options.onSessionCreate;

        return this;
    };

    /**
     * @internal
     * @param options - options that will be merged to the global Checkout props
     * @returns props for a new UIElement
     */
    private getPropsForComponent(options: any) {
        return { ...options };
    }
}

export default Core;
