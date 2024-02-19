import cx from 'classnames';
import { memo } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { isFunction } from '@src/utils/common';
import Img from '@src/components/internal/Img';
import type { SelectItem, SelectItemProps } from '../types';
import {
    DROPDOWN_ELEMENT_ACTIVE_CLASS,
    DROPDOWN_ELEMENT_CLASS,
    DROPDOWN_ELEMENT_DISABLED_CLASS,
    DROPDOWN_ELEMENT_ICON_CLASS,
    DROPDOWN_ELEMENT_LEFT_ICON_CLASS,
} from '../constants';

const SelectListItem = memo(<T extends SelectItem>({ isIconOnLeftSide, item, onKeyDown, onSelect, renderListItem, selected }: SelectItemProps<T>) => {
    const disabled = !!item.disabled;

    // A change in Preact v10.11.1 means that all falsy values are assessed and set on data attributes.
    // In the case of `data-disabled` we only ever want it set if item.disabled is actually true, since the presence
    // of the `data-disabled` attr, regardless of its value, will disable the select list item.
    const dataDisabled = item.disabled === true || null;

    const itemClassName = cx([
        DROPDOWN_ELEMENT_CLASS,
        {
            [DROPDOWN_ELEMENT_ACTIVE_CLASS]: selected,
            [DROPDOWN_ELEMENT_DISABLED_CLASS]: disabled,
            [DROPDOWN_ELEMENT_LEFT_ICON_CLASS]: isIconOnLeftSide,
        },
    ]);

    const renderItem = useMemo(
        () =>
            isFunction(renderListItem)
                ? renderListItem
                : ((({ className, item }) => (
                      <>
                          <span>{item.name}</span>
                          {item.icon && <Img className={className as string} alt={item.name} src={item.icon} />}
                      </>
                  )) as NonNullable<SelectItemProps<T>['renderListItem']>),
        [renderListItem]
    );

    return (
        <li
            aria-disabled={disabled}
            aria-selected={selected}
            className={itemClassName}
            data-disabled={dataDisabled}
            data-value={item.id}
            onClick={onSelect}
            onKeyDown={onKeyDown}
            role="option"
            tabIndex={-1}
        >
            {renderItem({ isIconOnLeftSide, item, selected, className: DROPDOWN_ELEMENT_ICON_CLASS })}
        </li>
    );
});

export default SelectListItem;
