import useButton from '../../../Button/hooks/useButton';
import { TypographyElement, TypographyVariant } from '../../../Typography/types';
import Typography from '../../../Typography/Typography';
import { fixedForwardRef, parseBooleanProp, parseClassName } from '../../../../../utils/preact';
import { ForwardedRef } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { FilterButtonProps } from './types';
import './FilterButton.scss';

const DEFAULT_FILTER_BUTTON_CLASSNAME = 'adyen-pe-filter-button';

function FilterButton(props: FilterButtonProps, ref: ForwardedRef<HTMLButtonElement>) {
    const { className, classNameModifiers = [], children, disabled, onClick, ...restAttributes } = props;
    const classNameValue = useMemo(() => parseClassName('', className) || '', [className]);
    const disabledValue = useMemo(() => parseBooleanProp(disabled), [disabled]);

    const { allChildren, allProps, click } = useButton(
        classNameValue,
        classNameModifiers,
        DEFAULT_FILTER_BUTTON_CLASSNAME,
        disabledValue,
        props,
        props.type,
        onClick
    );

    return (
        <button ref={ref} onClick={click} {...allProps}>
            <Typography el={TypographyElement.DIV} variant={TypographyVariant.BODY} stronger={true}>
                {allChildren}
            </Typography>
        </button>
    );
}
export default fixedForwardRef(FilterButton);
