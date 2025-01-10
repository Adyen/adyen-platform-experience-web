import useButton from '../Button/hooks/useButton';
import { DEFAULT_BASE_BUTTON_CLASSNAME } from './constants';
import { fixedForwardRef, parseBooleanProp, parseClassName } from '../../../utils/preact';
import { Ref } from 'preact';
import { useMemo } from 'preact/hooks';
import { ButtonProps } from './types';
import './BaseButton.scss';

function BaseButton(props: ButtonProps, ref: Ref<HTMLButtonElement>) {
    const classNameValue = useMemo(() => parseClassName('', props.className) || '', [props.className]);
    const disabledValue = useMemo(() => parseBooleanProp(props.disabled || false), [props.disabled]);

    const { classes, click } = useButton(
        classNameValue,
        [...(props.classNameModifiers || []), ...(props.fullWidth ? ['full-width'] : [])],
        DEFAULT_BASE_BUTTON_CLASSNAME,
        disabledValue,
        props,
        props.onClick
    );

    return (
        <button className={classes} type={props.type || 'button'} disabled={props.disabled} onClick={click} ref={ref} {...props}>
            {props.children}
        </button>
    );
}

export default fixedForwardRef(BaseButton);
