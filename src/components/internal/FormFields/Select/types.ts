import { Ref, VNode } from 'preact';
import { AriaAttributes, HTMLAttributes } from 'preact/compat';
import { CommitActionProperties } from '../../../../hooks/useCommitAction';
import { ButtonVariant } from '../../Button/types';

type _Selected<T> = T | readonly T[];

type _ListItemRenderData<T extends SelectItem> = Pick<SelectItemProps<T>, 'item' | 'multiSelect' | 'selected'> & {
    contentClassName?: HTMLAttributes<any>['className'];
    iconClassName?: HTMLAttributes<any>['className'];
};

export interface SelectItem<T extends string = string> {
    disabled?: boolean;
    icon?: string;
    id: T;
    name: string;
    selectedOptionName?: string;
}

export interface SelectProps<T extends SelectItem> extends Pick<AriaAttributes, 'aria-label' | 'aria-labelledby'> {
    className?: string;
    classNameModifiers?: string[];
    filterable?: boolean;
    isCollatingErrors?: boolean;
    isInvalid?: boolean;
    isValid?: boolean;
    items: readonly T[];
    buttonVariant?: ButtonVariant;
    /**
     * When true, closing the list will not restore focus to the toggle button.
     * Useful when Select is embedded inside composite controls that should own focus.
     */
    disableToggleFocusOnClose?: boolean;
    disableFocusTrap?: boolean;
    multiSelect?: boolean;
    name?: string;
    onChange: (...args: any[]) => any;
    placeholder?: string;
    readonly?: boolean;
    renderListItem?: (data: _ListItemRenderData<T>) => VNode<any> | null;
    selected?: _Selected<T['id']>;
    uniqueId?: string;
    withoutCollapseIndicator?: boolean;
    setToTargetWidth?: boolean;
    showOverlay?: boolean;
    popoverClassNameModifiers?: string[];
    fitPosition?: boolean;
    fixedPopoverPositioning?: boolean;
    onResetAction?: () => void;
}

export interface SelectButtonProps<T extends SelectItem> extends Pick<AriaAttributes, 'aria-label' | 'aria-labelledby'> {
    active: readonly T[];
    ariaDescribedBy?: string;
    className?: string;
    filterable: boolean;
    filterInputRef?: Ref<HTMLInputElement>;
    id: string;
    buttonVariant?: ButtonVariant;
    isInvalid?: boolean;
    isValid?: boolean;
    multiSelect?: boolean;
    onButtonKeyDown?: (evt: KeyboardEvent) => any;
    onFilterInputKeyDown?: (evt: KeyboardEvent) => any;
    onInput?: (evt: Event) => any;
    placeholder?: string;
    readonly?: boolean;
    selectListId?: string;
    showList?: boolean;
    toggleButtonRef: Ref<HTMLButtonElement>;
    toggleList?: (e: Event) => void;
    withoutCollapseIndicator?: boolean;
}

export interface SelectListProps<T extends SelectItem> {
    active: readonly T[];
    commitActions: CommitActionProperties['commitActionButtons'];
    items: readonly T[];
    multiSelect?: boolean;
    disableFocusTrap: boolean;
    onKeyDown: (evt: KeyboardEvent) => any;
    onSelect: (evt: Event) => any;
    renderListItem?: (data: _ListItemRenderData<T>) => VNode<any> | null;
    selectListId: string;
    showList: boolean;
    textFilter: string;
    toggleButtonRef: Ref<HTMLButtonElement>;
    dismissPopover: any;
    setToTargetWidth?: boolean;
    popoverClassNameModifiers?: string[];
    showOverlay?: boolean;
    fitPosition?: boolean;
    fixedPopoverPositioning?: boolean;
    activeIndex?: number;
    filterable?: boolean;
}

export interface SelectItemProps<T extends SelectItem> {
    item: T;
    isKeyboardActive?: boolean;
    multiSelect: boolean;
    onKeyDown: (evt: KeyboardEvent) => any;
    onSelect: (evt: Event) => any;
    renderListItem: (data: _ListItemRenderData<T>) => VNode<any> | null;
    selected: boolean;
}
