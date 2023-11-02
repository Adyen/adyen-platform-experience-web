import { TypographyElement, TypographyVariant } from '@src/components/internal/Typography/types';
import Typography from '@src/components/internal/Typography/Typography';
import classNames from 'classnames';
import { Ref } from 'preact';
import { forwardRef } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { FilterButtonProps } from './types';

function FilterButton(
    { ariaAttributes, classNameModifiers = [], children, type, disabled, tabIndex, onClick }: FilterButtonProps,
    ref: Ref<HTMLButtonElement>
) {
    const classes = useMemo(
        () => classNames('adyen-fp-filter-button', ...classNameModifiers.map(m => `adyen-fp-filter-button--${m}`)),
        [classNameModifiers]
    );

    return (
        <button
            className={classes}
            type={type}
            disabled={disabled}
            onClick={onClick}
            tabIndex={tabIndex}
            ref={ref}
            role={'button'}
            {...ariaAttributes}
        >
            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger={true}>
                {children}
            </Typography>
        </button>
    );
}
export default forwardRef(FilterButton);
