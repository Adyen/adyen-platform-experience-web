import { memo } from 'preact/compat';
import { useCallback, useRef } from 'preact/hooks';
import ChevronUp from './chevron-up';
import ChevronDown from './chevron-down';
import { ListBox, ListBoxControl, ListBoxControlProps, ListBoxProps, useListBox, UseListBoxConfig } from '@src/components/internal/ListBox';
import './LimitSelect.scss';

interface SelectListProps<T extends any = any> extends UseListBoxConfig<T> {
    options: readonly T[];
}

const SELECT_BASE_CLASS = 'adyen-fp-select-limit';
const SELECT_BUTTON_CLASS = `${SELECT_BASE_CLASS}__button`;
const SELECT_OPTION_CLASS = `${SELECT_BASE_CLASS}__option`;
const SELECT_OPTION_ELEMENT_CLASS = `${SELECT_BASE_CLASS}__element`;
const SELECT_LIST_CLASS = `${SELECT_OPTION_CLASS}s-box`;
const SELECT_LIST_CONTAINER_CLASS = `${SELECT_BASE_CLASS}__container`;

const LimitSelect = ({ options, ...listBoxConfig }: SelectListProps) => {
    const { expand, ref, ...listBoxProps } = useListBox(options, listBoxConfig);
    const buttonControlRef = useRef<HTMLButtonElement | null>(null);

    const renderControl = useCallback(
        (({ activeOption, expanded }) => (
            <>
                <span>{activeOption}</span>
                <div className="b-dropdown-default-textbox__chevron">
                    {expanded ? <ChevronUp svg-title="opened" /> : <ChevronDown svg-title="closed" />}
                </div>
            </>
        )) as ListBoxControlProps<(typeof options)[number]>['render'],
        []
    );

    const renderOption = useCallback(
        (option => <span className={SELECT_OPTION_ELEMENT_CLASS}>{option}</span>) as ListBoxProps<(typeof options)[number]>['render'],
        []
    );

    return options.length > 1 ? (
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
                render={renderOption}
                {...listBoxProps}
            />
        </>
    ) : null;
};

export default memo(LimitSelect);
