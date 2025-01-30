import { ComponentChildren } from 'preact';
import { TranslationKey } from '../../../translations';

export type TranslationFill = ComponentChildren | TranslationFillFunc;
export type TranslationFillFunc = (translationKey: string) => ComponentChildren;

export interface TranslationProps {
    count?: number;
    defaultFill?: TranslationFill;
    fills?: Record<string, TranslationFill> | readonly TranslationFill[];
    translationKey: TranslationKey;
}
