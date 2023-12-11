import './LimitSelector.scss';
import { useCallback, useRef, useState } from 'preact/hooks';
import useBooleanState from '@src/hooks/useBooleanState';
import ChevronUp from './chevron-up';
import ChevronDown from './chevron-down';
import ListBox from '@src/components/internal/Pagination/components/ListBox';
import { InteractionKeyCode } from '@src/components/types';
import useUniqueIdentifier from '@src/hooks/element/useUniqueIdentifier';
import useIdentifierString from '@src/hooks/element/useIdentifierString';

interface SelectListProps {
    limit: number;
    onSelection: (limit: number) => void;
}

const SelectList = ({ limit, onSelection }: SelectListProps) => {
    const limitOptions = [5, 10, 20, 50, 100];
    const [selectedLimit, setSelectedLimit] = useState(limit);
    const [opened, setOpened] = useBooleanState(false);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            switch (e.code) {
                case InteractionKeyCode.ARROW_DOWN:
                    setOpened(true);
                    break;
                default:
                    break;
            }
        },
        [setOpened]
    );

    const buttonRef = useRef<HTMLButtonElement>(null);
    const listBoxRef = useUniqueIdentifier();

    console.log(listBoxRef.current);

    const identifier = useIdentifierString(listBoxRef);
    return (
        <>
            <div className="adyen-fp-select-limit">
                <button
                    ref={buttonRef}
                    className="adyen-fp-select-limit__button"
                    onClick={() => {
                        setOpened(!opened);
                    }}
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    aria-haspopup="listbox"
                    aria-expanded={opened}
                    aria-controls={identifier}
                >
                    <span>{selectedLimit}</span>
                    <div className="b-dropdown-default-textbox__chevron">
                        {opened ? <ChevronUp svg-title="opened" /> : <ChevronDown svg-title="closed" />}
                    </div>
                </button>
            </div>
            {opened && (
                <ListBox
                    ref={listBoxRef}
                    options={limitOptions}
                    onSelection={(limit: number) => {
                        onSelection(limit);
                        setSelectedLimit(limit);
                    }}
                    dismiss={(focusController = false) => {
                        setOpened(false);
                        if (focusController) buttonRef.current?.focus();
                    }}
                    selection={selectedLimit}
                />
            )}
        </>
    );
};

export default SelectList;
