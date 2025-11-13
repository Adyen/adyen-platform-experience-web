import { TranslationKey } from '../../../translations';
import { StructuredListLayouts } from './StructuredList';
import { ComponentChild } from 'preact';

type ItemType = 'text' | 'link' | 'button' | 'icon';

export type StructuredListItem = {
    label?: string;
    id?: string;
    value: any;
    key: TranslationKey;
    type?: ItemType;
    config?: any;
    render?: (item: StructuredListItem) => ComponentChild;
};

export type ListValue = string | number | ComponentChild;

export interface StructuredListProps {
    items: StructuredListItem[];
    layout?: (typeof StructuredListLayouts)[number];
    highlightable?: boolean;
    renderLabel?: (val: string, key: TranslationKey) => ComponentChild;
    renderValue?: (val: ListValue, key: TranslationKey, type: ItemType | undefined, config: any) => ComponentChild;
    grid?: boolean;
    classNames?: string;
    align?: 'start' | 'end';
    condensed?: boolean;
}
