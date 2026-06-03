import type { UIElementStatus, BaseElementProps as SharedBaseElementProps } from '@integration-components/types';
import type { Core } from '../Core';
import type { UIElement } from './UIElement';

export type BaseElementProps = SharedBaseElementProps<Core<any>>;

export interface IUIElement {
    accessibleName: string;
    displayName: string;
    elementRef: any;
    type: string;
}

export interface IFormElement<P> {
    submit(): void;
    setStatus(status: UIElementStatus, props?: any): UIElement<P>;
    showValidation(): void;
    setState(newState: object): void;
}

export type SetTriggerValidation = (callback: (schema?: Record<string, any>) => void) => void;

export interface FormProps<P> {
    onChange?: (state: any, element: UIElement<P> | null) => void;
    onValid?: (state: any, element: UIElement<P> | null) => void;
    beforeSubmit?: (state: any, element: UIElement<P>, actions: any) => Promise<void>;
    onSubmit?: (state: any, element: UIElement<P> | null) => void;
    onComplete?: (state: BaseElementProps, element: UIElement<P> | null) => void;
    onError?: (error: any, element?: UIElement<P> | null) => void;
    triggerValidation?: SetTriggerValidation;
}
