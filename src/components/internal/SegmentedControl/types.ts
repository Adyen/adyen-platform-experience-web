import { ComponentChild } from 'preact';
import { TranslationKey } from '../../../translations';

export interface SegmentedControlItem<ItemId extends string> {
    content: ComponentChild;
    disabled?: boolean;
    id: ItemId;
    label: TranslationKey;
}

export interface SegmentedControlProps<ItemId extends string> {
    onChange?: <ActiveItem extends SegmentedControlItem<ItemId>>(activeItem: ActiveItem) => void;
    items: readonly SegmentedControlItem<ItemId>[];
    activeItem?: ItemId;
}
