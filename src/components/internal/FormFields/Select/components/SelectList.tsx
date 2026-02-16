import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import { PopoverContainerPosition, PopoverContainerSize, PopoverContainerVariant, PopoverProps } from '../../../Popover/types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { boolOrFalse, isFunction } from '../../../../../utils';
import { fixedForwardRef } from '../../../../../utils/preact';
import cx from 'classnames';
import { ForwardedRef, memo } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { DROPDOWN_ELEMENT_CLASS, DROPDOWN_ELEMENT_NO_OPTION_CLASS, DROPDOWN_LIST_ACTIVE_CLASS, DROPDOWN_LIST_CLASS } from '../constants';
import type { SelectItem, SelectListProps } from '../types';
import SelectListItem, { renderListItemDefault } from './SelectListItem';
import Popover from '../../../Popover/Popover';

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
            fitPosition,
            fixedPopoverPositioning,
            activeIndex,
            filterable,
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

        return showList ? (
            <Popover
                classNameModifiers={popoverClassNameModifiers}
                actions={multipleSelection ? commitActions : undefined}
                disableFocusTrap={disableFocusTrap}
                divider={true}
                dismiss={dismissPopover}
                dismissible={false}
                open={showList}
                setToTargetWidth={setToTargetWidth}
                containerSize={PopoverContainerSize.MEDIUM}
                variant={PopoverContainerVariant.POPOVER}
                targetElement={toggleButtonRef as PopoverProps['targetElement']}
                withContentPadding={false}
                position={PopoverContainerPosition.BOTTOM}
                showOverlay={showOverlay && isSmContainer}
                fitPosition={fitPosition}
                fixedPositioning={fixedPopoverPositioning}
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
            </Popover>
        ) : null;
    }
);

export default memo(SelectList);
