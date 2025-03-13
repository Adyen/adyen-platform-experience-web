import cx from 'classnames';
import { Ref } from 'preact';
import { MutableRef, useMemo } from 'preact/hooks';
import { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, PropsWithChildren } from 'preact/compat';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Img from '../../../Img';
import Button from '../../../Button';
import { ButtonVariant } from '../../../Button/types';
import Typography from '../../../Typography/Typography';
import ChevronDown from '../../../SVGIcons/ChevronDown';
import { TypographyElement, TypographyVariant } from '../../../Typography/types';
import { boolOrFalse } from '../../../../../utils';
import {
    DROPDOWN_BUTTON_ACTIVE_CLASS,
    DROPDOWN_BUTTON_CLASS,
    DROPDOWN_BUTTON_CLASSNAME,
    DROPDOWN_BUTTON_COLLAPSE_INDICATOR_CLASS,
    DROPDOWN_BUTTON_HAS_SELECTION_CLASS,
    DROPDOWN_BUTTON_ICON_CLASS,
    DROPDOWN_BUTTON_INVALID_CLASS,
    DROPDOWN_BUTTON_MULTI_SELECT_COUNTER_CLASS,
    DROPDOWN_BUTTON_READONLY_CLASS,
    DROPDOWN_BUTTON_TEXT_CLASS,
    DROPDOWN_BUTTON_VALID_CLASS,
} from '../constants';
import type { SelectButtonProps, SelectItem } from '../types';

const SelectButtonElement = <T extends SelectItem>({
    active,
    disabled,
    className,
    filterable,
    toggleButtonRef,
    ...props
}: PropsWithChildren<
    SelectButtonProps<T> &
        (Partial<ButtonHTMLAttributes<HTMLButtonElement>> &
            Partial<AnchorHTMLAttributes<HTMLAnchorElement>> &
            Partial<HTMLAttributes<HTMLDivElement>>)
>) => {
    const baseClassName = useMemo(() => (filterable ? cx(DROPDOWN_BUTTON_CLASSNAME, className) : className), [className, filterable]);
    return filterable ? (
        <div {...props} className={baseClassName} ref={toggleButtonRef as Ref<HTMLDivElement>} />
    ) : (
        <Button
            {...props}
            className={baseClassName}
            disabled={disabled}
            variant={ButtonVariant.SECONDARY}
            ref={toggleButtonRef as MutableRef<HTMLButtonElement>}
        />
    );
};

const SelectButton = <T extends SelectItem>(props: SelectButtonProps<T> & { appliedFilterNumber: number }) => {
    const { i18n } = useCoreContext();
    const { active, filterable, multiSelect, placeholder, readonly, showList, withoutCollapseIndicator } = props;
    const placeholderText = useMemo(() => placeholder?.trim() || i18n.get('select.filter.placeholder'), [i18n, placeholder]);
    const buttonActiveItem = useMemo(() => (boolOrFalse(multiSelect) ? undefined : active[0]), [active, multiSelect]);
    const buttonTitleText = useMemo(() => buttonActiveItem?.name?.trim() || placeholderText, [buttonActiveItem, placeholderText]);

    return (
        <SelectButtonElement
            active={active}
            disabled={readonly}
            aria-disabled={readonly}
            aria-expanded={showList}
            aria-haspopup="listbox"
            className={cx(DROPDOWN_BUTTON_CLASS, {
                [DROPDOWN_BUTTON_ACTIVE_CLASS]: showList,
                [DROPDOWN_BUTTON_HAS_SELECTION_CLASS]: !!active.length,
                [DROPDOWN_BUTTON_READONLY_CLASS]: readonly,
                [DROPDOWN_BUTTON_INVALID_CLASS]: props.isInvalid,
                [DROPDOWN_BUTTON_VALID_CLASS]: props.isValid,
            })}
            filterable={filterable}
            onClick={!readonly ? props.toggleList : undefined}
            onKeyDown={!readonly ? props.onButtonKeyDown : undefined}
            role={filterable ? 'button' : undefined}
            tabIndex={0}
            title={buttonTitleText}
            toggleButtonRef={props.toggleButtonRef}
            type={!filterable ? 'button' : undefined}
            aria-describedby={props.ariaDescribedBy}
            id={props.id ?? ''}
        >
            {showList && filterable ? (
                <input
                    aria-autocomplete="list"
                    aria-controls={props.selectListId}
                    aria-expanded={showList}
                    aria-owns={props.selectListId}
                    autoComplete="off"
                    className="adyen-pe-filter-input"
                    onInput={props.onInput}
                    placeholder={placeholderText}
                    ref={props.filterInputRef}
                    role="combobox"
                    type="text"
                />
            ) : (
                <>
                    {buttonActiveItem?.icon && (
                        <Img className={DROPDOWN_BUTTON_ICON_CLASS} src={buttonActiveItem.icon} alt={buttonActiveItem.name.trim()} />
                    )}
                    <span className={DROPDOWN_BUTTON_TEXT_CLASS}>
                        {buttonActiveItem?.selectedOptionName?.trim() || buttonActiveItem?.name.trim() || placeholderText}
                    </span>
                    {multiSelect && props.appliedFilterNumber > 0 && (
                        <div className={DROPDOWN_BUTTON_MULTI_SELECT_COUNTER_CLASS}>
                            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger={true}>
                                {props.appliedFilterNumber}
                            </Typography>
                        </div>
                    )}
                </>
            )}
            {!withoutCollapseIndicator && (
                <span className={DROPDOWN_BUTTON_COLLAPSE_INDICATOR_CLASS}>
                    <ChevronDown role="presentation" />
                </span>
            )}
        </SelectButtonElement>
    );
};

export default SelectButton;
