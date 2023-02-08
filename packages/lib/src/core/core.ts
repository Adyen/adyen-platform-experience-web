import UIElement from '../components/UIElement';
import components from '../components';
import { Components } from '../types';
import { CoreOptions } from './types';
import { processGlobalOptions } from './utils';
import BPSession from './FPSession';
import Language from '../language';

class Core {
    public static readonly version = {
        version: process.env.VERSION,
        revision: process.env.COMMIT_HASH,
        branch: process.env.COMMIT_BRANCH,
        buildId: process.env.ADYEN_BUILD_ID,
    };
    public session: BPSession;
    public modules: any;
    public options: CoreOptions;
    public components = [];

    constructor(options: CoreOptions) {
        this.create = this.create.bind(this);
        this.setOptions(options);
    }

    initialize(): Promise<this> {
        // if (this.options.session) {
        //     this.session = new Session(this.options.session, this.options.clientKey, this.options.loadingContext);

        //     return this.session
        //         .setupSession(this.options)
        //         .then(sessionResponse => {
        //             const amount = this.options.order ? this.options.order.remainingAmount : sessionResponse.amount;
        //             this.setOptions({ ...sessionResponse, amount });
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
     * @param paymentMethod - either name of the paymentMethod (in theory this can also be a class, but we don't use it this way)
     *  or object extracted from the components response .components or .storedComponents (scenario: Dropin creating components for its PM list)
     *
     * @param options - an object whose form varies, can be:
     *  - the merchant defined config object passed when a component is created via checkout.create
     *  - the Dropin created object from Dropin/components/utils.getCommonProps()
     *  - an object extracted from the components response .storedComponents (scenario: standalone storedCard comp)
     *
     * @returns new UIElement
     */
    public create<T extends keyof Components>(paymentMethod: T, options?): InstanceType<Components[T]>;
    public create<T extends new (...args: any) => T, P extends ConstructorParameters<T>>(paymentMethod: T, options?: P[0]): T;
    public create(paymentMethod: string, options?);
    public create(paymentMethod: any, options?: any): any {
        const props = this.getPropsForComponent(options);
        return paymentMethod ? this.handleCreate(paymentMethod, props) : this.handleCreateError();
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
            i18n: new Language(this.options.locale, this.options.translations),
        };

        // Check for clientKey/environment mismatch
        const clientKeyType = this.options.clientKey?.substring(0, 3);
        if (['test', 'live'].includes(clientKeyType) && !this.options.loadingContext.includes(clientKeyType)) {
            throw new Error(`Error: you are using a ${clientKeyType} clientKey against the ${this.options.environment} environment`);
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
     * @param PaymentMethod - type varies:
     *  - usually a string
     *  - but for Dropin, when it starts creating payment methods, will be a fully formed object from the components response .components or .storedComponents
     *  - always finishes up as a reference to a valid component class
     *
     * @param options - an object whose form varies, it is *always* enhanced with props from this.getPropsForComponent(), and can also be:
     *  - the config object passed when a Component is created via checkout.create('card'|'dropin'|'ideal'|etc..) (scenario: usual first point of entry to this function)
     *  - the internally created props object from Dropin/components/utils.getCommonProps() (scenario: Dropin creating components for its PM list)
     *  - an object extracted from the components response .components or .storedComponents (scenarios: Dropin creating components for its PM list *or* standalone storedCard comp)
     *  - a combination of the previous 2 + the relevant object from the componentsConfiguration (scenario: Dropin creating components for its PM list)
     *
     *
     * @returns new UIElement
     */
    private handleCreate(Component, options: any = {}): UIElement {
        const isValidClass = Component.prototype instanceof UIElement;

        /**
         * Final entry point (PaymentMethod is a Class):
         * Once we receive a valid class for a Component - create a new instance of it
         */
        if (isValidClass) {
            /**
             * Find which creation scenario we are in - we need to know when we're creating a Dropin, a PM within the Dropin, or a standalone stored card.
             */
            const needsConfigData = options.type !== 'dropin' && !options.isDropin;
            const needsPMData = needsConfigData && !options.supportedShopperInteractions;

            // Filtered global options
            const globalOptions = processGlobalOptions(this.options);

            /**
             * Merge:
             * 1. global options (a subset of the original config object sent when AdyenFP is initialised)
             * 2. props defined on the relevant object in the components response (will not have a value for the 'dropin' component)
             * 3. a componentsConfiguration object, if defined at top level (will not have a value for the 'dropin' component)
             * 4. the options that have been passed to the final call of this function (see comment on \@param, above)
             */
            const component = new Component({ ...globalOptions, ...options });

            if (!options.isDropin) {
                this.components.push(component);
            }

            return component;
        }

        /**
         * Usual initial point of entry to this function (PaymentMethod is a String).
         * When PaymentMethod is defined as a string - retrieve a component from the componentsMap and recall this function passing in a valid class
         */
        if (typeof Component === 'string' && components[Component]) {
            return this.handleCreate(components[Component], { type: Component, ...options });
        }

        // /**
        //  * Entry point for Redirect PMs (PaymentMethod is a String).
        //  * If we are trying to create a payment method that is in the components response & does not explicitly
        //  * implement a component (i.e no matching entry in the 'components' components map), it will default to a Redirect component
        //  */
        // if (typeof Component === 'string') {
        //     /**
        //      * NOTE: Only need the type prop for standalone redirect comps created by checkout.create('\{redirect-pm-txVariant\}'); (a likely scenario?)
        //      * - in all other scenarios it is already present.
        //      * (Further details: from the components response and componentsConfiguration are added in the next step,
        //      *  or, in the Dropin case, are already present)
        //      */
        //     return this.handleCreate(components, { type: Component, ...options });
        // }

        // /**
        //  * Entry point for Dropin (PaymentMethod is an Object)
        //  * Happens internally on Drop-in when relevant object from components response (.components or .storedComponents) has been isolated
        //  * and is then use to create an element in the components list
        //  */
        // if (typeof Component === 'object' && typeof PaymentMethod.type === 'string') {
        //     // componentsConfiguration object will take precedence here
        //     const componentsConfiguration = getComponentConfiguration(
        //         PaymentMethod.type,
        //         this.options.componentsConfiguration
        //     );
        //     // Restart the flow in the "usual" way (PaymentMethod is a String)
        //     return this.handleCreate(PaymentMethod.type, { ...PaymentMethod, ...options, ...componentsConfiguration });
        // }

        return this.handleCreateError(Component);
    }

    /**
     * @internal
     */
    private handleCreateError(paymentMethod?): never {
        const paymentMethodName = paymentMethod && paymentMethod.name ? paymentMethod.name : 'The passed payment method';
        const errorMessage = paymentMethod ? `${paymentMethodName} is not a valid Checkout Component` : 'No Payment Method component was passed';

        throw new Error(errorMessage);
    }
}

export default Core;
