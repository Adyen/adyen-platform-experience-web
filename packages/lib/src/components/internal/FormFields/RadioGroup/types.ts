import { CoreContextI18n } from '@src/core/Context/types';
import { JSX } from 'preact';

interface RadioGroupItem {
    name: string;
    id: string;
}

export interface RadioGroupProps {
    className?: string;
    isInvalid?: boolean;
    items: RadioGroupItem[];
    i18n: CoreContextI18n;
    name?: string;
    onChange: (e: JSX.TargetedEvent<HTMLInputElement>) => void;
    value?: string;
    uniqueId?: string;
    classNameModifiers?: string[];
}
