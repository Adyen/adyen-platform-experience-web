import Language from '../../../../language/Language';
import { JSX } from 'preact';

interface RadioGroupItem {
    name: string;
    id: string;
}

export interface RadioGroupProps {
    className?: string;
    isInvalid?: boolean;
    items: RadioGroupItem[];
    i18n: Language;
    name?: string;
    onChange: (e: JSX.TargetedEvent<HTMLInputElement>) => void;
    value?: string;
    uniqueId?: string;
    classNameModifiers?: string[];
}
