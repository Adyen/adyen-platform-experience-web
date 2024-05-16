import { TransactionsComponentProps } from '../../components';
import AuthProvider from '../../core/Auth/AuthProvider';
import CoreProvider from '../../core/Context/CoreProvider';
import { JSXInternal } from 'preact/src/jsx';
import BaseElement from './BaseElement';
import getImage from '../../utils/get-image';
import { BaseElementProps, IUIElement, UIElementProps } from '../types';
import { UIElementStatus } from '../types';
import { SetupEndpoint } from '../../types/models/openapi/endpoints';
import { EMPTY_OBJECT } from '../../utils/common';

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
        this.sessionSetupError = this.props.core.sessionSetupError;
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
        return this.type;
    }

    formatProps(props: TransactionsComponentProps) {
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
            <AuthProvider
                endpoints={this.session?.configuration?.endpoints || (EMPTY_OBJECT as SetupEndpoint)}
                token={this.session?.token ?? ''}
                updateCore={this.props.core.update.bind(this.props.core)}
                sessionSetupError={this.sessionSetupError}
            >
                <CoreProvider i18n={this.i18n} loadingContext={this.loadingContext}>
                    {this.componentToRender && <div className="adyen-pe-component">{this.componentToRender()}</div>}
                </CoreProvider>
            </AuthProvider>
        );
    }
}

export default UIElement;
