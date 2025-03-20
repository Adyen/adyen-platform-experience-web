import { ComponentChild } from 'preact';
import { TranslationKey } from '../../../translations';
import { TabbedControlOptionId } from '../../../hooks/useTabbedControl';

export interface SegmentedControlItem {
    content: ComponentChild;
    disabled?: boolean;
    id: string;
    label: TranslationKey;
}

export interface SegmentedControlProps<T extends SegmentedControlItem[]> {
    defaultItem?: TabbedControlOptionId<T>;
    items: T;
}
