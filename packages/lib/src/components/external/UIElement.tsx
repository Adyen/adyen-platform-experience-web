import BaseElement from './BaseElement';
import getImage from '../../utils/get-image';
import { BaseElementProps, IUIElement, UIElementProps } from '../types';
import { UIElementStatus } from '../types';

export class UIElement<P> extends BaseElement<P & UIElementProps> implements IUIElement {
    protected componentRef: UIElement<P> | null;
    public elementRef: UIElement<P> | null;

    constructor(props: P & UIElementProps & BaseElementProps) {
        super(props);
        this.setState = this.setState.bind(this);
        this.componentRef = null;
        this.elementRef = (props && props.elementRef) || this;
    }

    public setState(newState: Record<any, any>): void {
        this.state = { ...this.state, ...newState };
    }

    private setUIElementStatus: ((status: string) => void) | undefined;

    public setStatus(status: UIElementStatus, props: P & UIElementProps): this {
        if (this.componentRef?.setStatus) {
            this.componentRef.setStatus(status, props);
        } else {
            this.setUIElementStatus?.(status);
        }
        return this;
    }

    /**
     * Get the element icon URL for the current environment
     */
    get icon(): string {
        return getImage({ loadingContext: this.loadingContext })((this.constructor as typeof UIElement)?.type);
    }

    /**
     * Get the element's displayable name
     */
    get displayName(): string {
        return this.props.name || (this.constructor as typeof UIElement)?.type;
    }

    /**
     * Get the element accessible name, used in the aria-label of the button that controls selected component
     */
    get accessibleName(): string {
        return this.displayName;
    }

    /**
     * Return the type of an element
     */
    get type(): string {
        return this.type;
    }
}

export default UIElement;
