import { InputHTMLAttributes, TargetedMouseEvent } from 'preact';
import { PropsWithChildren } from 'preact/compat';
import { useCallback, useMemo } from 'preact/hooks';
import { fixedForwardRef } from '../../../utils/preact';
import { classes } from './constants';
import cx from 'classnames';
import Icon from '../Icon';
import './ToggleSwitch.scss';

export interface ToggleSwitchProps extends PropsWithChildren<Omit<InputHTMLAttributes, 'readonly'>> {
    labelBeforeSwitch?: boolean;
}

const ToggleSwitch = fixedForwardRef<ToggleSwitchProps, HTMLInputElement>(
    ({ className, children, labelBeforeSwitch, onClick, readOnly, ...props }, ref) => {
        const handleClick = useCallback(
            (evt: TargetedMouseEvent<HTMLInputElement>) => {
                readOnly ? evt.preventDefault() : onClick?.(evt);
            },
            [readOnly, onClick]
        );

        const renderLabel = useMemo(
            () => <div className={cx(classes.label, { [classes.labelBefore]: labelBeforeSwitch })}>{children}</div>,
            [children, labelBeforeSwitch]
        );

        return (
            <label
                data-testid="toggle-switch"
                className={cx(className, classes.root, { [classes.disabled]: props.disabled, [classes.readonly]: readOnly })}
            >
                {labelBeforeSwitch && <>{renderLabel}</>}
                <div data-testid="toggle-switch-control" className={classes.switch}>
                    <input {...props} ref={ref} type="checkbox" className="adyen-pe-visually-hidden" aria-readonly={readOnly} onClick={handleClick} />
                    <span className={classes.slider}>
                        <Icon className={classes.mark} name="checkmark" />
                    </span>
                </div>
                {!labelBeforeSwitch && <>{renderLabel}</>}
            </label>
        );
    }
);

export default ToggleSwitch;
