import './LimitSelector.scss';
import { useState } from 'preact/hooks';
import useBooleanState from '@src/hooks/useBooleanState';
import ChevronUp from './chevron-up';
import ChevronDown from './chevron-down';
import cx from 'classnames';

interface SelectListProps {
    limit: number;
    onSelection: (limit: number) => void;
}
const SelectList = ({ limit, onSelection }: SelectListProps) => {
    const limitOptions = [5, 10, 20, 50, 100];
    const [selectedLimit, setSelectedLimit] = useState(limit);
    const [opened, setOpened] = useBooleanState(false);
    return (
        <>
            <div className="adyen-fp-select-limit">
                <div className="adyen-fp-select-limit__button" onClick={() => setOpened(!opened)}>
                    <span className="">{selectedLimit}</span>
                    <div className="b-dropdown-default-textbox__chevron">
                        {opened ? (
                            <ChevronUp v-show="isDropdownOpen" svg-title="opened" />
                        ) : (
                            <ChevronDown v-show="!isDropdownOpen" svg-title="closed" />
                        )}
                    </div>
                </div>
            </div>
            <div
                className={cx('adyen-fp-select-limit__container', {
                    'adyen-fp-select-limit__container--hidden': !opened,
                })}
                role="listbox"
            >
                <div className="adyen-fp-select-limit__options-box" role="listbox">
                    {limitOptions.map(item => (
                        <label
                            key={item}
                            className="adyen-fp-select-limit__option"
                            role="option"
                            aria-selected={true}
                            tabIndex={-1}
                            onClick={() => {
                                onSelection(item);
                                setSelectedLimit(item);
                                setOpened(false);
                            }}
                            onKeyDown={() => console.log(item)}
                        >
                            <span
                                className={cx('adyen-fp-select-limit__element', {
                                    'adyen-fp-select-limit__element--selected': item === selectedLimit,
                                })}
                            >
                                {item}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        </>
    );
};
export default SelectList;
