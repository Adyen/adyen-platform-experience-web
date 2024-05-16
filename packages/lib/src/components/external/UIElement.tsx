import { DataOverviewComponentProps } from '../../types';
import { AuthProvider } from '../../core/Auth';
import CoreProvider from '../../core/Context/CoreProvider';
import { JSXInternal } from 'preact/src/jsx';
import BaseElement from './BaseElement';
import getImage from '../../utils/get-image';
import { BaseElementProps, IUIElement, UIElementProps } from '../types';
import { UIElementStatus } from '../types';

export class UIElement<P> extends BaseElement<P & UIElementProps> implements IUIElement {
    protected componentRef: UIElement<P> | null;
    public elementRef: UIElement<P> | null;
    public onContactSupport?: () => void;
    public componentToRender: (() => JSXInternal.Element) | null;

    constructor(props: P & UIElementProps & BaseElementProps) {
        super(props);
        this.setState = this.setState.bind(this);
        this.onContactSupport = props.onContactSupport;
        this.componentRef = null;
        this.elementRef = (this.props && this.props.elementRef) || this;
        this.componentToRender = null;
    }

    get isValid() {
        return !!this.state.isValid;
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
        return (this.constructor as typeof BaseElement)?.type;
    }

    formatProps(props: DataOverviewComponentProps) {
        return props;
    }

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            ...this.state,
        };
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

    render() {
        return (
            <AuthProvider loadingContext={this.loadingContext} onSessionCreate={this.props.core.onSessionCreate}>
                <CoreProvider i18n={this.i18n} loadingContext={this.loadingContext} updateCore={this.props.core.update}>
                    {this.componentToRender && <div className="adyen-pe-component">{this.componentToRender()}</div>}
                </CoreProvider>
            </AuthProvider>
        );
    }
}

export default UIElement;
