import { TranslationKey } from '../../../translations';
import { StructuredListLayouts } from './StructuredList';
import { ComponentChild } from 'preact';

export type StructuredListItemType = 'text' | 'link' | 'button' | 'icon';

export type StructuredListItem = {
    label?: string;
    id?: string;
    value: any;
    key: TranslationKey;
    type?: StructuredListItemType;
    config?: any;
    render?: (item: StructuredListItem) => ComponentChild;
    rawValue?: any;
};

export type ListValue = string | number | ComponentChild;

export interface StructuredListProps {
    items: StructuredListItem[];
    layout?: (typeof StructuredListLayouts)[number];
    highlightable?: boolean;
    renderLabel?: (label: string, key: TranslationKey, rawValue: any) => ComponentChild;
    renderValue?: (val: ListValue, key: TranslationKey, type: StructuredListItemType | undefined, config: any) => ComponentChild;
    grid?: boolean;
    classNames?: string;
    align?: 'start' | 'end';
    condensed?: boolean;
}
