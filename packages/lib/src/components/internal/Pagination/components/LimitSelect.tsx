import './LimitSelector.scss';
import { useCallback, useState } from 'preact/hooks';
import useBooleanState from '@src/hooks/useBooleanState';
import ChevronUp from './chevron-up';
import ChevronDown from './chevron-down';
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

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            switch (e.code) {
                case InteractionKeyCode.ENTER:
                case InteractionKeyCode.SPACE:
                case InteractionKeyCode.ARROW_DOWN:
                    setOpened(true);
                    break;
                default:
                    break;
            }
        },
        [setOpened]
    );

    return (
        <>
            <div className="adyen-fp-select-limit">
                <div
                    className="adyen-fp-select-limit__button"
                    onClick={() => {
                        setOpened(!opened);
                    }}
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    role="button"
                    aria-haspopup="listbox"
                    aria-expanded={opened}
                >
                    <span>{selectedLimit}</span>
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
                    dismiss={() => {
                        setOpened(false);
                    }}
                    selection={selectedLimit}
                />
            )}
        </>
    );
};

export default SelectList;
