import { TranslationKey } from '../../../core/Localization/types';
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
    items: { key: TranslationKey; value: ListValue }[];
    layout?: (typeof StructuredListLayouts)[number];
    highlightable?: boolean;
    renderLabel?: (val: string) => ComponentChild;
    renderValue?: (val: ListValue) => ComponentChild;
    grid?: boolean;
}
