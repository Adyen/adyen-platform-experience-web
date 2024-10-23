import cx from 'classnames';
import h, { Ref } from 'preact';
import useSpinButton from '../hooks/useSpinButton';
import { INPUT_CLASS, INPUT_SIZER_ELEMENT_CLASS } from '../constants';
import { fixedForwardRef } from '../../../../utils/preact';
import type { SpinButtonProps } from '../types';

export type SpinButtonValueProps = {
    onKeyboardInteraction: ReturnType<typeof useSpinButton>['keyboardInteraction'];
} & Partial<SpinButtonProps>;

const SpinButtonValue = fixedForwardRef(
    ({ onKeyboardInteraction, onKeyDown, value, valueAsText, ...restProps }: SpinButtonValueProps, ref: Ref<HTMLInputElement>) => {
        const _onKeyDown = (evt: h.JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
            onKeyboardInteraction(evt);
            onKeyDown?.(evt);
        };

        return (
            <div className="adyen-pe-width-sizer">
                <input
                    {...restProps}
                    readOnly
                    type="text"
                    inputMode="decimal"
                    value={value}
                    ref={ref}
                    className={cx('adyen-pe-input', INPUT_CLASS)}
                    onKeyDown={_onKeyDown}
                    {...(!!valueAsText && { 'aria-valuetext': valueAsText(value!) ?? value })}
                />

                <div className={cx('adyen-pe-width-sizer__element', INPUT_SIZER_ELEMENT_CLASS)} aria-hidden={true}>
                    {value}
                </div>
            </div>
        );
    }
);

export default SpinButtonValue;
