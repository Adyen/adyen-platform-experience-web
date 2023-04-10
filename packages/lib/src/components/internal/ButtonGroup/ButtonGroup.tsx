import cx from 'classnames';
import './ButtonGroup.scss';
import { ButtonGroupProps } from './types';

const ButtonGroup = ({ options = [], name, onChange }: ButtonGroupProps) => (
    <div className="adyen-fp-button-group">
        {options.map(({ label, selected, value, disabled }, index) => (
            <label
                key={`${name}${index}`}
                className={cx({
                    'adyen-fp-button': true,
                    'adyen-fp-button--selected': selected,
                    'adyen-fp-button--disabled': disabled,
                })}
            >
                <input
                    type="radio"
                    className="adyen-fp-button-group__input"
                    value={value}
                    checked={selected}
                    onChange={onChange}
                    disabled={disabled}
                />
                <span className="adyen-fp-button-text">{label}</span>
            </label>
        ))}
    </div>
);

export default ButtonGroup;
