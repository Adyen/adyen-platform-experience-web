import cx from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { InteractionKeyCode } from '../../../types';
import { ARIA_ERROR_SUFFIX } from '../../../../core/Errors/constants';
import { boolOrFalse, EMPTY_ARRAY, noop } from '../../../../utils';
import useCommitAction, { CommitAction } from '../../../../hooks/useCommitAction';
import useUniqueId from '../../../../hooks/useUniqueId';
import SelectButton from './components/SelectButton';
import SelectList from './components/SelectList';
import useSelect from './hooks/useSelect';
import { DROPDOWN_BASE_CLASS, DROPDOWN_MULTI_SELECT_CLASS } from './constants';
import { SelectItem, SelectProps } from './types';
import './Select.scss';

// [TODO]: Revisit this component logic — for handling user interaction
const Select = <T extends SelectItem>({
    className,
    classNameModifiers = EMPTY_ARRAY as [],
    popoverClassNameModifiers,
    items = EMPTY_ARRAY as readonly T[],
    filterable = false,
    disableFocusTrap = false,
    multiSelect = false,
    readonly = false,
    onChange = noop,
    selected,
    name,
    isInvalid,
    isValid,
    placeholder,
    uniqueId,
    renderListItem,
    renderButtonContent,
    isCollatingErrors,
    setToTargetWidth,
    withoutCollapseIndicator = false,
    showOverlay = false,
    fitPosition,
    fixedPopoverPositioning,
    onResetAction,
    ...ariaAttributeProps
}: SelectProps<T>) => {
    const { resetSelection, select, selection } = useSelect({ items, multiSelect, selected });
    const [showList, setShowList] = useState<boolean>(false);
    const [textFilter, setTextFilter] = useState<string>('');
    const filterInputRef = useRef<HTMLInputElement>(null);
    const selectListRef = useRef<HTMLUListElement>(null);
    const toggleButtonRef = useRef<HTMLButtonElement>(null);

    const selectButtonUniqueId = `elem-${useUniqueId()}`;
    const selectButtonId = uniqueId ?? selectButtonUniqueId;
    const selectListId = `select-${useUniqueId()}`;

    const autoFocusAnimFrame = useRef<ReturnType<typeof requestAnimationFrame>>();
    const pendingClickOutsideTriggeredHideList = useRef(true);
    const clearSelectionInProgress = useRef(false);
    const cachedSelectedItems = useRef(selection);
    const selectedItems = useRef(selection);

    const appliedFilterNumber = useMemo(() => selection.length, [selection]);

    const dismissPopover = useCallback(() => {
        setTextFilter('');
        setShowList(false);
        if (showList) {
            resetSelection(cachedSelectedItems.current);
            pendingClickOutsideTriggeredHideList.current = true;
        }
    }, [resetSelection, setShowList, setTextFilter, showList]);

    const dropdownClassName = useMemo(
        () =>
            cx([
                DROPDOWN_BASE_CLASS,
                { [DROPDOWN_MULTI_SELECT_CLASS]: boolOrFalse(multiSelect) },
                ...classNameModifiers.map(mod => `${DROPDOWN_BASE_CLASS}--${mod}`),
                className,
            ]),
        [className, classNameModifiers, multiSelect]
    );

    const { commitAction, commitActionButtons, committing, resetCommitAction } = useCommitAction({
        resetDisabled: !selection.length,
        onResetAction: onResetAction,
    });

    /**
     * Closes the select list:
     *   - empties the text filter
     *   - restores focus to the select button element (?)
     */
    const closeList = useCallback(() => {
        setTextFilter('');
        setShowList(false);
        resetCommitAction();

        if (!pendingClickOutsideTriggeredHideList.current) {
            toggleButtonRef.current?.focus();
        } else pendingClickOutsideTriggeredHideList.current = false;
    }, [resetCommitAction, setShowList, setTextFilter]);

    const commitSelection = useCallback(() => {
        cachedSelectedItems.current = selection;
        const value = `${selection.map(({ id }) => id)}`;
        onChange({ target: { value, name } });
    }, [name, onChange, selection]);

    useEffect(() => {
        switch (commitAction) {
            case CommitAction.APPLY:
                commitSelection();
                break;
            case CommitAction.CLEAR:
                resetSelection();
                clearSelectionInProgress.current = true;
                break;
        }
    }, [commitAction, commitSelection, resetSelection]);

    /**
     * Closes the select list and fires an onChange
     * @param e - Event
     */
    const handleSelect = useCallback(
        (e: Event) => {
            e.preventDefault();

            // If the target is not one of the list items, select the first list item
            const target: HTMLUListElement | undefined | null =
                e.currentTarget && selectListRef?.current?.contains(e.currentTarget as HTMLUListElement)
                    ? (e.currentTarget as HTMLUListElement)
                    : null; // (selectListRef?.current?.firstElementChild as HTMLUListElement);

            if (target && !target.getAttribute('data-disabled')) {
                const value = target.getAttribute('data-value');
                const item = items.find(item => item.id === value)!;
                select(item);
            }
        },
        [items, select]
    );

    useEffect(() => {
        if (selectedItems.current !== selection) {
            selectedItems.current = selection;
            if (!multiSelect || clearSelectionInProgress.current) {
                commitSelection();
                closeList();
            }
        }
        clearSelectionInProgress.current = false;
    }, [closeList, commitSelection, multiSelect, selection]);

    useEffect(() => {
        if (committing) closeList();
    }, [committing, closeList]);

    /**
     * Handle keyDown events on the selectList button
     * Opens the selectList and focuses the first element if available
     * @param evt {KeyboardEvent}
     */
    const handleButtonKeyDown = useCallback(
        (evt: KeyboardEvent) => {
            switch (evt.code) {
                case InteractionKeyCode.ESCAPE:
                case InteractionKeyCode.TAB:
                    /**
                     * Implementation notes ({@link https://w3c.github.io/aria-practices/examples/disclosure/disclosure-navigation.html article}):
                     * - When user has focused select button but not yet moved into select list, close list and keep focus on the select button
                     * - Shift+Tab out of select should close list
                     */
                    showList && closeList();
                    pendingClickOutsideTriggeredHideList.current = evt.key === InteractionKeyCode.TAB;
                    return;
                case InteractionKeyCode.ENTER:
                case InteractionKeyCode.SPACE:
                    if (filterable && showList) {
                        if (evt.key === InteractionKeyCode.ENTER) {
                            if (textFilter) handleSelect(evt);
                            else break;
                        }
                        return;
                    }
                    break;
                case InteractionKeyCode.ARROW_DOWN:
                case InteractionKeyCode.ARROW_UP:
                    break;
                default:
                    return;
            }

            evt.preventDefault();
            setShowList(true);
        },
        [closeList, filterable, handleSelect, showList, setShowList, textFilter]
    );

    useEffect(() => {
        if (showList) {
            cancelAnimationFrame(autoFocusAnimFrame.current!);

            autoFocusAnimFrame.current = requestAnimationFrame(() => {
                focus: {
                    let item = selectListRef.current?.firstElementChild as HTMLLIElement;
                    let firstAvailableItem: typeof item | undefined;

                    while (item) {
                        if (!(item.dataset.disabled && item.dataset.disabled === 'true')) {
                            if (item.getAttribute('aria-selected') === 'true') {
                                item.tabIndex = 0;
                                item.focus();
                                break focus;
                            }
                            firstAvailableItem = firstAvailableItem || item;
                        }
                        item = item.nextElementSibling as HTMLLIElement;
                    }

                    if (firstAvailableItem) {
                        firstAvailableItem.tabIndex = 0;
                        firstAvailableItem.focus();
                    }
                }
            });
        }
    }, [showList]);

    /**
     * Handle keyDown events on the list elements
     * Navigates through the list, or select an element, or focus the filter input, or close the menu.
     * @param e - KeyDownEvent
     */
    const handleListKeyDown = useCallback(
        (evt: KeyboardEvent) => {
            const target = evt.target as HTMLInputElement;

            switch (evt.code) {
                case InteractionKeyCode.ESCAPE:
                    evt.preventDefault();
                    evt.stopPropagation();
                    // When user is actively navigating through list with arrow keys - close list and keep focus on the Select Button re. a11y guidelines (above)
                    closeList();
                    break;
                case InteractionKeyCode.ENTER:
                case InteractionKeyCode.SPACE:
                    handleSelect(evt);
                    break;
                case InteractionKeyCode.ARROW_DOWN: {
                    evt.preventDefault();
                    let item = target.nextElementSibling as HTMLLIElement;
                    while (item) {
                        if (!(item.dataset.disabled && item.dataset.disabled === 'true')) {
                            target.tabIndex = -1;
                            item.tabIndex = 0;
                            item.focus();
                            break;
                        }
                        item = item.nextElementSibling as HTMLLIElement;
                    }
                    break;
                }
                case InteractionKeyCode.ARROW_UP: {
                    evt.preventDefault();
                    focus: {
                        let item = target.previousElementSibling as HTMLLIElement;
                        while (item) {
                            if (!(item.dataset.disabled && item.dataset.disabled === 'true')) {
                                target.tabIndex = -1;
                                item.tabIndex = 0;
                                item.focus();
                                break focus;
                            }
                            item = item.previousElementSibling as HTMLLIElement;
                        }
                        if (filterable && filterInputRef.current) {
                            filterInputRef.current.focus();
                        }
                    }
                    break;
                }
                default:
            }
        },
        [closeList, filterable, handleSelect]
    );

    /**
     * Updates the state with the current text filter value
     * @param e - KeyboardEvent
     */
    const handleTextFilter = useCallback(
        (e: Event) => {
            const value: string = (e.target as HTMLInputElement).value;
            setTextFilter(value.toLowerCase());
        },
        [setTextFilter]
    );

    /**
     * Toggles the selectList and focuses in either the filter input or in the selectList button
     * @param e - Event
     */
    const toggleList = useCallback(
        (e: Event) => {
            e.preventDefault();
            setShowList(showList => !showList);
            showList && resetSelection(cachedSelectedItems.current);
        },
        [setShowList, showList, resetSelection]
    );

    useEffect(() => {
        if (showList && filterable) {
            filterInputRef.current?.focus();
        }
    }, [filterable, showList]);

    return (
        <div className={dropdownClassName}>
            <SelectButton
                id={selectButtonId}
                appliedFilterNumber={appliedFilterNumber}
                active={selection}
                filterInputRef={filterInputRef}
                filterable={filterable}
                isInvalid={isInvalid}
                isValid={isValid}
                onButtonKeyDown={handleButtonKeyDown}
                onInput={handleTextFilter}
                multiSelect={multiSelect}
                placeholder={placeholder}
                readonly={readonly}
                renderButtonContent={renderButtonContent}
                selectListId={selectListId}
                showList={showList}
                toggleButtonRef={toggleButtonRef}
                toggleList={toggleList}
                withoutCollapseIndicator={withoutCollapseIndicator}
                ariaDescribedBy={!isCollatingErrors && selectButtonId ? `${selectButtonId}${ARIA_ERROR_SUFFIX}` : undefined}
                {...ariaAttributeProps}
            />
            <SelectList
                popoverClassNameModifiers={popoverClassNameModifiers}
                setToTargetWidth={setToTargetWidth}
                dismissPopover={dismissPopover}
                active={selection}
                commitActions={commitActionButtons}
                items={items}
                multiSelect={multiSelect}
                disableFocusTrap={disableFocusTrap}
                onKeyDown={handleListKeyDown}
                onSelect={handleSelect}
                selectListId={selectListId}
                ref={selectListRef}
                toggleButtonRef={toggleButtonRef}
                renderListItem={renderListItem}
                showList={showList}
                showOverlay={showOverlay}
                textFilter={textFilter}
                fitPosition={fitPosition}
                fixedPopoverPositioning={fixedPopoverPositioning}
            />
        </div>
    );
};

export default Select;
