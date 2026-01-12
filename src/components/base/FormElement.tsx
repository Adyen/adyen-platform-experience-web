import { _UIComponentProps, BaseElementProps, FormProps, IFormElement, UIElementProps } from '../types';
import AdyenPlatformExperienceError from '../../core/Errors/AdyenPlatformExperienceError';
import UIElement from './UIElement/UIElement';

export class FormElement<P extends UIElementProps> extends UIElement<P & FormProps<P>> implements IFormElement<P> {
    protected componentRef: FormElement<P> | null;

    constructor(props: _UIComponentProps<P & FormProps<P>>) {
        super(props);
        this.submit = this.submit.bind(this);
        this.onValid = this.onValid.bind(this);
        this.onComplete = this.onComplete.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.componentRef = null;
        this.triggerValidation = undefined;
    }

    protected onChange(): object {
        const isValid = this.isValid;
        const state = { data: this.data, errors: this.state.errors, valid: this.state.valid, isValid };
        if (this.props.onChange) this.props.onChange(state, this.elementRef);
        if (isValid) this.onValid();

        return state;
    }

    private onSubmit(): void {}

    private triggerValidation: (() => void) | undefined;

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

    protected handleError = (error: AdyenPlatformExperienceError): void => {
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
}

export default FormElement;
