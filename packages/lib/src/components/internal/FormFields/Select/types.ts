import { Ref } from 'preact';

export interface SelectItem {
    disabled?: boolean;
    icon?: string;
    id: string;
    name: string;
    selectedOptionName?: string;
}

export interface SelectProps {
    className?: string;
    classNameModifiers?: string[];
    filterable?: boolean;
    isInvalid?: boolean;
    isValid?: boolean;
    items: SelectItem[];
    name?: string;
    onChange: (...args: any) => void;
    placeholder?: string;
    readonly?: boolean;
    selected?: string;
    uniqueId?: string;
    isCollatingErrors?: boolean;
    isIconOnLeftSide?: boolean;
}

export interface SelectButtonProps {
    className?: string;
    active?: SelectItem;
    filterInputRef?: Ref<HTMLInputElement>;
    filterable: boolean;
    isInvalid?: boolean;
    isValid?: boolean;
    onButtonKeyDown?: (e: KeyboardEvent) => void;
    onInput?: (e: Event) => void;
    placeholder?: string;
    readonly?: boolean;
    selectListId?: string;
    showList?: boolean;
    toggleButtonRef: Ref<HTMLButtonElement>;
    toggleList?: (e: Event) => void;
    id?: string;
    ariaDescribedBy?: string;
    isIconOnLeftSide?: boolean;
}

export interface SelectListProps {
    active: SelectItem;
    items: SelectItem[];
    onKeyDown: (e: KeyboardEvent) => void;
    onSelect: (e: Event) => void;
    selectListId: string;
    showList: boolean;
    textFilter: string;
    isIconOnLeftSide: boolean;
}

export interface SelectItemProps {
    item: SelectItem;
    selected: boolean;
    isIconOnLeftSide: boolean;
    onKeyDown: (e: KeyboardEvent) => void;
    onSelect: (e: Event) => void;
}
