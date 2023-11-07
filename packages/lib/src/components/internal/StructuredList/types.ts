import { StructuredListLayouts } from './StructuredList';
import { ComponentChild } from 'preact';
import { TranslationKey } from '@src/core/Localization/types';

export type StructuredListItem = { label: string; id: string; value: any; key: string };

export type ListValue = string | number | ComponentChild;

export interface StructuredListProps {
    items: { [key in TranslationKey]?: ListValue | undefined };
    layout?: (typeof StructuredListLayouts)[number];
    highlightable?: boolean;
    renderLabel?: (val: string) => ComponentChild;
    renderValue?: (val: ListValue) => ComponentChild;
    grid?: boolean;
}
