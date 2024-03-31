import { ComponentChild } from 'preact';
import cx from 'classnames';
import './Checkbox.scss';
import { HTMLAttributes } from 'preact/compat';

export interface CheckboxProps {
    checked?: boolean;
    classNameModifiers?: string[];
    label: string | ComponentChild;
    name?: string;
    isInvalid?: boolean;
    onChange?: HTMLAttributes<HTMLInputElement>['onChange'];
    onInput?: HTMLAttributes<HTMLInputElement>['onInput'];
    className?: string;
    value?: string;
}

export default function Checkbox({ classNameModifiers = [], label, isInvalid, onChange, ...props }: CheckboxProps) {
    return (
        <label className="adyen-pe-checkbox">
            <input
                {...props}
                className={cx([
                    'adyen-pe-checkbox__input',
                    [props.className],
                    { 'adyen-pe-checkbox__input--invalid': isInvalid },
                    classNameModifiers.map(m => `adyen-pe-input--${m}`),
                ])}
                type="checkbox"
                onChange={onChange}
                value={props.value}
            />
            <span className="adyen-pe-checkbox__label">{label}</span>
        </label>
    );
}

Checkbox.defaultProps = {
    onChange: () => {},
};
