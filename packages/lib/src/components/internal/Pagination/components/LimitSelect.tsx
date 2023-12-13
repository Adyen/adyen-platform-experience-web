import { useCallback, useRef } from 'preact/hooks';
import { ListBox, ListBoxControl, ListBoxControlProps, ListBoxProps, useListBox } from '@src/components/internal/ListBox';
import ChevronUp from './chevron-up';
import ChevronDown from './chevron-down';
import './LimitSelector.scss';

interface SelectListProps {
    limit: number;
    onSelection: (limit: number) => void;
}

type OptionType = (typeof LIMIT_OPTIONS)[number];

const LIMIT_OPTIONS = [5, 10, 20, 50, 100];

const SELECT_BASE_CLASS = 'adyen-fp-select-limit';
const SELECT_BUTTON_CLASS = `${SELECT_BASE_CLASS}__button`;
const SELECT_OPTION_CLASS = `${SELECT_BASE_CLASS}__option`;
const SELECT_OPTION_ELEMENT_CLASS = `${SELECT_BASE_CLASS}__element`;
const SELECT_LIST_CLASS = `${SELECT_OPTION_CLASS}s-box`;
const SELECT_LIST_CONTAINER_CLASS = `${SELECT_BASE_CLASS}__container`;

const SelectList = ({ limit, onSelection }: SelectListProps) => {
    const { expand, ref, ...listBoxProps } = useListBox(LIMIT_OPTIONS, { onSelection, selectedOption: limit });
    const buttonControlRef = useRef<HTMLButtonElement | null>(null);

    const renderControl = useCallback(
        (({ activeOption, expanded }) => (
            <>
                <span>{activeOption}</span>
                <div className="b-dropdown-default-textbox__chevron">
                    {expanded ? <ChevronUp svg-title="opened" /> : <ChevronDown svg-title="closed" />}
                </div>
            </>
        )) as ListBoxControlProps<OptionType>['render'],
        []
    );

    const renderOption = useCallback(
        (option => <span className={SELECT_OPTION_ELEMENT_CLASS}>{option}</span>) as ListBoxProps<OptionType>['render'],
        []
    );

    return (
        <>
            <div className={SELECT_BASE_CLASS}>
                <ListBoxControl
                    ref={buttonControlRef}
                    listBox={ref}
                    className={SELECT_BUTTON_CLASS}
                    expand={expand}
                    render={renderControl}
                    state={listBoxProps.state}
                />
            </div>
            <ListBox
                ref={ref}
                className={SELECT_LIST_CONTAINER_CLASS}
                listClassName={SELECT_LIST_CLASS}
                optionClassName={SELECT_OPTION_CLASS}
                aria-labelledby="listbox"
                render={renderOption}
                {...listBoxProps}
            />
        </>
    );
};

export default SelectList;
