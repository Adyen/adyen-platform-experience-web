import { ComponentChildren, JSX } from 'preact';
import { TargetedEvent } from 'preact/compat';
import { JSXInternal } from 'preact/src/jsx';
import AriaRole = JSXInternal.AriaRole;

export interface InputBaseProps {
    autoCapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';
    classNameModifiers?: string[];
    isInvalid?: boolean;
    isValid?: boolean;
    readonly?: boolean;
    type?: string;
    uniqueId?: string;
    isCollatingErrors?: boolean;
    disabled?: boolean;
    onClick?: (e: JSX.TargetedEvent<HTMLInputElement>) => void;
    onInput?: (e: TargetedEvent<HTMLInputElement, Event>, field?: string) => void;
    onKeyDown?: (e: JSX.TargetedEvent<HTMLInputElement>) => void;
    onKeyUp?: (e: JSX.TargetedEvent<HTMLInputElement>) => void;
    onBlur?: (e: JSX.TargetedEvent<HTMLInputElement>) => void;
    onFocusHandler?: (e: JSX.TargetedEvent<HTMLInputElement>) => void;
    onBlurHandler?: (e: JSX.TargetedEvent<HTMLInputElement>) => void;
    trimOnBlur?: boolean;
    className?: string;
    name?: string;
    placeholder?: string;
    value?: any;
    maxLength?: number;
    required?: boolean;
    role?: AriaRole;
    min?: number;
    errorMessage?: string;
    lang?: HTMLInputElement['lang'];
    iconBeforeSlot?: ComponentChildren;
    iconAfterSlot?: ComponentChildren;
}
