import cx from 'classnames';
import { BASE_CLASS } from './constants';
import useSpinButton from './hooks/useSpinButton';
import SpinButtonControl from './components/SpinButtonControl';
import SpinButtonValue from './components/SpinButtonValue';
import { SpinButtonControl as _SpinButtonControl, SpinButtonProps } from './types';
import './SpinButton.scss';

const SpinButton = (props: SpinButtonProps) => {
    const { $refs, currentValue, onButtonClick, onInteractionKeyPress } = useSpinButton(props);
    const { className, leap, ...restProps } = props;

    return (
        <div ref={$refs.containerElement} className={cx(BASE_CLASS, className)}>
            <SpinButtonControl control={_SpinButtonControl.DECREMENT} ref={$refs.decrementButton} onButtonClick={onButtonClick} />

            <SpinButtonValue {...restProps} ref={$refs.valueElement} value={currentValue} onInteractionKeyPress={onInteractionKeyPress} />

            <SpinButtonControl control={_SpinButtonControl.INCREMENT} ref={$refs.incrementButton} onButtonClick={onButtonClick} />
        </div>
    );
};

export default SpinButton;
