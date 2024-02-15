import cx from 'classnames';
import SelectListItem from './SelectListItem';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { SelectItem, SelectListProps } from '../types';
import styles from '../Select.module.scss';
import { ForwardedRef, forwardRef } from 'preact/compat';

const SelectList = forwardRef(
    <T extends SelectItem>({ active, items, showList, textFilter, ...props }: SelectListProps<T>, ref: ForwardedRef<HTMLUListElement>) => {
        const { i18n } = useCoreContext();
        const filteredItems = items.filter(item => !textFilter || item.name.toLowerCase().includes(textFilter));

        return (
            <ul
                className={cx({
                    [styles['adyen-fp-dropdown__list'] ?? 'adyen-fp-dropdown__list']: true,
                    [styles['adyen-fp-dropdown__list--active'] ?? 'adyen-fp-dropdown__list--active']: showList,
                })}
                id={props.selectListId}
                ref={ref}
                role="listbox"
            >
                {filteredItems.length ? (
                    filteredItems.map(item => (
                        <SelectListItem
                            item={item}
                            key={item.id}
                            onKeyDown={props.onKeyDown}
                            onSelect={props.onSelect}
                            selected={active.includes(item)}
                            isIconOnLeftSide={props.isIconOnLeftSide}
                        />
                    ))
                ) : (
                    <div className="adyen-fp-dropdown__element adyen-fp-dropdown__element--no-options">{i18n.get('select.noOptionsFound')}</div>
                )}
            </ul>
        );
    }
);

export default SelectList;
