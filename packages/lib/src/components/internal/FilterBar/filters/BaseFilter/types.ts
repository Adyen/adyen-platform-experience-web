import { JSX } from 'preact';
import { CommitAction } from '@src/hooks/useCommitAction';

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
}

interface FilterCustomRenderProps<T extends BaseFilterProps> {
    render?: (props: FilterEditModalRenderProps<T>) => JSX.Element;
}

export type FilterProps<T extends BaseFilterProps> = T & FilterCustomRenderProps<T>;

export type FilterEditModalRenderProps<T extends BaseFilterProps> = Omit<FilterProps<T>, keyof FilterCustomRenderProps<T>> & {
    editAction: CommitAction;
    onValueUpdated: (currentValue?: string | null) => void;
};
