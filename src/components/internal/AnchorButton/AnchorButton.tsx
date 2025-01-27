import { Ref } from 'preact';
import useButton from '../Button/hooks/useButton';
import { DEFAULT_BUTTON_CLASSNAME } from '../Button/constants';
import { AnchorButtonProps, BaseButtonProps, ButtonVariant } from '../Button/types';
import { useMemo } from 'preact/hooks';
import { fixedForwardRef, parseBooleanProp, parseClassName } from '../../../utils/preact';

const AnchorButton = (props: AnchorButtonProps & BaseButtonProps, ref: Ref<HTMLAnchorElement>) => {
    const { variant = ButtonVariant.PRIMARY, disabled = false, onClick, classNameModifiers = [], className } = props;
    const classNameValue = useMemo(() => parseClassName('', className) || '', [className]);
    const disabledValue = useMemo(() => parseBooleanProp(disabled), [disabled]);

    const { click, allChildren, allProps } = useButton(
        classNameValue,
        [...classNameModifiers, variant],
        DEFAULT_BUTTON_CLASSNAME,
        disabledValue,
        props,
        onClick
    );

    return (
        <a {...allProps} href={props.href} ref={ref as Ref<HTMLAnchorElement>} onClick={click}>
            {allChildren}
        </a>
    );
};

export default fixedForwardRef(AnchorButton);
