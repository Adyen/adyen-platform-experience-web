import cx from 'classnames';
import { createRef, RefObject, JSX } from 'preact';
import { FALLBACK_ENV } from '../utils';
import type { ExternalComponentType } from '@integration-components/types';
import type { BaseElementProps, IUIElement, UIElementProps, UIElementStatus } from '../../../../../src/components/types';
import { AnalyticsProvider } from './AnalyticsProvider';
import { ConfigProvider } from './ConfigContext';
import CoreProvider from './CoreProvider';
import BaseElement from './BaseElement';
import './UIElement.scss';

export class UIElement<P> extends BaseElement<P & UIElementProps> implements IUIElement {
    protected componentRef: UIElement<P> | null = null;

    public componentToRender: (() => JSX.Element) | null = null;
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

        const componentRefGetter = () => this.compRef.current;

        return (
            <ConfigProvider type={this.type} session={core.session} key={performance.now()}>
                <CoreProvider
                    componentRef={componentRefGetter}
                    environment={core.options.environment || FALLBACK_ENV}
                    i18n={core.localization.i18n}
                    getCdnConfig={core.getCdnConfig}
                    getImageAsset={core.getImageAsset}
                    getDatasetAsset={core.getDatasetAsset}
                    getCdnDataset={core.getCdnDataset}
                    loadingContext={core.loadingContext}
                    externalErrorHandler={externalErrorHandler}
                    updateCore={updateCore}
                >
                    <AnalyticsProvider componentName={this.displayName} analyticsEnabled={core?.analyticsEnabled ?? true}>
                        {this.componentToRender && (
                            <section ref={this.compRef} className={cx('adyen-pe-component', this.customClassNames)} data-testid="component-root">
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
