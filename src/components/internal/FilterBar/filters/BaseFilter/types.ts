import { JSX } from 'preact';
import { AriaAttributes } from 'preact/compat';
import { CommitAction } from '../../../../../hooks/useCommitAction';
import { PopoverContainerSize } from '../../../Popover/types';

export interface BaseFilterProps {
    onChange: (value?: any) => void;
    name: string;
    value?: string;
    title?: string;
    type?: string;
    label: string;
    classNameModifiers?: string[];
    isValueEmpty?: (value?: string) => boolean;
    appliedFilterAmount?: number;
    withContentPadding?: boolean;
    containerSize?: PopoverContainerSize;
    availableCurrencies?: readonly string[];
    selectedCurrencies?: string[];
    onResetAction?: () => void;
}

interface FilterCustomRenderProps<T extends BaseFilterProps> {
    render?: (props: FilterEditModalRenderProps<T>) => JSX.Element;
}

export type FilterProps<T extends BaseFilterProps> = T & FilterCustomRenderProps<T> & Pick<AriaAttributes, 'aria-label'>;

export type FilterEditModalRenderProps<T extends BaseFilterProps> = Omit<FilterProps<T>, keyof FilterCustomRenderProps<T> | 'aria-label'> & {
    editAction: CommitAction;
    onValueUpdated: (currentValue?: string | null) => void;
};
