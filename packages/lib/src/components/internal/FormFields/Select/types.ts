import { Ref, VNode } from 'preact';
import { HTMLAttributes } from 'preact/compat';

type _Selected<T> = T | readonly T[];

type _ListItemRenderData<T extends SelectItem> = Pick<SelectItemProps<T>, 'isIconOnLeftSide' | 'item' | 'selected'> &
    Pick<HTMLAttributes<any>, 'className'>;

export interface SelectItem {
    disabled?: boolean;
    icon?: string;
    id: string;
    name: string;
    selectedOptionName?: string;
}

export interface SelectProps<T extends SelectItem> {
    className?: string;
    classNameModifiers?: string[];
    filterable?: boolean;
    isCollatingErrors?: boolean;
    isIconOnLeftSide?: boolean;
    isInvalid?: boolean;
    isValid?: boolean;
    items: readonly T[];
    name?: string;
    onChange: (...args: any[]) => any;
    placeholder?: string;
    readonly?: boolean;
    renderListItem?: (data: _ListItemRenderData<T>) => VNode<any> | null;
    selected?: _Selected<T['id']>;
    uniqueId?: string;
}

export interface SelectButtonProps<T extends SelectItem> {
    active?: readonly T[];
    ariaDescribedBy?: string;
    className?: string;
    filterable: boolean;
    filterInputRef?: Ref<HTMLInputElement>;
    id?: string;
    isIconOnLeftSide?: boolean;
    isInvalid?: boolean;
    isValid?: boolean;
    onButtonKeyDown?: (evt: KeyboardEvent) => any;
    onInput?: (evt: Event) => any;
    placeholder?: string;
    readonly?: boolean;
    selectListId?: string;
    showList?: boolean;
    toggleButtonRef: Ref<HTMLButtonElement>;
    toggleList?: (e: Event) => void;
}

export interface SelectListProps<T extends SelectItem> {
    active: readonly T[];
    isIconOnLeftSide: boolean;
    items: readonly T[];
    onKeyDown: (evt: KeyboardEvent) => any;
    onSelect: (evt: Event) => any;
    renderListItem?: (data: _ListItemRenderData<T>) => VNode<any> | null;
    selectListId: string;
    showList: boolean;
    textFilter: string;
}

export interface SelectItemProps<T extends SelectItem> {
    isIconOnLeftSide: boolean;
    item: T;
    onKeyDown: (evt: KeyboardEvent) => any;
    onSelect: (evt: Event) => any;
    renderListItem?: (data: _ListItemRenderData<T>) => VNode<any> | null;
    selected: boolean;
}
