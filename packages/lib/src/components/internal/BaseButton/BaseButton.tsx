import useButton from '@src/components/internal/Button/hooks/useButton';
import { DEFAULT_BASE_BUTTON_CLASSNAME } from '@src/components/internal/BaseButton/constants';
import { parseClassName } from '@src/utils/class-name-utils';
import { parseBoolean } from '@src/utils/common';
import { Ref } from 'preact';
import { forwardRef } from 'preact/compat';
import { useMemo } from 'preact/hooks';
import { ButtonProps } from './types';
import './BaseButton.scss';

function BaseButton(
    { disabled = false, onClick, classNameModifiers = [], type = 'button', children, className, fullWidth, ...restAttributes }: ButtonProps,
    ref: Ref<HTMLButtonElement>
) {
    const classNameValue = useMemo(() => parseClassName('', className) || '', [className]);
    const disabledValue = useMemo(() => parseBoolean(disabled), [disabled]);

    const { classes, click } = useButton(
        classNameValue,
        [...classNameModifiers, ...(fullWidth ? ['full-width'] : [])],
        DEFAULT_BASE_BUTTON_CLASSNAME,
        disabledValue,
        onClick
    );

    return (
        <button className={classes} type={type} disabled={disabled} onClick={click} ref={ref} {...restAttributes}>
            {children}
        </button>
    );
}

export default forwardRef(BaseButton);
