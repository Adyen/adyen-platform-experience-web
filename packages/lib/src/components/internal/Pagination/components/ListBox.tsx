import { useCallback, useEffect } from 'preact/hooks';
import cx from 'classnames';
import { InteractionKeyCode } from '@src/components/types';

type ListBoxProps = {
    dismiss: () => void;
    onSelection: (limit: number) => void;
    options: number[];
    listBoxRef: any;
    selection: number;
    focusTrap: any;
};
const ListBox = ({ dismiss, onSelection, options, listBoxRef, selection, focusTrap }: ListBoxProps) => {
    const handleKeyDown = (event: KeyboardEvent, item: number) => {
        if (event.code === InteractionKeyCode.ENTER || event.code === InteractionKeyCode.SPACE) {
            event.preventDefault();
            onSelection(item);
            dismiss();
        }

        if (event.code === InteractionKeyCode.ESCAPE) {
            dismiss();
        }
    };

    const handleClickOutside = useCallback(
        (e: Event) => {
            const element = document.getElementById('listbox');
            if (!element?.contains(e.target as Node)) {
                dismiss();
            }
        },
        [dismiss]
    );

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);
    return (
        <>
            <div
                id={'listbox'}
                className="adyen-fp-select-limit__container"
                role="listbox"
                tabIndex={-1} // Make the container focusable
                aria-labelledby="listbox-label" // Reference to the id of the label of the listbox, if you have one
                ref={listBoxRef}
            >
                <ul className="adyen-fp-select-limit__options-box" role="listbox" tabIndex={0} ref={focusTrap}>
                    {options.map(item => (
                        <li
                            key={item}
                            className="adyen-fp-select-limit__option"
                            role="option"
                            tabIndex={0}
                            aria-selected={item === selection}
                            onClick={() => {
                                onSelection(item);
                                dismiss();
                            }}
                            onKeyDown={event => handleKeyDown(event, item)} // Handle keyboard interactions
                        >
                            <span
                                className={cx('adyen-fp-select-limit__element', {
                                    'adyen-fp-select-limit__element--selected': item === selection,
                                })}
                            >
                                {item}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default ListBox;
