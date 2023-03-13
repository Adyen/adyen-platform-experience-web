import cx from 'classnames';
import SelectListItem from './SelectListItem';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { SelectListProps } from '../types';
import styles from '../Select.module.scss';
import { ForwardedRef, forwardRef } from 'preact/compat';

const SelectList = forwardRef(({ active, items, showList, textFilter, ...props }: SelectListProps, ref: ForwardedRef<HTMLUListElement>) => {
    const { i18n } = useCoreContext();
    const filteredItems = items.filter(item => !textFilter || item.name.toLowerCase().includes(textFilter));

    return (
        <ul
            className={cx({
                test: true,
                'adyen-fp-dropdown__list': true,
                [styles['adyen-fp-dropdown__list'] ?? 'adyen-fp-dropdown__list']: true,
                'adyen-fp-dropdown__list--active': showList,
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
                        selected={item.id === active.id}
                        isIconOnLeftSide={props.isIconOnLeftSide}
                    />
                ))
            ) : (
                <div className="adyen-fp-dropdown__element adyen-fp-dropdown__element--no-options">{i18n.get('select.noOptionsFound')}</div>
            )}
        </ul>
    );
});
export default SelectList;
