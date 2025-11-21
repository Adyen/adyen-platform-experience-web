import { ToggleSwitchProps } from './types';
import Icon from '../Icon';
import './ToggleSwitch.scss';

const BASE_CLASS = 'adyen-pe-toggle-switch';

const classes = {
    root: BASE_CLASS,
    mark: BASE_CLASS + '__mark',
    slider: BASE_CLASS + '__slider',
};

const ToggleSwitch = ({ checked, id, ...inputProps }: ToggleSwitchProps) => (
    <span className={classes.root}>
        <input {...inputProps} checked={!!checked} className="adyen-pe-visually-hidden" type="checkbox" id={id} />
        <span className={classes.slider}>
            <Icon className={classes.mark} name="checkmark" />
        </span>
    </span>
);

export default ToggleSwitch;
