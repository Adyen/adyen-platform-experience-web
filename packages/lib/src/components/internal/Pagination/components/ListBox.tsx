import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { InteractionKeyCode } from '@src/components/types';
import { createRef } from 'preact';
import { focusIsWithin } from '@src/utils/tabbable';

type ListBoxProps = {
    dismiss: () => void;
    onSelection: (limit: number) => void;
    options: number[];
    selection: number;
};

const LIST_ID = 'listbox';
const ListBox = ({ dismiss, onSelection, options, selection }: ListBoxProps) => {
    const [activeDescendant, setActiveDescendant] = useState(selection);
    const optionRefs = useRef(options.map(() => createRef())); // Create a ref for each option

    const setFocus = useCallback(
        (index: number) => {
            optionRefs.current[index]?.current.setAttribute('aria-selected', 'true');
            optionRefs.current[index]?.current.focus();
        },
        [optionRefs.current.length]
    );
    const focusOption = useCallback(
        (item: number, dir: 'next' | 'prev') => {
            const currentIndex = options.indexOf(item);
            const index = dir === 'next' ? (currentIndex + 1) % options.length : (currentIndex - 1 + options.length) % options.length;

            optionRefs.current[currentIndex]?.current.setAttribute('aria-selected', 'false');

            setFocus(index);
            setActiveDescendant(item);
        },
        [options.length, setFocus, setActiveDescendant]
    );
    const handleKeyDown = (event: KeyboardEvent, item: number) => {
        event.stopPropagation();
        switch (event.code) {
            case InteractionKeyCode.ENTER:
                onSelection(item);
                dismiss();
                break;
            case InteractionKeyCode.ESCAPE:
                dismiss();
                break;
            case InteractionKeyCode.ARROW_DOWN:
                focusOption(item, 'next');
                break;
            case InteractionKeyCode.ARROW_UP:
                focusOption(item, 'prev');
                break;
            default:
                break;
        }
    };

    const handleClickOutside = useCallback(
        (e: Event) => {
            const element = document.getElementById(LIST_ID);
            if (!element?.contains(e.target as Node)) {
                dismiss();
            }
        },
        [dismiss]
    );

    const containerRef = useRef<HTMLDivElement>(null);

    const handleFocusOut = useCallback(
        (e: any) => {
            if (!focusIsWithin(containerRef.current ?? undefined, e.relatedTarget)) dismiss();
        },
        [containerRef.current]
    );

    useEffect(() => {
        containerRef.current?.addEventListener('focusout', handleFocusOut);
        const selectionIndex = options.indexOf(selection);
        setFocus(selectionIndex);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);
    return (
        <div
            ref={containerRef}
            id={LIST_ID}
            className="adyen-fp-select-limit__container"
            role="listbox"
            tabIndex={-1}
            aria-labelledby="listbox-label"
        >
            <ul
                aria-activedescendant={`${activeDescendant}`}
                className="adyen-fp-select-limit__options-box"
                role="listbox"
                tabIndex={-1}
                onKeyDown={event => {
                    if (event.code === InteractionKeyCode.ARROW_DOWN) {
                        const currentIndex = options.indexOf(selection);

                        optionRefs.current[currentIndex]?.current.focus();
                    }
                }}
            >
                {options.map((item, i) => (
                    <li
                        ref={optionRefs.current[i]}
                        data-value={item}
                        key={item}
                        className="adyen-fp-select-limit__option"
                        role="option"
                        tabIndex={-1}
                        aria-selected={item === selection}
                        onClick={() => {
                            onSelection(item);
                            dismiss();
                        }}
                        onKeyDown={event => handleKeyDown(event, item)} // Handle keyboard interactions
                    >
                        <span className="adyen-fp-select-limit__element">{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ListBox;
