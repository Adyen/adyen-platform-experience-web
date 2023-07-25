import { Amount, AmountExtended } from '../types/shared';
import Language from '../language/Language';
import UIElement from './UIElement';
import Core from '../core';
import Analytics from '../core/Analytics';
import BPSession from '../core/FPSession';

export const enum InteractionKeyCode {
    ARROW_DOWN = 'ArrowDown',
    ARROW_LEFT = 'ArrowLeft',
    ARROW_RIGHT = 'ArrowRight',
    ARROW_UP = 'ArrowUp',
    BACKSPACE = 'Backspace',
    END = 'End',
    ENTER = 'Enter',
    ESCAPE = 'Escape',
    HOME = 'Home',
    PAGE_DOWN = 'PageDown',
    PAGE_UP = 'PageUp',
    SPACE = 'Space',
    TAB = 'Tab',
}

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

export type SetTriggerValidation = (callback: (schema?: Record<string, any>) => void) => void;

export interface UIElementProps extends BaseElementProps {
    id?: string;
    session?: BPSession;
    onChange?: (state: any, element: UIElement | null) => void;
    onValid?: (state: any, element: UIElement | null) => void;
    beforeSubmit?: (state: any, element: UIElement, actions: any) => Promise<void>;
    onSubmit?: (state: any, element: UIElement | null) => void;
    onComplete?: (state: BaseElementProps, element: UIElement | null) => void;
    onError?: (error: any, element?: UIElement | null) => void;
    beforeRedirect?: (resolve: any, reject: any, redirectData: any, element: UIElement) => void;
    type?: string;
    name?: string;
    icon?: string;
    amount?: Amount;
    secondaryAmount?: AmountExtended;
    triggerValidation?: SetTriggerValidation;
    setUIElementStatus?: (status: string) => void;
    ref?: any;

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
