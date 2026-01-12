import { ComponentChild, render } from 'preact';
import { BaseElementProps, BaseElementState, ExternalComponentType } from '../types';
import { isString, uuid } from '../../utils';

class BaseElement<P> {
    public static type: ExternalComponentType;

    public _component: ComponentChild | Error;
    public _node: Document | ShadowRoot | DocumentFragment | Element | null = null;
    public readonly _id = `${(this.constructor as typeof BaseElement)?.type}-${uuid()}`;

    public defaultProps = {};
    public props: P & BaseElementProps;
    public state: BaseElementState = {};

    protected constructor(props: P & BaseElementProps) {
        this.props = this.formatProps({ ...this?.defaultProps, ...props });
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
        const node = isString(domNode) ? document.querySelector(domNode) : domNode;

        if (!node) throw new Error('Component could not mount. Root node was not found.');

        // new, if this._node exists then we are "remounting" so we first need to unmount if it's not already been done
        if (this._node) this.unmount();

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
        if (!this._node) throw new Error('Component is not mounted.');

        const newComponent = component || this.render();
        render(newComponent, this._node);
        return this;
    }

    /**
     * Unmounts an element from the DOM
     */
    public unmount(): this {
        if (this._node) render(null, this._node);
        return this;
    }

    /**
     * Unmounts an element and removes it from the parent instance
     * For "destroy" type cleanup - when you don't intend to use the component again
     */
    public remove() {
        this.unmount();
        this.props.core.remove(this);
    }
}

export default BaseElement;
