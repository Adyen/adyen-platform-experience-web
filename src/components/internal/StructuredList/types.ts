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
    className?: string;
    items: { key: TranslationKey; value: ListValue }[];
    layout?: (typeof StructuredListLayouts)[number];
    highlightable?: boolean;
    renderLabel?: (val: string) => ComponentChild;
    renderValue?: (val: ListValue) => ComponentChild;
    grid?: boolean;
}
