import cx from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { InteractionKeyCode } from '@src/components/types';
import { ARIA_ERROR_SUFFIX } from '@src/core/Errors/constants';
import { EMPTY_ARRAY, noop } from '@src/utils/common';
import useCommitAction, { CommitAction } from '@src/hooks/useCommitAction';
import uuid from '@src/utils/uuid';
import SelectButton from './components/SelectButton';
import SelectList from './components/SelectList';
import useSelect from './hooks/useSelect';
import { DROPDOWN_BASE_CLASS, DROPDOWN_MULTI_SELECT_CLASS } from './constants';
import { SelectItem, SelectProps } from './types';
import './Select.scss';

const Select = <T extends SelectItem>({
    className,
    classNameModifiers = EMPTY_ARRAY as [],
    items = EMPTY_ARRAY as readonly T[],
    filterable = false,
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
    isCollatingErrors,
    withoutCollapseIndicator = false,
}: SelectProps<T>) => {
    const [showList, setShowList] = useState<boolean>(false);
    const [textFilter, setTextFilter] = useState<string>('');
    const filterInputRef = useRef<HTMLInputElement>(null);
    const selectContainerRef = useRef<HTMLDivElement>(null);
    const selectListRef = useRef<HTMLUListElement>(null);
    const toggleButtonRef = useRef<HTMLButtonElement>(null);
    const selectListId = useRef(`select-${uuid()}`);

    const dropdownClassName = useMemo(
        () =>
            cx([
                DROPDOWN_BASE_CLASS,
                { [DROPDOWN_MULTI_SELECT_CLASS]: multiSelect === true },
                ...classNameModifiers.map(mod => `${DROPDOWN_BASE_CLASS}--${mod}`),
                className,
            ]),
        EMPTY_ARRAY
    );

    const { clearSelection, select, selection } = useSelect({ items, multiSelect, selected });
    const clearSelectionInProgress = useRef(false);
    const selectedItems = useRef(selection);

    const { commitAction, commitActionButtons, committing, resetCommitAction } = useCommitAction({
        resetDisabled: !selection.length,
    });

    /**
     * Closes the select list:
     *   - empties the text filter
     *   - restores focus to the select button element
     */
    const closeList = useCallback(() => {
        setTextFilter('');
        setShowList(false);
        resetCommitAction();
        if (toggleButtonRef.current) toggleButtonRef.current.focus();
    }, [resetCommitAction, setShowList, setTextFilter]);

    const commitSelection = useCallback(() => {
        const value = `${selection.map(({ id }) => id)}`;
        onChange({ target: { value, name } });
    }, [name, onChange, selection]);

    useEffect(() => {
        switch (commitAction) {
            case CommitAction.APPLY:
                commitSelection();
                break;
            case CommitAction.CLEAR:
                clearSelection();
                clearSelectionInProgress.current = true;
                break;
        }
    }, [commitAction]);

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
        committing && closeList();
    }, [committing, closeList]);

    const pendingKeyboardTriggeredShowList = useRef(false);

    /**
     * Handle keyDown events on the selectList button
     * Opens the selectList and focuses the first element if available
     * @param evt {KeyboardEvent}
     */
    const handleButtonKeyDown = useCallback(
        (evt: KeyboardEvent) => {
            switch (evt.key) {
                case InteractionKeyCode.ESCAPE:
                case InteractionKeyCode.TAB:
                    /**
                     * Implementation notes ({@link https://w3c.github.io/aria-practices/examples/disclosure/disclosure-navigation.html article}):
                     * - When user has focused select button but not yet moved into select list, close list and keep focus on the select button
                     * - Shift+Tab out of select should close list
                     */
                    closeList();
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
            pendingKeyboardTriggeredShowList.current = true;
        },
        [closeList, filterable, handleSelect, showList, setShowList, textFilter]
    );

    useEffect(() => {
        if (showList && pendingKeyboardTriggeredShowList.current) {
            pendingKeyboardTriggeredShowList.current = false;

            let item = selectListRef.current?.firstElementChild as HTMLLIElement;

            while (item) {
                if (!(item.dataset.disabled && item.dataset.disabled === 'true')) {
                    item.focus();
                    break;
                }
                item = item.nextElementSibling as HTMLLIElement;
            }
        }
    }, [showList]);

    /**
     * Close the select list when clicking outside the list
     * @param e - MouseEvent
     */
    const handleClickOutside = useCallback(
        (evt: MouseEvent) => {
            // use composedPath so it can also check when inside a web component
            // if composedPath is not available fallback to e.target
            const clickIsOutside =
                selectContainerRef.current && evt.composedPath
                    ? !evt.composedPath().includes(selectContainerRef.current)
                    : !selectContainerRef.current?.contains(evt.target as HTMLElement);
            if (clickIsOutside) {
                setTextFilter('');
                setShowList(false);
            }
        },
        [setShowList, setTextFilter]
    );

    /**
     * Handle keyDown events on the list elements
     * Navigates through the list, or select an element, or focus the filter input, or close the menu.
     * @param e - KeyDownEvent
     */
    const handleListKeyDown = useCallback(
        (evt: KeyboardEvent) => {
            const target = evt.target as HTMLInputElement;

            switch (evt.key) {
                case InteractionKeyCode.ESCAPE:
                    evt.preventDefault();
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
                case InteractionKeyCode.TAB:
                    closeList();
                    break;
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
            setShowList(!showList);
        },
        [setShowList]
    );

    useEffect(() => {
        if (showList && filterable && filterInputRef.current) {
            filterInputRef.current.focus();
        }
    }, [showList]);

    useEffect(() => {
        document.addEventListener('click', handleClickOutside, false);

        return () => {
            document.removeEventListener('click', handleClickOutside, false);
        };
    }, []);

    return (
        <div ref={selectContainerRef} className={dropdownClassName}>
            <SelectButton
                id={uniqueId ?? undefined}
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
                selectListId={selectListId.current}
                showList={showList}
                toggleButtonRef={toggleButtonRef}
                toggleList={toggleList}
                withoutCollapseIndicator={withoutCollapseIndicator}
                ariaDescribedBy={!isCollatingErrors && uniqueId ? `${uniqueId}${ARIA_ERROR_SUFFIX}` : ''}
            />
            <SelectList
                active={selection}
                commitActions={commitActionButtons}
                items={items}
                multiSelect={multiSelect}
                onKeyDown={handleListKeyDown}
                onSelect={handleSelect}
                selectListId={selectListId.current}
                ref={selectListRef}
                toggleButtonRef={toggleButtonRef}
                renderListItem={renderListItem}
                showList={showList}
                textFilter={textFilter}
            />
        </div>
    );
};

export default Select;
