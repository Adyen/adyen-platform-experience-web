import { ComponentChild } from 'preact';
import cx from 'classnames';
import './Checkbox.scss';

interface CheckboxProps {
    checked?: boolean;
    classNameModifiers?: string[];
    label: string | ComponentChild;
    name?: string;
    isInvalid?: boolean;
    onChange?;
    onInput?;
    className?: string;
    value?: string;
}

export default function Checkbox({ classNameModifiers = [], label, isInvalid, onChange, ...props }: CheckboxProps) {
    return (
        <label className="adyen-fp-checkbox">
            <input
                {...props}
                className={cx([
                    'adyen-fp-checkbox__input',
                    [props.className],
                    { 'adyen-fp-checkbox__input--invalid': isInvalid },
                    classNameModifiers.map(m => `adyen-fp-input--${m}`)
                ])}
                type="checkbox"
                onChange={onChange}
            />
            <span className="adyen-fp-checkbox__label">{label}</span>
        </label>
    );
}

Checkbox.defaultProps = {
    onChange: () => {}
};
