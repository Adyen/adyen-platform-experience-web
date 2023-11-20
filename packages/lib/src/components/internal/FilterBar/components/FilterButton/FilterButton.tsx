import useButton from '@src/components/internal/Button/hooks/useButton';
import { TypographyElement, TypographyVariant } from '@src/components/internal/Typography/types';
import Typography from '@src/components/internal/Typography/Typography';
import { parseClassName } from '@src/utils/class-name-utils';
import { parseBoolean } from '@src/utils/common';
import { Ref } from 'preact';
import { forwardRef } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { FilterButtonProps } from './types';
import './FilterButton.scss';

const DEFAULT_FILTER_BUTTON_CLASSNAME = 'adyen-fp-filter-button';

function FilterButton(
    { className, classNameModifiers = [], children, disabled, onClick, ...restAttributes }: FilterButtonProps,
    ref: Ref<HTMLButtonElement>
) {
    const classNameValue = useMemo(() => parseClassName('', className) || '', [className]);
    const disabledValue = useMemo(() => parseBoolean(disabled), [disabled]);

    const { classes, click } = useButton(classNameValue, classNameModifiers, DEFAULT_FILTER_BUTTON_CLASSNAME, disabledValue, onClick);

    return (
        <button className={classes} ref={ref} role={'button'} onClick={click} {...restAttributes}>
            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger={true}>
                {children}
            </Typography>
        </button>
    );
}
export default forwardRef(FilterButton);
