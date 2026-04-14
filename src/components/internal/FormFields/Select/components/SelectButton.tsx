import cx from 'classnames';
import { MutableRef, useMemo } from 'preact/hooks';
import { HTMLAttributes, PropsWithChildren } from 'preact/compat';
import { AnchorHTMLAttributes, ButtonHTMLAttributes, Ref } from 'preact';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Img from '../../../Img';
import Icon from '../../../Icon';
import Button from '../../../Button';
import { ButtonVariant } from '../../../Button/types';
import Typography from '../../../Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../Typography/types';
import { boolOrFalse } from '../../../../../utils';
import { DEFAULT_BUTTON_CLASSNAME } from '../../../Button/constants';
import { getModifierClasses } from '../../../../../utils/preact';
import {
    DROPDOWN_BUTTON_ACTIVE_CLASS,
    DROPDOWN_BUTTON_CLASS,
    DROPDOWN_BUTTON_CLEAR_CLASS,
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
import { InteractionKeyCode } from '../../../../types';

const SelectButtonElement = <T extends SelectItem>({
    active,
    disabled,
    className,
    filterable,
    toggleButtonRef,
    buttonVariant,
    ...props
}: PropsWithChildren<
    SelectButtonProps<T> &
        (Partial<ButtonHTMLAttributes<HTMLButtonElement>> &
            Partial<AnchorHTMLAttributes<HTMLAnchorElement>> &
            Partial<HTMLAttributes<HTMLDivElement>>)
>) => {
    const variant = buttonVariant ?? ButtonVariant.SECONDARY;
    const buttonClasses = useMemo(() => getModifierClasses(DEFAULT_BUTTON_CLASSNAME, [variant], [DEFAULT_BUTTON_CLASSNAME]), [variant]);
    const baseClassName = useMemo(() => (filterable ? cx(buttonClasses, className) : className), [buttonClasses, className, filterable]);
    return filterable ? (
        <div {...props} className={baseClassName} ref={toggleButtonRef as Ref<HTMLDivElement>} />
    ) : (
        <Button
            {...props}
            className={baseClassName}
            disabled={disabled}
            variant={variant}
            ref={toggleButtonRef as MutableRef<HTMLButtonElement>}
            aria-label={props['aria-label']}
            aria-labelledby={props['aria-labelledby']}
        />
    );
};

const SelectButton = <T extends SelectItem>({
    active,
    clearable,
    filterable,
    multiSelect,
    placeholder,
    onClear,
    readonly,
    showList,
    withoutCollapseIndicator,
    buttonVariant,
    isInvalid,
    isValid,
    name,
    toggleList,
    onButtonKeyDown,
    toggleButtonRef,
    ariaDescribedBy,
    id,
    renderButtonContent,
    selectListId,
    onInput,
    onFilterInputKeyDown,
    filterInputRef,
    appliedFilterNumber,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
}: SelectButtonProps<T> & { appliedFilterNumber: number }) => {
    const { i18n } = useCoreContext();
    const placeholderText = useMemo(() => placeholder?.trim() || i18n.get('common.inputs.select.placeholder'), [i18n, placeholder]);
    const buttonActiveItem = useMemo(() => (boolOrFalse(multiSelect) ? undefined : active[0]), [active, multiSelect]);
    const buttonTitleText = useMemo(() => buttonActiveItem?.name?.trim() || placeholderText, [buttonActiveItem, placeholderText]);
    const showClearButton = useMemo(() => boolOrFalse(clearable) && !!active.length && !readonly, [active, clearable, readonly]);

    return (
        <SelectButtonElement
            buttonVariant={buttonVariant}
            active={active}
            disabled={readonly}
            aria-disabled={readonly}
            aria-expanded={showList}
            aria-haspopup="dialog"
            aria-invalid={isInvalid}
            className={cx(DROPDOWN_BUTTON_CLASS, {
                [DROPDOWN_BUTTON_ACTIVE_CLASS]: showList,
                [DROPDOWN_BUTTON_HAS_SELECTION_CLASS]: !!active.length,
                [DROPDOWN_BUTTON_READONLY_CLASS]: readonly,
                [DROPDOWN_BUTTON_INVALID_CLASS]: isInvalid,
                [DROPDOWN_BUTTON_VALID_CLASS]: isValid,
            })}
            filterable={filterable}
            name={name}
            onClick={!readonly ? toggleList : undefined}
            onKeyDown={!readonly ? onButtonKeyDown : undefined}
            role={!filterable || showList ? 'button' : undefined}
            tabIndex={0}
            title={buttonTitleText}
            toggleButtonRef={toggleButtonRef}
            type={filterable ? undefined : 'button'}
            aria-describedby={ariaDescribedBy}
            id={id}
            {...(showList && filterable ? {} : { 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledby })}
        >
            {renderButtonContent ? (
                renderButtonContent({ item: buttonActiveItem })
            ) : showList && filterable ? (
                <input
                    aria-autocomplete="list"
                    aria-label={ariaLabel}
                    aria-labelledby={ariaLabelledby}
                    aria-controls={selectListId}
                    aria-expanded={showList}
                    aria-owns={selectListId}
                    aria-invalid={isInvalid}
                    autoComplete="off"
                    className="adyen-pe-filter-input"
                    onInput={onInput}
                    onKeyDown={onFilterInputKeyDown}
                    placeholder={placeholderText}
                    ref={filterInputRef}
                    role="combobox"
                    type="text"
                />
            ) : (
                <>
                    {buttonActiveItem?.icon && (
                        <Img className={DROPDOWN_BUTTON_ICON_CLASS} src={buttonActiveItem.icon} alt={buttonActiveItem?.name?.trim() ?? ''} />
                    )}
                    <span className={DROPDOWN_BUTTON_TEXT_CLASS}>{buttonActiveItem?.selectedOptionName?.trim() || buttonTitleText}</span>
                    {multiSelect && appliedFilterNumber > 0 && (
                        <div className={DROPDOWN_BUTTON_MULTI_SELECT_COUNTER_CLASS}>
                            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger={true}>
                                {appliedFilterNumber}
                            </Typography>
                        </div>
                    )}
                </>
            )}
            {!withoutCollapseIndicator && !showClearButton && (
                <span className={DROPDOWN_BUTTON_COLLAPSE_INDICATOR_CLASS}>
                    <Icon name="chevron-down" />
                </span>
            )}
            {showClearButton && (
                <span
                    role="button"
                    tabIndex={0}
                    className={DROPDOWN_BUTTON_CLEAR_CLASS}
                    onClick={onClear}
                    onKeyDown={e => {
                        if (e.code === InteractionKeyCode.ENTER || e.code === InteractionKeyCode.SPACE) {
                            onClear?.(e);
                        }
                    }}
                >
                    <Icon name="cross-circle-fill" />
                </span>
            )}
        </SelectButtonElement>
    );
};

export default SelectButton;
