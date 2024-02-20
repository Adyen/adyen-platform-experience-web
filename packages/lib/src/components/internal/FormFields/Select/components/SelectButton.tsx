import cx from 'classnames';
import { Ref } from 'preact';
import { MutableRef } from 'preact/hooks';
import { HTMLAttributes, PropsWithChildren } from 'preact/compat';
import useCoreContext from '@src/core/Context/useCoreContext';
import Img from '@src/components/internal/Img';
import { SelectButtonProps, SelectItem } from '../types';
import styles from '../Select.module.scss';

const SelectButtonElement = <T extends SelectItem>({
    filterable,
    toggleButtonRef,
    ...props
}: PropsWithChildren<SelectButtonProps<T> & Partial<HTMLAttributes<HTMLButtonElement | HTMLDivElement>>>) => {
    return filterable ? (
        <div {...props} ref={toggleButtonRef as Ref<HTMLDivElement>} />
    ) : (
        <button {...props} ref={toggleButtonRef as MutableRef<HTMLButtonElement>} />
    );
};

const SelectButton = <T extends SelectItem>(props: SelectButtonProps<T>) => {
    const { i18n } = useCoreContext();
    const { active, readonly, showList } = props;

    return (
        <SelectButtonElement
            aria-disabled={readonly}
            aria-expanded={showList}
            aria-haspopup="listbox"
            className={cx({
                [styles['adyen-fp-dropdown__button'] ?? 'adyen-fp-dropdown__button']: true,
                'adyen-fp-dropdown__button--readonly': readonly,
                [styles['adyen-fp-dropdown__button--active'] ?? 'adyen-fp-dropdown__button--active']: showList,
                'adyen-fp-dropdown__button--invalid': props.isInvalid,
                'adyen-fp-dropdown__button--valid': props.isValid,
            })}
            filterable={props.filterable}
            onClick={!readonly ? props.toggleList : undefined}
            onKeyDown={!readonly ? props.onButtonKeyDown : undefined}
            role={props.filterable ? 'button' : undefined}
            tabIndex={0}
            title={/*active?.name || */ props.placeholder}
            toggleButtonRef={props.toggleButtonRef}
            type={!props.filterable ? 'button' : ''}
            aria-describedby={props.ariaDescribedBy}
            id={props.id ?? ''}
        >
            {!showList || !props.filterable ? (
                <>
                    <span className="adyen-fp-dropdown__button-text">{/* active?.selectedOptionName || active?.name || */ props.placeholder}</span>
                    {/*{active?.icon && <Img className="adyen-fp-dropdown__button-icon" src={active.icon} alt={active.name} />}*/}
                </>
            ) : (
                <input
                    aria-autocomplete="list"
                    aria-controls={props.selectListId}
                    aria-expanded={showList}
                    aria-owns={props.selectListId}
                    autoComplete="off"
                    className={cx('adyen-fp-filter-input', [styles['adyen-fp-filter-input']])}
                    onInput={props.onInput}
                    placeholder={i18n.get('select.filter.placeholder')}
                    ref={props.filterInputRef}
                    role="combobox"
                    type="text"
                />
            )}
        </SelectButtonElement>
    );
};

export default SelectButton;
