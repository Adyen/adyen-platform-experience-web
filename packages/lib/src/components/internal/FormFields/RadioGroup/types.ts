import Localization from '@src/localization';
import { JSX } from 'preact';

interface RadioGroupItem {
    name: string;
    id: string;
}

export interface RadioGroupProps {
    className?: string;
    isInvalid?: boolean;
    items: RadioGroupItem[];
    i18n: Localization['i18n'];
    name?: string;
    onChange: (e: JSX.TargetedEvent<HTMLInputElement>) => void;
    value?: string;
    uniqueId?: string;
    classNameModifiers?: string[];
}
