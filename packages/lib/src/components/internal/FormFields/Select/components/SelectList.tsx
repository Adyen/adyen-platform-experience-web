import cx from 'classnames';
import { useMemo } from 'preact/hooks';
import { ForwardedRef, memo } from 'preact/compat';
import { isFunction } from '@src/utils/common';
import useCoreContext from '@src/core/Context/useCoreContext';
import fixedForwardRef from '@src/utils/fixedForwardRef';
import SelectListItem, { renderSelectListItemDefault } from './SelectListItem';
import type { SelectItem, SelectListProps } from '../types';
import { DROPDOWN_ELEMENT_CLASS, DROPDOWN_ELEMENT_NO_OPTION_CLASS, DROPDOWN_LIST_ACTIVE_CLASS, DROPDOWN_LIST_CLASS } from '../constants';

const SelectList = fixedForwardRef(
    <T extends SelectItem>(
        { active, items, multiSelect, onKeyDown, onSelect, renderListItem, selectListId, showList, textFilter }: SelectListProps<T>,
        ref: ForwardedRef<HTMLUListElement>
    ) => {
        const { i18n } = useCoreContext();
        const filteredItems = items.filter(item => !textFilter || item.name.toLowerCase().includes(textFilter));
        const listClassName = cx(DROPDOWN_LIST_CLASS, { [DROPDOWN_LIST_ACTIVE_CLASS]: showList });
        const noOptionsClassName = cx(DROPDOWN_ELEMENT_CLASS, DROPDOWN_ELEMENT_NO_OPTION_CLASS);
        const renderSelectOption = useMemo(() => (isFunction(renderListItem) ? renderListItem : renderSelectListItemDefault), [renderListItem]);
        const multipleSelection = useMemo(() => multiSelect === true, [multiSelect]);

        return (
            <ul className={listClassName} id={selectListId} ref={ref} role="listbox">
                {filteredItems.length ? (
                    filteredItems.map(item => (
                        <SelectListItem
                            item={item}
                            key={item.id}
                            multiSelect={multipleSelection}
                            onKeyDown={onKeyDown}
                            onSelect={onSelect}
                            renderListItem={renderSelectOption}
                            selected={active.includes(item)}
                        />
                    ))
                ) : (
                    <div className={noOptionsClassName}>{i18n.get('select.noOptionsFound')}</div>
                )}
            </ul>
        );
    }
);

export default memo(SelectList);
