import { h } from 'preact';
import { HTMLProps } from 'preact/compat';
import { useCallback } from 'preact/hooks';
import cx from 'classnames';
import Icon from '../Icon';
import './ToggleSwitch.scss';

const BASE_CLASS = 'adyen-pe-toggle-switch';

const classes = {
    root: BASE_CLASS,
    disabled: BASE_CLASS + '--disabled',
    readonly: BASE_CLASS + '--readonly',
    mark: BASE_CLASS + '__mark',
    slider: BASE_CLASS + '__slider',
};

const ToggleSwitch = ({ readOnly, onClick, ...props }: Omit<HTMLProps<HTMLInputElement>, 'readonly'>) => {
    const handleClick = useCallback(
        (evt: h.JSX.TargetedMouseEvent<HTMLInputElement>) => {
            readOnly ? evt.preventDefault() : onClick?.(evt);
        },
        [readOnly, onClick]
    );

    return (
        <label className={cx(classes.root, { [classes.disabled]: props.disabled, [classes.readonly]: readOnly })}>
            <input {...props} type="checkbox" className="adyen-pe-visually-hidden" aria-readonly={readOnly} onClick={handleClick} />
            <span className={classes.slider}>
                <Icon className={classes.mark} name="checkmark" />
            </span>
        </label>
    );
};

export default ToggleSwitch;
