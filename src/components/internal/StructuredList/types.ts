import { TranslationKey } from '../../../translations';
import { StructuredListLayouts } from './StructuredList';
import { ComponentChild } from 'preact';

export type StructuredListItem = {
    label: string;
    id: string;
    value: any;
    key: string;
};

export type ListValue = string | number | ComponentChild;

export interface StructuredListProps {
    items: StructuredListItem[];
    layout?: (typeof StructuredListLayouts)[number];
    highlightable?: boolean;
    renderLabel?: (val: string, key: TranslationKey) => ComponentChild;
    renderValue?: (val: ListValue, key: TranslationKey) => ComponentChild;
    grid?: boolean;
    classNames?: string;
}
