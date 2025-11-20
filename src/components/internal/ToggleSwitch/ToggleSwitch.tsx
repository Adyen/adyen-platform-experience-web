import { h } from 'preact';
import { AriaAttributes } from 'preact/compat';
import Icon from '../Icon';
import cx from 'classnames';
import './ToggleSwitch.scss';

export interface ToggleSwitchProps extends AriaAttributes {
    id?: string;
    name?: string;
    value?: string;
    checked?: boolean;
    onChange?: (evt: h.JSX.TargetedEvent<HTMLInputElement>) => any;
}

const BASE_CLASS = 'adyen-pe-toggle-switch';

const classes = {
    root: BASE_CLASS,
    mark: BASE_CLASS + '__mark',
    markChecked: BASE_CLASS + '__mark--checked',
    slider: BASE_CLASS + '__slider',
};

const ToggleSwitch = ({ checked, id, ...inputProps }: ToggleSwitchProps) => (
    <span className={classes.root}>
        <input {...inputProps} checked={!!checked} className="adyen-pe-visually-hidden" type="checkbox" id={id} />
        <span className={classes.slider}>
            <Icon className={cx(classes.mark, classes.markChecked)} name="checkmark" />
        </span>
    </span>
);

export default ToggleSwitch;
