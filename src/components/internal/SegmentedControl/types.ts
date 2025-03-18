import { ComponentChild } from 'preact';
import { TranslationKey } from '../../../translations';
import { TabbedControlOptionId } from '../../../hooks/useTabbedControl';

export interface SegmentedControlOption {
    content: ComponentChild;
    disabled?: boolean;
    id: string;
    label: TranslationKey;
}

export interface SegmentedControlProps<T extends SegmentedControlOption[]> {
    defaultOption?: TabbedControlOptionId<T>;
    options: T;
}
