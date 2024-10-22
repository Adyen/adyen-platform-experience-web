import cx from 'classnames';
import { Ref } from 'preact';
import { memo } from 'preact/compat';
import Icon from '../../Icon';
import Button from '../../Button/Button';
import useSpinButton from '../useSpinButton';
import { fixedForwardRef } from '../../../../utils/preact';
import { BUTTON_CLASS, BUTTON_DECREASE_CLASS, BUTTON_INCREASE_CLASS } from '../constants';
import { SpinButtonControl as _SpinButtonControl } from '../types';
import { ButtonVariant } from '../../Button/types';

export type SpinButtonControlProps = {
    control: _SpinButtonControl;
    onMouseInteraction: ReturnType<typeof useSpinButton>['mouseInteraction'];
};

const SpinButtonControl = fixedForwardRef(({ control, onMouseInteraction }: SpinButtonControlProps, ref: Ref<HTMLButtonElement>) => {
    const buttonClassNames = cx(BUTTON_CLASS, {
        [BUTTON_DECREASE_CLASS]: control === _SpinButtonControl.DECREMENT,
        [BUTTON_INCREASE_CLASS]: control === _SpinButtonControl.INCREMENT,
    });

    return (
        <Button iconButton ref={ref} variant={ButtonVariant.TERTIARY} className={buttonClassNames} onClick={onMouseInteraction}>
            {control === _SpinButtonControl.DECREMENT && <Icon name="minus-circle-outline" />}
            {control === _SpinButtonControl.INCREMENT && <Icon name="plus-circle-outline" />}
        </Button>
    );
});

export default memo(SpinButtonControl);
