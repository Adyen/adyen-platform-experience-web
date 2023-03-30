import { Amount, AmountExtended } from '../types';
import Language from '../language/Language';
import UIElement from './UIElement';
import Core from '../core';
import Analytics from '../core/Analytics';
import BPSession from '../core/FPSession';

export interface BaseElementProps {
    _parentInstance?: Core;
    modules?: {
        analytics: Analytics;
    };
}

export interface IUIElement {
    isValid: boolean;
    displayName: string;
    accessibleName: string;
    type: string;
    elementRef: any;
    submit(): void;
    setStatus(status: UIElementStatus, props?: { message?: string; [key: string]: any }): UIElement;
    showValidation(): void;
    setState(newState: object): void;
}

export type UIElementStatus = 'ready' | 'loading' | 'error' | 'success';

export interface UIElementProps extends BaseElementProps {
    id?: string;
    session?: BPSession;
    onChange?: (state: any, element: UIElement) => void;
    onValid?: (state: any, element: UIElement) => void;
    beforeSubmit?: (state: any, element: UIElement, actions: any) => Promise<void>;
    onSubmit?: (state: any, element: UIElement) => void;
    onComplete?: (state: BaseElementProps, element: UIElement) => void;
    onError?: (error: any, element?: UIElement) => void;
    beforeRedirect?: (resolve: any, reject: any, redirectData: any, element: UIElement) => void;
    type?: string;
    name?: string;
    icon?: string;
    amount?: Amount;
    secondaryAmount?: AmountExtended;

    /**
     * Show/Hide pay button
     * @defaultValue true
     */
    showPayButton?: boolean;

    /** @internal */
    loadingContext?: string;

    /** @internal */
    clientKey?: string;

    /** @internal */
    elementRef?: any;

    /** @internal */
    i18n?: Language;
}
export type BaseElementState = {
    errors?: {
        [key: string]: any;
    };
    valid?: {
        [key: string]: boolean;
    };
    fieldProblems?: {
        [key: string]: any;
    };
    isValid?: boolean;
};
