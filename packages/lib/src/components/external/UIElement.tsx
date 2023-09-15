import BaseElement from './BaseElement';
import getImage from '../../utils/get-image';
import { BaseElementProps, IUIElement, UIElementProps } from '../types';
import AdyenFPError from '../../core/Errors/AdyenFPError';
import { UIElementStatus } from '../types';

export class UIElement<P extends UIElementProps = any> extends BaseElement<P> implements IUIElement {
    protected componentRef: UIElement<P> | null;
    public elementRef: UIElement<P> | null;

    constructor(props: P & UIElementProps) {
        super(props);
        this.submit = this.submit.bind(this);
        this.setState = this.setState.bind(this);
        this.onValid = this.onValid.bind(this);
        this.onComplete = this.onComplete.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.componentRef = null;
        this.elementRef = (props && props.elementRef) || this;
        this.triggerValidation = undefined;
    }

    public setState(newState: object): void {
        this.state = { ...this.state, ...newState };
        this.onChange();
    }

    protected onChange(): object {
        const isValid = this.isValid;
        const state = { data: this.data, errors: this.state.errors, valid: this.state.valid, isValid };
        if (this.props.onChange) this.props.onChange(state, this.elementRef);
        if (isValid) this.onValid();

        return state;
    }

    private onSubmit(): void {
        //
    }

    private triggerValidation: (() => void) | undefined;

    private setUIElementStatus: ((status: string) => void) | undefined;

    private onValid() {
        const state = { data: this.data };
        if (this.props.onValid) this.props.onValid(state, this.elementRef);
        return state;
    }

    onComplete(state: BaseElementProps): void {
        if (this.props.onComplete) this.props.onComplete(state, this.elementRef);
    }

    /**
     * Submit data. If the form is not valid, it will trigger validation.
     */
    public submit(): void {
        if (!this.isValid) {
            this.showValidation();
            return;
        }

        this.onSubmit();
    }

    public showValidation(): this {
        if (this.componentRef?.showValidation) {
            this.componentRef.showValidation();
        } else {
            this.triggerValidation?.();
        }
        return this;
    }

    public setTriggerValidation = (callBack: () => void) => {
        this.triggerValidation = callBack;
    };

    public setStatus(status: UIElementStatus, props: P): this {
        if (this.componentRef?.setStatus) {
            this.componentRef.setStatus(status, props);
        } else {
            this.setUIElementStatus?.(status);
        }
        return this;
    }

    protected handleError = (error: AdyenFPError): void => {
        if (this.props.onError) {
            this.props.onError(error, this.elementRef);
        }
    };

    /**
     * Get the current validation status of the element
     */
    get isValid(): boolean {
        return false;
    }

    /**
     * Get the element icon URL for the current environment
     */
    get icon(): string {
        return this.props.icon ?? getImage({ loadingContext: this.props.loadingContext })((this.constructor as typeof UIElement)?.type);
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
        return this.props.type || (this.constructor as typeof UIElement)?.type;
    }
}

export default UIElement;
