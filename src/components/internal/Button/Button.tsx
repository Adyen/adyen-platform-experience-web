import useButton from './hooks/useButton';
import { DEFAULT_BUTTON_CLASSNAME } from './constants';
import { fixedForwardRef, parseBooleanProp, parseClassName } from '../../../utils/preact';
import { Ref } from 'preact';
import { useMemo } from 'preact/hooks';
import { ButtonVariant, RegularButtonProps } from './types';
import './Button.scss';

// TODO: Reuse BaseButton component within Button component
function Button(props: RegularButtonProps, ref: Ref<HTMLButtonElement> | undefined) {
    const classNameValue = useMemo(() => parseClassName('', props.className) || '', [props.className]);
    const disabledValue = useMemo(() => parseBooleanProp(props.disabled || false), [props.disabled]);

    const { click, allChildren, allProps } = useButton(
        classNameValue,
        [...(props.classNameModifiers || []), props.variant || ButtonVariant.PRIMARY],
        DEFAULT_BUTTON_CLASSNAME,
        disabledValue,
        props,
        props.type,
        props.onClick
    );

    const { classNameModifiers, ...restOfAllProps } = allProps;
    return (
        <button {...restOfAllProps} ref={ref as Ref<HTMLButtonElement>} type={props.type || 'button'} onClick={click}>
            {allChildren}
        </button>
    );
}

export default fixedForwardRef(Button);
