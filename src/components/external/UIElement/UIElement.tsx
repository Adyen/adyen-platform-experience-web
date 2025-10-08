import cx from 'classnames';
import { JSXInternal } from 'preact/src/jsx';
import { createRef, RefObject } from 'preact';
import { BaseElementProps, ExternalComponentType, IUIElement, UIElementProps, UIElementStatus } from '../../types';
import { AnalyticsProvider } from '../../../core/Context/analytics/AnalyticsProvider';
import { ConfigProvider } from '../../../core/ConfigContext';
import CoreProvider from '../../../core/Context/CoreProvider';
import BaseElement from '../BaseElement';
import './UIElement.scss';

export class UIElement<P> extends BaseElement<P & UIElementProps> implements IUIElement {
    protected componentRef: UIElement<P> | null = null;

    public componentToRender: (() => JSXInternal.Element) | null = null;
    public compRef: RefObject<HTMLDivElement>;
    public customClassNames: string | undefined;
    public elementRef: UIElement<P> | null;
    public onContactSupport?: () => void;

    constructor(props: P & UIElementProps & BaseElementProps) {
        super(props);
        this.setState = this.setState.bind(this);
        this.onContactSupport = props.onContactSupport;
        this.elementRef = this;
        this.compRef = createRef();
    }

    get isValid() {
        return !!this.state.isValid;
    }

    /**
     * Get the element's displayable name
     */
    get displayName(): ExternalComponentType {
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
    get type(): ExternalComponentType {
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
        const externalErrorHandler = this.props.onError || core.onError || null;
        const updateCore = core.update.bind(core);

        core.session.errorHandler = externalErrorHandler;

        return (
            <ConfigProvider type={this.type} session={core.session} key={performance.now()}>
                <CoreProvider
                    componentRef={this.compRef}
                    i18n={core.localization.i18n}
                    getCdnConfig={core.getCdnConfig}
                    getImageAsset={core.getImageAsset}
                    loadingContext={core.loadingContext}
                    externalErrorHandler={externalErrorHandler}
                    updateCore={updateCore}
                >
                    <AnalyticsProvider componentName={this.displayName}>
                        {this.componentToRender && (
                            <section ref={this.compRef} className={cx('adyen-pe-component', this.customClassNames)}>
                                <div className="adyen-pe-component__container">{this.componentToRender()}</div>
                            </section>
                        )}
                    </AnalyticsProvider>
                </CoreProvider>
            </ConfigProvider>
        );
    }
}

export default UIElement;
