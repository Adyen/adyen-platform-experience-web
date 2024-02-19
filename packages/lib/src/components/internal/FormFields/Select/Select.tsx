import cx from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { InteractionKeyCode } from '@src/components/types';
import { ARIA_ERROR_SUFFIX } from '@src/core/Errors/constants';
import { EMPTY_ARRAY, noop } from '@src/utils/common';
import uuid from '@src/utils/uuid';
import SelectButton from './components/SelectButton';
import SelectList from './components/SelectList';
import { DROPDOWN_BASE_CLASS } from './constants';
import { SelectItem, SelectProps } from './types';
import './Select.scss';

const Select = <T extends SelectItem>({
    className,
    classNameModifiers = EMPTY_ARRAY as [],
    items = EMPTY_ARRAY as readonly T[],
    filterable = false,
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
    isIconOnLeftSide = false,
}: SelectProps<T>) => {
    const [showList, setShowList] = useState<boolean>(false);
    const [textFilter, setTextFilter] = useState<string>('');
    const filterInputRef = useRef<HTMLInputElement>(null);
    const selectContainerRef = useRef<HTMLDivElement>(null);
    const selectListRef = useRef<HTMLUListElement>(null);
    const toggleButtonRef = useRef<HTMLButtonElement>(null);
    const selectListId = useRef(`select-${uuid()}`);

    const dropdownClassName = useMemo(
        () => cx([DROPDOWN_BASE_CLASS, ...classNameModifiers.map(mod => `${DROPDOWN_BASE_CLASS}--${mod}`), className]),
        EMPTY_ARRAY
    );

    const active = useMemo(() => {
        const _selected = (EMPTY_ARRAY as readonly T['id'][]).concat(selected ?? EMPTY_ARRAY).filter(Boolean);
        return Object.freeze(items.filter(item => _selected.includes(item.id)));
    }, [items, selected]);

    /**
     * Closes the select list:
     *   - empties the text filter
     *   - restores focus to the select button element
     */
    const closeList = useCallback(() => {
        setTextFilter('');
        setShowList(false);
        if (toggleButtonRef.current) toggleButtonRef.current.focus();
    }, [setShowList, setTextFilter]);

    /**
     * Closes the select list and fires an onChange
     * @param e - Event
     */
    const handleSelect = (e: Event) => {
        e.preventDefault();

        // If the target is not one of the list items, select the first list item
        const target: HTMLUListElement | undefined | null =
            e.currentTarget && selectListRef?.current?.contains(e.currentTarget as HTMLUListElement)
                ? (e.currentTarget as HTMLUListElement)
                : (selectListRef?.current?.firstElementChild as HTMLUListElement);

        if (!target.getAttribute('data-disabled')) {
            closeList();
            const value = target.getAttribute('data-value');
            onChange({ target: { value, name: name } });
        }
    };

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

            if (selectListRef.current?.firstElementChild) {
                (selectListRef.current.firstElementChild as HTMLLIElement).focus();
            }
        },
        [closeList, filterable, handleSelect, showList, setShowList, textFilter]
    );

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
                case InteractionKeyCode.ARROW_DOWN:
                    evt.preventDefault();
                    if (target.nextElementSibling) (target.nextElementSibling as HTMLElement).focus();
                    break;
                case InteractionKeyCode.ARROW_UP:
                    evt.preventDefault();
                    if (target.previousElementSibling) {
                        (target.previousElementSibling as HTMLElement).focus();
                    } else if (filterable && filterInputRef.current) {
                        filterInputRef.current.focus();
                    }
                    break;
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
    const handleTextFilter = (e: Event) => {
        const value: string = (e.target as HTMLInputElement).value;
        setTextFilter(value.toLowerCase());
    };

    /**
     * Toggles the selectList and focuses in either the filter input or in the selectList button
     * @param e - Event
     */
    const toggleList = (e: Event) => {
        e.preventDefault();
        setShowList(!showList);
    };

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
                active={active}
                filterInputRef={filterInputRef}
                filterable={filterable}
                isInvalid={isInvalid}
                isValid={isValid}
                isIconOnLeftSide={isIconOnLeftSide}
                onButtonKeyDown={handleButtonKeyDown}
                onInput={handleTextFilter}
                placeholder={placeholder}
                readonly={readonly}
                selectListId={selectListId.current}
                showList={showList}
                toggleButtonRef={toggleButtonRef}
                toggleList={toggleList}
                ariaDescribedBy={!isCollatingErrors && uniqueId ? `${uniqueId}${ARIA_ERROR_SUFFIX}` : ''}
            />
            <SelectList
                active={active}
                items={items}
                isIconOnLeftSide={isIconOnLeftSide}
                onKeyDown={handleListKeyDown}
                onSelect={handleSelect}
                selectListId={selectListId.current}
                ref={selectListRef}
                renderListItem={renderListItem}
                showList={showList}
                textFilter={textFilter}
            />
        </div>
    );
};

export default Select;
