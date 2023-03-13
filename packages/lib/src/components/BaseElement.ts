import { ComponentChild, render } from 'preact';
import EventEmitter from './EventEmitter';
import uuid from '../utils/uuid';
import Core from '../core';
import { BaseElementProps } from './types';

class BaseElement<P extends BaseElementProps> {
    public readonly _id = `${this.constructor['type']}-${uuid()}`;
    public props: P;
    public state;
    protected static defaultProps = {};
    public _node;
    public _component;
    public eventEmitter = new EventEmitter();
    protected readonly _parentInstance?: Core;

    protected constructor(props: P) {
        this.props = this.formatProps({ ...this.constructor['defaultProps'], ...props });
        this._parentInstance = this.props._parentInstance;
        this._node = null;
        this.state = {};
    }

    /**
     * Executed during creation of any element.
     * Gives a chance to any component to format the props we're receiving.
     */
    protected formatProps(props: P) {
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
    public mount(domNode: HTMLElement | string): this {
        const node = typeof domNode === 'string' ? document.querySelector(domNode) : domNode;

        if (!node) {
            throw new Error('Component could not mount. Root node was not found.');
        }

        if (this._node) {
            this.unmount(); // new, if this._node exists then we are "remounting" so we first need to unmount if it's not already been done
        } else {
            // Set up analytics, once
            if (this.props.modules && this.props.modules.analytics) {
                this.props.modules.analytics.send({
                    containerWidth: this._node && this._node.offsetWidth,
                    component: this.constructor['analyticsType'] ?? this.constructor['type'],
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
        this._component = this.render();
        render(this._component, this._node);

        return this;

        // return this.remount(this._component);
        // */
    }

    /**
     * Unmounts an element and mounts it again on the same node i.e. allows mount w/o having to pass a node.
     * Should be "private" & undocumented (although being a public function is useful for testing).
     * Left in for legacy reasons
     */
    public remount(component?): this {
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
