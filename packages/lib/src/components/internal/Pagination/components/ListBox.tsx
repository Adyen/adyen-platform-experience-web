import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { InteractionKeyCode } from '@src/components/types';
import { createRef } from 'preact';
import { focusIsWithin } from '@src/utils/tabbable';
import { forwardRef } from 'preact/compat';

type ListBoxProps = {
    dismiss: (focusController?: boolean) => void;
    onSelection: (limit: number) => void;
    options: number[];
    selection: number;
};

const ListBox = forwardRef<any, ListBoxProps>(({ dismiss, onSelection, options, selection }, ref) => {
    const [activeDescendant, setActiveDescendant] = useState(selection);
    const optionRefs = useRef(options.map(() => createRef())); // Create a ref for each option

    const setFocus = useCallback(
        (index?: number) => {
            const selectedIndex = index ?? options.indexOf(selection);
            optionRefs.current[selectedIndex]?.current.setAttribute('aria-selected', 'true');
            optionRefs.current[selectedIndex]?.current.focus();
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
                dismiss(true);
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

    const handleFocusOut = useCallback(
        (e: any) => {
            if (!focusIsWithin((ref as any).current ?? undefined, e.relatedTarget)) dismiss();
        },
        [(ref as any).current]
    );

    useEffect(() => {
        (ref as any).current?.addEventListener('focusout', handleFocusOut);
        setFocus();

        return () => {
            document.removeEventListener('focusout', handleFocusOut);
        };
    }, []);
    return (
        <div
            ref={ref}
            className="adyen-fp-select-limit__container"
            role="listbox"
            tabIndex={-1}
            aria-labelledby="listbox"
            aria-activedescendant={`${activeDescendant}`}
        >
            <ul
                className="adyen-fp-select-limit__options-box"
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
});

export default ListBox;
