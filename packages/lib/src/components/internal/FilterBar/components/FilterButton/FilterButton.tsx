import { TypographyElement, TypographyVariant } from '@src/components/internal/Typography/types';
import Typography from '@src/components/internal/Typography/Typography';
import getModifierClasses from '@src/utils/get-modifier-classes';
import { Ref } from 'preact';
import { forwardRef } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { FilterButtonProps } from './types';
import './FilterButton.scss';

const DEFAULT_FILTER_BUTTON_CLASSNAME = 'adyen-fp-filter-button';

function FilterButton(
    { className, classNameModifiers = [], children, type, disabled, tabIndex, onClick, ...props }: FilterButtonProps,
    ref: Ref<HTMLButtonElement>
) {
    const classes = useMemo(
        () => getModifierClasses(DEFAULT_FILTER_BUTTON_CLASSNAME, classNameModifiers, [DEFAULT_FILTER_BUTTON_CLASSNAME, className]),
        [classNameModifiers, className]
    );

    return (
        <button className={classes} type={type} disabled={disabled} onClick={onClick} tabIndex={tabIndex} ref={ref} role={'button'} {...props}>
            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger={true}>
                {children}
            </Typography>
        </button>
    );
}
export default forwardRef(FilterButton);
