import { JSX } from 'preact';

export enum EditAction {
    NONE = 0,
    APPLY = 1,
    CLEAR = 2,
}

export interface BaseFilterProps {
    onChange: (args: { [k: string]: string }) => void;
    name: string;
    value?: string;
    type?: string;
    label: string;
    classNameModifiers?: string[];
    isValueEmpty?: (value?: string) => boolean;
}

interface FilterCustomRenderProps<T extends BaseFilterProps> {
    render?: (props: FilterEditModalRenderProps<T>) => JSX.Element;
}

export type FilterProps<T extends BaseFilterProps> = T & FilterCustomRenderProps<T>;

export type FilterEditModalRenderProps<T extends BaseFilterProps> = Omit<
    FilterProps<T>,
    keyof FilterCustomRenderProps<T>
> & {
    editAction: EditAction;
    onValueUpdated: (currentValue: string) => void;
};
