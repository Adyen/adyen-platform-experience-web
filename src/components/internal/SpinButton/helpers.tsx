import cx from 'classnames';
import { SpinButtonControl, SpinButtonProps } from './types';
import { CONTROL_CLASS, CONTROL_DECREASE_CLASS, CONTROL_INCREASE_CLASS, VALUE_CLASS, VALUE_TEXT_CLASS } from './constants';

export const defaultRenderControl: NonNullable<SpinButtonProps['renderControl']> = (control, ref) => (
    <button
        type="button"
        ref={ref}
        className={cx(CONTROL_CLASS, {
            [CONTROL_DECREASE_CLASS]: control === SpinButtonControl.DECREMENT,
            [CONTROL_INCREASE_CLASS]: control === SpinButtonControl.INCREMENT,
        })}
    >
        {control === SpinButtonControl.DECREMENT ? '-' : '+'}
    </button>
);

export const defaultRenderValue: NonNullable<SpinButtonProps['renderValue']> = (value: number) => (
    <span className={cx(VALUE_CLASS, VALUE_TEXT_CLASS)}>{value}</span>
);
