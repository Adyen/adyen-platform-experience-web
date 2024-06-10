import type { CoreOptions } from './types';
import type { LangFile } from './Localization/types';
import { FALLBACK_ENV, resolveEnvironment } from './utils';
import Session from './Session';
import Localization from './Localization';
import BaseElement from '../components/external/BaseElement';
import { EMPTY_OBJECT } from '../utils';

class Core<AvailableTranslations extends LangFile[]> {
    public static readonly version = process.env.VITE_VERSION!;

    public components: BaseElement<any>[] = [];
    public options: CoreOptions<AvailableTranslations>;

    public localization: Localization;
    public loadingContext: string;

    public isUpdatingSessionToken?: boolean;
    public onSessionCreate?: (typeof this.options)['onSessionCreate'];
    public sessionSetupError?: boolean;
    public session?: Session;

    // [TODO]: Change the error handling strategy.

    constructor(options: CoreOptions<AvailableTranslations>) {
        this.options = { environment: FALLBACK_ENV, ...options };

        this.isUpdatingSessionToken = false;
        this.localization = new Localization(options.locale, options.availableTranslations);
        this.loadingContext = process.env.VITE_LOADING_CONTEXT ? process.env.VITE_LOADING_CONTEXT : resolveEnvironment(this.options.environment);
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
            if (this.options.onSessionCreate && !this.isUpdatingSessionToken) {
                this.isUpdatingSessionToken = true;
                this.session = new Session(await this.options.onSessionCreate(), this.loadingContext!);
                await this.session?.setupSession(this.options);
                await this.update({});
                this.isUpdatingSessionToken = false;
                return this;
            }
        } catch (error) {
            if (this.options.onError) this.options.onError(error);
            //TODO: this is heavy change the way to update core
            this.sessionSetupError = true;
            await this.update();
            this.isUpdatingSessionToken = false;
            return this;
        }
    };

    /**
     * Updates global configurations, resets the internal state and remounts each element.
     * @param options - props to update
     * @param initSession - should session be initiated again
     * @returns this - the element instance
     */
    public update = (options: Partial<typeof this.options> = EMPTY_OBJECT, initSession = false): Promise<this> => {
        this.setOptions(options);

        return this.initialize(initSession).then(() => {
            this.components.forEach(component => {
                if (component.props.core === this) {
                    // Update each component under this instance
                    component.update(this.getPropsForComponent(this.options));
                }
            });

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
        this.onSessionCreate = this.options.onSessionCreate;

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
