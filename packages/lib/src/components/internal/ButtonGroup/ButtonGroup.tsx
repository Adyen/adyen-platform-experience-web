import cx from 'classnames';
import './ButtonGroup.scss';
import { ButtonGroupProps } from './types';

const ButtonGroup = ({ options = [], name, onChange }: ButtonGroupProps) => (
    <div className="adyen-pe-button-group">
        {options.map(({ label, selected, value, disabled }, index) => (
            <label
                key={`${name}${index}`}
                className={cx({
                    'adyen-pe-button': true,
                    'adyen-pe-button--selected': selected,
                    'adyen-pe-button--disabled': disabled,
                })}
            >
                <input
                    type="radio"
                    className="adyen-pe-button-group__input"
                    value={value}
                    checked={selected}
                    onChange={onChange}
                    disabled={disabled}
                />
                <span className="adyen-pe-button-text">{label}</span>
            </label>
        ))}
    </div>
);

export default ButtonGroup;
