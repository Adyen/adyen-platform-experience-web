import UIElement from '../components/external/UIElement';
import components from '../components';
import type { CoreOptions } from './types';
import { processGlobalOptions, resolveEnvironment } from './utils';
import BPSession from './FPSession';
import Localization from './Localization';
import BaseElement from '../components/external/BaseElement';
import { ComponentMap, ComponentOptions, isAvailableOfComponent, isKeyOfComponent } from './types';
import { ValueOf } from '../utils/types';

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
    public localization = new Localization();
    public loadingContext?: string;

    constructor(options: CoreOptions) {
        this.create = this.create.bind(this);
        this.options = options;
        this.setOptions(options);
        this.loadingContext = this.options.loadingContext ?? resolveEnvironment(this.options.environment);
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
     * Instantiates a new UIElement component ready to be mounted
     *
     * @param component - either the name of the component or a class
     *
     * @param options - an object with
     *
     * @returns new UIElement
     */

    public create<ComponentName extends keyof ComponentMap>(
        component: ComponentName,
        options: ComponentOptions<ComponentName>
    ): InstanceType<ComponentMap[ComponentName]>;
    public create<T extends ValueOf<ComponentMap>, P extends ConstructorParameters<T>>(component: T, options: P[0]): InstanceType<T>;
    public create(component: any, options?: any): any {
        if (typeof component === 'string') {
            const props = this.getPropsForComponent(options);
            return isKeyOfComponent(component) ? this.handleCreate<typeof component>(component, props) : this.handleCreateError();
        } else {
            const props = this.getPropsForComponent(options);
            return component ? this.handleCreate<typeof component>(component, props) : this.handleCreateError();
        }
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

    /**
     * @internal
     * A recursive creation function that finalises by calling itself with a reference to a valid component class which it then initialises
     *
     * @param Component - type varies:
     *  - string
     *  - class
     *
     * @param options - an object with options to be applied to the component
     *
     * @returns new UIElement
     */
    private handleCreate<T extends keyof ComponentMap>(Component: keyof ComponentMap, options: any): ComponentMap[T];
    private handleCreate<T extends ValueOf<ComponentMap>>(Component: T, options: any): InstanceType<T>;
    private handleCreate(Component: any, options: any = {}): any {
        const isValidClass = Component.prototype instanceof UIElement;
        /**
         * Usual initial point of entry to this function (Component is a String).
         * When Component is defined as a string - retrieve a component from the componentsMap and recall this function passing in a valid class
         */
        if (typeof Component === 'string' && isKeyOfComponent(Component)) {
            return this.handleCreate<ComponentMap[typeof Component]>(components[Component], { type: Component, ...options });
        }

        /**
         * Final entry point (Component is a Class):
         * Once we receive a valid class for a Component - create a new instance of it
         */
        if (isValidClass && isAvailableOfComponent(Component)) {
            /**
             * Find which creation scenario we are in - we need to know when we're creating a Dropin, a PM within the Dropin, or a standalone stored card.
             */
            // Filtered global options
            const globalOptions = processGlobalOptions(this.options);

            /**
             * Merge:
             * 1. global options (a subset of the original config object sent when AdyenFP is initialised)
             * 2. the options that have been passed to the final call of this function (see comment on \@param, above)
             */
            const component = new Component({ ...globalOptions, ...options });
            return component;
        }

        return this.handleCreateError(Component);
    }

    /**
     * @internal
     */
    private handleCreateError(component?: ValueOf<ComponentMap>): never {
        const componentName = component?.name || 'The passed component';
        const errorMessage = component ? `${componentName} is not a valid component` : 'No component was passed';

        throw new Error(errorMessage);
    }
}

export default Core;
