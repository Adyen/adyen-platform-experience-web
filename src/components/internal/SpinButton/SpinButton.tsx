import cx from 'classnames';
import { BASE_CLASS } from './constants';
import useSpinButton from './useSpinButton';
import SpinButtonControl from './components/SpinButtonControl';
import SpinButtonValue from './components/SpinButtonValue';
import { SpinButtonControl as _SpinButtonControl, SpinButtonProps } from './types';
import './SpinButton.scss';

const SpinButton = (props: SpinButtonProps) => {
    const { className, leap, ...restProps } = props;
    const { $refs, currentValue, keyboardInteraction, mouseInteraction } = useSpinButton(props);

    return (
        <div ref={$refs.containerElement} className={cx(BASE_CLASS, className)}>
            <SpinButtonControl control={_SpinButtonControl.DECREMENT} ref={$refs.decrementButton} onMouseInteraction={mouseInteraction} />

            <SpinButtonValue {...restProps} ref={$refs.valueElement} value={currentValue} onKeyboardInteraction={keyboardInteraction} />

            <SpinButtonControl control={_SpinButtonControl.INCREMENT} ref={$refs.incrementButton} onMouseInteraction={mouseInteraction} />
        </div>
    );
};

export default SpinButton;
