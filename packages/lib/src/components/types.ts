import { h } from 'preact';
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
    isDropin?: boolean;
}

export interface IUIElement {
    isValid: boolean;
    displayName: string;
    accessibleName: string;
    type: string;
    elementRef: any;
    submit(): void;
    setElementStatus(status: UIElementStatus, props: any): UIElement;
    setStatus(status: UIElementStatus, props?: { message?: string; [key: string]: any }): UIElement;
    showValidation(): void;
    setState(newState: object): void;
}

export type UIElementStatus = 'ready' | 'loading' | 'error' | 'success';

export interface UIElementProps extends BaseElementProps {
    session?: BPSession;
    onChange?: (state: any, element: UIElement) => void;
    onValid?: (state: any, element: UIElement) => void;
    beforeSubmit?: (state: any, element: UIElement, actions: any) => Promise<void>;
    onSubmit?: (state: any, element: UIElement) => void;
    onComplete?: (state, element: UIElement) => void;
    onError?: (error, element?: UIElement) => void;
    beforeRedirect?: (resolve, reject, redirectData, element: UIElement) => void;

    isInstantPayment?: boolean;

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

    /**
     *  Set to false to not set the Component status to 'loading' when onSubmit is triggered.
     *  @defaultValue true
     */
    setStatusAutomatically?: boolean;

    /** @internal */
    payButton?: (options) => h.JSX.Element;

    /** @internal */
    loadingContext?: string;

    /** @internal */
    clientKey?: string;

    /** @internal */
    elementRef?: any;

    /** @internal */
    i18n?: Language;
}
