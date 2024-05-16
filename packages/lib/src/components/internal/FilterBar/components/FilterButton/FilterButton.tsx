import useButton from '../../../Button/hooks/useButton';
import { TypographyElement, TypographyVariant } from '../../../Typography/types';
import Typography from '../../../Typography/Typography';
import { parseClassName } from '../../../../../utils/class-name-utils';
import { parseBoolean } from '../../../../../utils/common';
import { ForwardedRef, forwardRef } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { FilterButtonProps } from './types';
import './FilterButton.scss';

const DEFAULT_FILTER_BUTTON_CLASSNAME = 'adyen-pe-filter-button';

function FilterButton(
    { className, classNameModifiers = [], children, disabled, onClick, ...restAttributes }: FilterButtonProps,
    ref: ForwardedRef<HTMLButtonElement>
) {
    const classNameValue = useMemo(() => parseClassName('', className) || '', [className]);
    const disabledValue = useMemo(() => parseBoolean(disabled), [disabled]);

    const { classes, click } = useButton(classNameValue, classNameModifiers, DEFAULT_FILTER_BUTTON_CLASSNAME, disabledValue, onClick);

    return (
        <button className={classes} ref={ref} onClick={click} {...restAttributes}>
            <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger={true}>
                {children}
            </Typography>
        </button>
    );
}
export default forwardRef(FilterButton);
