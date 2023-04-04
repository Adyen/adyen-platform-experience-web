import UIElement from '../components/UIElement';
import components from '../components';
import { Components } from '../types';
import { CoreOptions } from './types';
import { processGlobalOptions } from './utils';
import BPSession from './FPSession';
import Language from '../language';
import BaseElement from '../components/BaseElement';

class Core {
    public static readonly version = {
        version: process.env.VERSION,
        revision: process.env.COMMIT_HASH,
        branch: process.env.COMMIT_BRANCH,
        buildId: process.env.ADYEN_BUILD_ID,
    };
    public session?: BPSession;
    public modules: any;
    public options?: CoreOptions;
    public components: BaseElement<any>[] = [];

    constructor(options: CoreOptions) {
        this.create = this.create.bind(this);
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

        // return Promise.resolve(this);
        return Promise.resolve(this);
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
    public create<T extends keyof Components>(component: T, options?): InstanceType<Components[T]>;
    public create<T extends new (...args: any) => T, P extends ConstructorParameters<T>>(component: T, options?: P[0]): T;
    public create(component: string, options?);
    public create(component: any, options?: any): any {
        const props = this.getPropsForComponent(options);
        return component ? this.handleCreate(component, props) : this.handleCreateError();
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
    public remove = (component): this => {
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
    private setOptions = (options): this => {
        this.options = { ...this.options, ...options };
        this.modules = {
            // analytics: new Analytics(this.options),
            i18n: new Language(this.options?.locale, this.options?.translations),
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
    private getPropsForComponent(options) {
        return {
            ...options,
            i18n: this.modules.i18n,
            modules: this.modules,
            session: this.session,
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
    private handleCreate(Component, options: any = {}): UIElement {
        const isValidClass = Component.prototype instanceof UIElement;

        /**
         * Final entry point (Component is a Class):
         * Once we receive a valid class for a Component - create a new instance of it
         */
        if (isValidClass) {
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

        /**
         * Usual initial point of entry to this function (Component is a String).
         * When Component is defined as a string - retrieve a component from the componentsMap and recall this function passing in a valid class
         */
        if (typeof Component === 'string' && components[Component]) {
            return this.handleCreate(components[Component], { type: Component, ...options });
        }

        return this.handleCreateError(Component);
    }

    /**
     * @internal
     */
    private handleCreateError(component?): never {
        const componentName = component?.name || 'The passed component';
        const errorMessage = component ? `${componentName} is not a valid component` : 'No component was passed';

        throw new Error(errorMessage);
    }
}

export default Core;
