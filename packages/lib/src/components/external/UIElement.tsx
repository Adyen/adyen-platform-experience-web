import AuthProvider from '../../core/Auth/AuthProvider';
import CoreProvider from '../../core/Context/CoreProvider';
import { JSXInternal } from 'preact/src/jsx';
import BaseElement from './BaseElement';
import { BaseElementProps, DataOverviewComponentProps, IUIElement, UIElementProps, UIElementStatus } from '../types';
import { SetupEndpoint } from '../../types/api/endpoints';
import { EMPTY_OBJECT } from '../../utils';

export class UIElement<P> extends BaseElement<P & UIElementProps> implements IUIElement {
    protected componentRef: UIElement<P> | null = null;

    public componentToRender: (() => JSXInternal.Element) | null = null;
    public elementRef: UIElement<P> | null;
    public onContactSupport?: () => void;

    constructor(props: P & UIElementProps & BaseElementProps) {
        super(props);
        this.setState = this.setState.bind(this);
        this.onContactSupport = props.onContactSupport;
        this.elementRef = (this.props && this.props.elementRef) || this;
    }

    get isValid() {
        return !!this.state.isValid;
    }

    /**
     * Get the element's displayable name
     */
    get displayName(): string {
        return this.props.name || this.type;
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
        return (this.constructor as typeof UIElement)?.type;
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
        const core = this.props.core;

        return (
            <AuthProvider
                endpoints={core.session?.configuration?.endpoints || (EMPTY_OBJECT as SetupEndpoint)}
                token={core.session?.token ?? ''}
                updateCore={core.update.bind(core)}
                sessionSetupError={core.sessionSetupError}
            >
                <CoreProvider i18n={core.localization.i18n} loadingContext={core.loadingContext}>
                    {this.componentToRender && <div className="adyen-pe-component">{this.componentToRender()}</div>}
                </CoreProvider>
            </AuthProvider>
        );
    }
}

export default UIElement;
