import { JSX } from 'preact';
import { TargetedEvent } from 'preact/compat';

export interface InputBaseProps {
    autoCapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';
    autoCorrect?: string;
    classNameModifiers?: string[];
    isInvalid?: boolean;
    isValid?: boolean;
    readonly?: boolean;
    spellCheck?: boolean;
    type?: string;
    uniqueId?: string;
    isCollatingErrors?: boolean;
    disabled?: boolean;
    onInput?: (e: TargetedEvent<HTMLInputElement, Event>, field?: string) => void;
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
}
