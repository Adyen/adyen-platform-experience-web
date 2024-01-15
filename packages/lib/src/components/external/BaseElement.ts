import { ComponentChild, render } from 'preact';
import EventEmitter from './EventEmitter';
import uuid from '../../utils/uuid';
import { Core } from '../../core';
import { BaseElementProps, BaseElementState } from '../types';
import { isString } from '@src/utils/validator-utils';
import Localization from '@src/core/Localization';
import BPSession from '@src/core/Session/Session';

class BaseElement<P> {
    public static type: string;
    public static analyticsType: string;
    public readonly _id = `${(this.constructor as typeof BaseElement)?.type}-${uuid()}`;
    public props: P & BaseElementProps;
    public state: BaseElementState;
    public defaultProps = {};
    public _node: Document | ShadowRoot | DocumentFragment | Element | null;
    public _component: ComponentChild | Error;
    public eventEmitter = new EventEmitter();
    protected readonly _parentInstance?: Core;
    public sessionSetupError?: boolean;

    // provided by AdyenFPCore
    public loadingContext?: string;
    public i18n?: Localization['i18n'];
    public session?: BPSession;

    protected constructor(props: P & BaseElementProps) {
        this.props = this.formatProps({ ...this?.defaultProps, ...props });
        this._parentInstance = this.props._parentInstance;
        this._node = null;
        this.state = {} as BaseElementState;
        this.loadingContext = this.props.core.loadingContext;
        this.i18n = this.props.core.modules.i18n;
        this.session = this.props.core.session;
        this.props.core.registerComponent(this);
    }

    /**
     * Executed during creation of any element.
     * Gives a chance to any component to format the props we're receiving.
     */
    protected formatProps(props: P & BaseElementProps): any {
        return props;
    }

    /**
     * Executed on the `data` getter.
     * Returns the component data necessary for making a request
     */
    protected formatData() {
        return {};
    }

    protected setState(newState: object): void {
        this.state = { ...this.state, ...newState };
    }

    /**
     * Returns the component data ready to submit to the Checkout API
     * Note: this does not ensure validity, check isValid first
     */
    get data(): any {
        return {
            ...this.formatData(),
            clientStateDataIndicator: true,
        };
    }

    public render(): ComponentChild | Error {
        // render() not implemented in the element
        throw new Error('Component cannot be rendered.');
    }

    /**
     * Mounts an element into the dom
     * @param domNode - Node (or selector) where we will mount the element
     * @returns this - the element instance we mounted
     */
    public mount(domNode: string): this;
    public mount(domNode: HTMLElement): this;
    public mount(domNode: any): any {
        let node;
        if (isString(domNode)) {
            node = document.querySelector(domNode);
        } else {
            node = domNode;
        }

        if (!node) {
            throw new Error('Component could not mount. Root node was not found.');
        }

        if (this._node) {
            this.unmount(); // new, if this._node exists then we are "remounting" so we first need to unmount if it's not already been done
        } else {
            // Set up analytics, once
            if (this.props.modules && this.props.modules.analytics) {
                this.props.modules.analytics.send({
                    containerWidth: node && node.offsetWidth,
                    component: (this.constructor as typeof BaseElement)?.analyticsType ?? (this.constructor as typeof BaseElement)?.type,
                    flavor: 'components',
                });
            }
        }

        this._node = node;
        this._component = this.render();

        render(this._component, node);

        return this;
    }

    /**
     * Updates props, resets the internal state and remounts the element.
     * @param props - props to update
     * @returns this - the element instance
     */
    public update(props: P): this {
        /*
        // OLD
        this.props = this.formatProps({ ...this.props, ...props });
        this.state = {};

        return this.unmount().mount(this._node); // for new mount fny
        */

        // /*
        this.props = this.formatProps({ ...this.props, ...props });
        this.sessionSetupError = this.props.core.sessionSetupError;
        this._component = this.render();
        if (this._node) render(this._component, this._node);

        return this;

        // return this.remount(this._component);
        // */
    }

    /**
     * Unmounts an element and mounts it again on the same node i.e. allows mount w/o having to pass a node.
     * Should be "private" & undocumented (although being a public function is useful for testing).
     * Left in for legacy reasons
     */
    public remount(component: BaseElement<any>): this {
        if (!this._node) {
            throw new Error('Component is not mounted.');
        }

        const newComponent = component || this.render();

        render(newComponent, this._node, undefined);

        return this;
    }

    /**
     * Unmounts an element from the DOM
     */
    public unmount(): this {
        if (this._node) {
            render(null, this._node);
        }

        return this;
    }

    /**
     * Unmounts an element and removes it from the parent instance
     * For "destroy" type cleanup - when you don't intend to use the component again
     */
    public remove() {
        this.unmount();

        if (this._parentInstance) {
            this._parentInstance.remove(this);
        }
    }
}

export default BaseElement;
