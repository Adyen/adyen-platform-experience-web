import './LimitSelector.scss';
import { useRef, useState } from 'preact/hooks';
import useBooleanState from '@src/hooks/useBooleanState';
import ChevronUp from './chevron-up';
import ChevronDown from './chevron-down';
import useFocusTrap from '@src/hooks/element/useFocusTrap';
import ListBox from '@src/components/internal/Pagination/components/ListBox';
import { InteractionKeyCode } from '@src/components/types';

interface SelectListProps {
    limit: number;
    onSelection: (limit: number) => void;
}

const SelectList = ({ limit, onSelection }: SelectListProps) => {
    const limitOptions = [5, 10, 20, 50, 100];
    const [selectedLimit, setSelectedLimit] = useState(limit);
    const [opened, setOpened] = useBooleanState(false);

    // Function to handle keyboard interactions

    const listBoxRef = useRef<HTMLDivElement>(null);
    const focusTrap = useFocusTrap(listBoxRef, () => setOpened(false));

    return (
        <>
            <div className="adyen-fp-select-limit">
                <div
                    className="adyen-fp-select-limit__button"
                    onClick={() => {
                        setOpened(!opened);
                    }}
                    tabIndex={0} // Make this div focusable
                    onKeyDown={e => e.key === InteractionKeyCode.ENTER && setOpened(!opened)} // Allow toggling with the Enter key
                    role="button" // Indicate that this div acts as a button
                    aria-haspopup="listbox" // Indicate that this button controls a listbox
                    aria-expanded={opened} // Indicate whether the listbox is expanded
                >
                    <span className="">{selectedLimit}</span>
                    <div className="b-dropdown-default-textbox__chevron">
                        {opened ? <ChevronUp svg-title="opened" /> : <ChevronDown svg-title="closed" />}
                    </div>
                </div>
            </div>
            {opened && (
                <ListBox
                    options={limitOptions}
                    onSelection={(limit: number) => {
                        onSelection(limit);
                        setSelectedLimit(limit);
                    }}
                    dismiss={() => setOpened(false)}
                    focusTrap={focusTrap}
                    selection={selectedLimit}
                    listBoxRef={listBoxRef}
                />
            )}
        </>
    );
};

export default SelectList;
