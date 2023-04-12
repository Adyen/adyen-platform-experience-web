import { Context, JSX } from 'preact';

export const enum EditAction {
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
}

interface FilterCustomRenderProps<T extends BaseFilterProps> {
    render?: (props: FilterEditModalRenderProps<T>) => JSX.Element;
}

interface FilterEditInternalProps {
    editActionContext: Context<EditAction>;
    updateValueChanged: (changed: boolean) => void;
    updateWithInitialValue: (withValue: boolean) => void;
}

export type FilterProps<T extends BaseFilterProps> = T & FilterCustomRenderProps<T>;
export type FilterEditModalProps<T extends BaseFilterProps> = FilterProps<T> & FilterEditInternalProps;

export type FilterEditModalRenderProps<T extends BaseFilterProps> = Omit<
    FilterEditModalProps<T>,
    keyof FilterEditInternalProps | keyof FilterCustomRenderProps<T>
> & {
    editAction: EditAction;
    onValueUpdated: (currentValue: string) => void;
};
