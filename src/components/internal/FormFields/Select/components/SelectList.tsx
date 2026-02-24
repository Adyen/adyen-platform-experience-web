import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { boolOrFalse, isFunction } from '../../../../../utils';
import { fixedForwardRef } from '../../../../../utils/preact';
import cx from 'classnames';
import { ForwardedRef, memo } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { MutableRef } from 'preact/hooks';
import { DROPDOWN_ELEMENT_CLASS, DROPDOWN_ELEMENT_NO_OPTION_CLASS, DROPDOWN_LIST_ACTIVE_CLASS, DROPDOWN_LIST_CLASS } from '../constants';
import type { SelectItem, SelectListProps } from '../types';
import SelectListItem, { renderListItemDefault } from './SelectListItem';
import SelectPopover from './SelectPopover';
import ButtonActions from '../../../Button/ButtonActions/ButtonActions';
import { ButtonActionsLayoutBasic } from '../../../Button/ButtonActions/types';

const SelectList = fixedForwardRef(
    <T extends SelectItem>(
        {
            active,
            commitActions,
            items,
            disableFocusTrap,
            multiSelect,
            onKeyDown,
            onSelect,
            renderListItem,
            selectListId,
            showList,
            textFilter,
            toggleButtonRef,
            dismissPopover,
            setToTargetWidth,
            popoverClassNameModifiers,
            showOverlay,
            activeIndex,
            filterable,
            maxHeight,
        }: SelectListProps<T>,
        ref: ForwardedRef<HTMLUListElement>
    ) => {
        const { i18n } = useCoreContext();
        const isSmContainer = useResponsiveContainer(containerQueries.down.xs);
        const filteredItems = items.filter(item => !textFilter || item.name.toLowerCase().includes(textFilter));
        const listClassName = cx(DROPDOWN_LIST_CLASS, { [DROPDOWN_LIST_ACTIVE_CLASS]: showList });
        const noOptionsClassName = cx(DROPDOWN_ELEMENT_CLASS, DROPDOWN_ELEMENT_NO_OPTION_CLASS);
        const renderSelectOption = useMemo(() => (isFunction(renderListItem) ? renderListItem : renderListItemDefault), [renderListItem]);
        const multipleSelection = useMemo(() => boolOrFalse(multiSelect), [multiSelect]);

        return (
            <SelectPopover
                isOpen={showList}
                triggerRef={toggleButtonRef as MutableRef<HTMLElement | null>}
                onDismiss={dismissPopover}
                disableFocusTrap={disableFocusTrap || filterable}
                setToTargetWidth={setToTargetWidth}
                showOverlay={showOverlay && isSmContainer}
                classNameModifiers={popoverClassNameModifiers}
                maxHeight={maxHeight}
            >
                <ul className={listClassName} id={selectListId} ref={ref} role="listbox" aria-multiselectable={multipleSelection}>
                    {filteredItems.length ? (
                        filteredItems.map((item, index) => {
                            return (
                                <SelectListItem
                                    item={item}
                                    key={item.id}
                                    multiSelect={multipleSelection}
                                    onKeyDown={onKeyDown}
                                    onSelect={onSelect}
                                    renderListItem={renderSelectOption}
                                    selected={active.includes(item)}
                                    isKeyboardActive={filterable && activeIndex === index}
                                />
                            );
                        })
                    ) : (
                        <div className={noOptionsClassName}>{i18n.get('common.inputs.select.errors.noOptions')}</div>
                    )}
                </ul>
                {multipleSelection && commitActions && (
                    <div className="adyen-pe-select-popover__footer">
                        <ButtonActions actions={commitActions} layout={ButtonActionsLayoutBasic.SPACE_BETWEEN} />
                    </div>
                )}
            </SelectPopover>
        );
    }
);

export default memo(SelectList);
