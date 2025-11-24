import { h } from 'preact';
import { HTMLProps, PropsWithChildren } from 'preact/compat';
import { useCallback, useMemo } from 'preact/hooks';
import cx from 'classnames';
import Icon from '../Icon';
import './ToggleSwitch.scss';

const BASE_CLASS = 'adyen-pe-toggle-switch';

const classes = {
    root: BASE_CLASS,
    disabled: BASE_CLASS + '--disabled',
    readonly: BASE_CLASS + '--readonly',
    label: BASE_CLASS + '__label',
    labelBefore: BASE_CLASS + '__label--before',
    mark: BASE_CLASS + '__mark',
    slider: BASE_CLASS + '__slider',
    switch: BASE_CLASS + '__switch',
};

export interface ToggleSwitchProps extends PropsWithChildren<Omit<HTMLProps<HTMLInputElement>, 'readonly'>> {
    labelBeforeSwitch?: boolean;
}

const ToggleSwitch = ({ children, labelBeforeSwitch, onClick, readOnly, ...props }: ToggleSwitchProps) => {
    const handleClick = useCallback(
        (evt: h.JSX.TargetedMouseEvent<HTMLInputElement>) => {
            readOnly ? evt.preventDefault() : onClick?.(evt);
        },
        [readOnly, onClick]
    );

    const renderLabel = useMemo(
        () => <div className={cx(classes.label, { [classes.labelBefore]: labelBeforeSwitch })}>{children}</div>,
        [children, labelBeforeSwitch]
    );

    return (
        <label data-testid="toggle-switch" className={cx(classes.root, { [classes.disabled]: props.disabled, [classes.readonly]: readOnly })}>
            {labelBeforeSwitch && <>{renderLabel}</>}
            <div data-testid="toggle-switch-control" className={classes.switch}>
                <input {...props} type="checkbox" className="adyen-pe-visually-hidden" aria-readonly={readOnly} onClick={handleClick} />
                <span className={classes.slider}>
                    <Icon className={classes.mark} name="checkmark" />
                </span>
            </div>
            {!labelBeforeSwitch && <>{renderLabel}</>}
        </label>
    );
};

export default ToggleSwitch;
