import { AuthProvider } from '../../../core/Auth';
import CoreProvider from '../../../core/Context/CoreProvider';
import { JSXInternal } from 'preact/src/jsx';
import BaseElement from '../BaseElement';
import { BaseElementProps, IUIElement, UIElementProps, UIElementStatus } from '../../types';
import './UIElement.scss';
import { I18nextProvider } from 'react-i18next';
import i18next from '../../../i18n';

export class UIElement<P> extends BaseElement<P & UIElementProps> implements IUIElement {
    protected componentRef: UIElement<P> | null = null;

    public componentToRender: (() => JSXInternal.Element) | null = null;
    public elementRef: UIElement<P> | null;
    public onContactSupport?: () => void;
    private i18next;


    constructor(props: P & UIElementProps & BaseElementProps) {
        super(props);
        this.setState = this.setState.bind(this);
        this.onContactSupport = props.onContactSupport;
        this.elementRef = this;
        this.i18next = i18next;
    }

    get isValid() {
        return !!this.state.isValid;
    }

    /**
     * Get the element's displayable name
     */
    get displayName(): string {
        return this.type;
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

    formatProps(props: P) {
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
        const updateCore = core.update.bind(core);

        const externalErrorHandler = this.props.onError || core.onError || null;

        core.session.errorHandler = externalErrorHandler;

        this.i18next.changeLanguage(core.localization.i18n.locale.replace('-', '_'))
        return (
            <AuthProvider session={core.session} key={performance.now()}>
                <CoreProvider
                    i18n={core.localization.i18n}
                    loadingContext={core.loadingContext}
                    updateCore={updateCore}
                    externalErrorHandler={externalErrorHandler}
                >
                    <I18nextProvider i18n={this.i18next}>
                        {this.componentToRender && <div className="adyen-pe-component">{this.componentToRender()}</div>}
                    </I18nextProvider>

                </CoreProvider>
            </AuthProvider>
        );
    }
}

export default UIElement;
