import { ComponentChildren } from 'preact';
import { TranslationKey } from '../../../translations';

export type TranslationFill = ComponentChildren | (() => ComponentChildren);

export interface TranslationProps {
    count?: number;
    defaultFill?: TranslationFill;
    fills?: Record<string, TranslationFill>;
    translationKey: TranslationKey;
}
