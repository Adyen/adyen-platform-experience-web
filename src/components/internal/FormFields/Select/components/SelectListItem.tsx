import cx from 'classnames';
import { memo } from 'preact/compat';
import { useEffect, useRef } from 'preact/hooks';
import Img from '../../../Img';
import Icon from '../../../Icon';
import type { SelectItem, SelectItemProps } from '../types';
import { boolOrFalse } from '../../../../../utils';
import {
    DROPDOWN_ELEMENT_ACTIVE_CLASS,
    DROPDOWN_ELEMENT_CHECKBOX_CLASS,
    DROPDOWN_ELEMENT_CHECKMARK_CLASS,
    DROPDOWN_ELEMENT_CLASS,
    DROPDOWN_ELEMENT_CONTENT_CLASS,
    DROPDOWN_ELEMENT_DISABLED_CLASS,
    DROPDOWN_ELEMENT_ICON_CLASS,
    DROPDOWN_ELEMENT_KEYBOARD_ACTIVE_CLASS,
} from '../constants';

type _RenderSelectOptionResult<T extends SelectItem> = ReturnType<SelectItemProps<T>['renderListItem']>;
type _RenderSelectOptionData<T extends SelectItem> = Parameters<SelectItemProps<T>['renderListItem']>[0];

export const renderDefaultMultiSelectionCheckedness = <T extends SelectItem>(data: _RenderSelectOptionData<T>): _RenderSelectOptionResult<T> =>
    data.multiSelect ? (
        <span className={DROPDOWN_ELEMENT_CHECKBOX_CLASS}>{data.selected ? <Icon name="checkmark-square-fill" /> : <Icon name="square" />}</span>
    ) : null;

export const renderDefaultSingleSelectionCheckedness = <T extends SelectItem>(data: _RenderSelectOptionData<T>): _RenderSelectOptionResult<T> =>
    data.multiSelect ? null : <span className={DROPDOWN_ELEMENT_CHECKMARK_CLASS}>{data.selected && <Icon name="checkmark" />}</span>;

export const renderListItemDefault = <T extends SelectItem>(data: _RenderSelectOptionData<T>): _RenderSelectOptionResult<T> => (
    <>
        {renderDefaultMultiSelectionCheckedness(data)}
        <div className={data.contentClassName as string}>
            {data.item.icon && <Img className={data.iconClassName as string} alt={data.item.name} src={data.item.icon} />}
            <span>{data.item.name}</span>
        </div>
        {renderDefaultSingleSelectionCheckedness(data)}
    </>
);

const SelectListItem = <T extends SelectItem>({
    item,
    multiSelect,
    onKeyDown,
    onSelect,
    renderListItem,
    selected,
    isKeyboardActive,
}: SelectItemProps<T>) => {
    const disabled = !!item.disabled;
    const itemRef = useRef<HTMLLIElement>(null);

    // A change in Preact v10.11.1 means that all falsy values are assessed and set on data attributes.
    // In the case of `data-disabled` we only ever want it set if item.disabled is actually true, since the presence
    // of the `data-disabled` attr, regardless of its value, will disable the select list item.
    const dataDisabled = boolOrFalse(item.disabled) || null;

    const itemClassName = cx(DROPDOWN_ELEMENT_CLASS, {
        [DROPDOWN_ELEMENT_ACTIVE_CLASS]: selected,
        [DROPDOWN_ELEMENT_DISABLED_CLASS]: disabled,
        [DROPDOWN_ELEMENT_KEYBOARD_ACTIVE_CLASS]: isKeyboardActive,
    });

    // Scroll into view when keyboard-active
    useEffect(() => {
        if (isKeyboardActive && itemRef.current) {
            itemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [isKeyboardActive]);

    return (
        <li
            ref={itemRef}
            aria-disabled={disabled}
            aria-selected={selected}
            className={itemClassName}
            data-disabled={dataDisabled}
            data-value={item.id}
            onClick={onSelect}
            onKeyDown={onKeyDown}
            title={item.name}
            role="option"
            tabIndex={-1}
        >
            {renderListItem({
                item,
                multiSelect,
                selected,
                contentClassName: DROPDOWN_ELEMENT_CONTENT_CLASS,
                iconClassName: DROPDOWN_ELEMENT_ICON_CLASS,
            })}
        </li>
    );
};

export default memo(SelectListItem);
