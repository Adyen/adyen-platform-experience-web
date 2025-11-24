import cx from 'classnames';
import { useEffect, useState, useRef } from 'preact/hooks';

import { CheckboxProps } from './types';
import './Checkbox.scss';
import Icon from '../Icon';
import Typography from '../Typography/Typography';
import { TypographyElement, TypographyVariant } from '../Typography/types';
import { uniqueId } from '../../../utils';

export const Checkbox = ({ checked, classNameModifiers, description, disabled, id, label, name, onInput }: CheckboxProps) => {
    const [checkedInternal, setCheckedInternal] = useState(checked);

    const inputId = id || useRef(uniqueId()).current;

    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        onInput?.(event);
        if (checked === undefined) {
            setCheckedInternal(event?.currentTarget?.checked ?? false);
        }
    };

    useEffect(() => {
        setCheckedInternal(checked);
    }, [checked]);

    return (
        <div className="adyen-pe-checkbox">
            <input
                name={name}
                type="checkbox"
                checked={checkedInternal}
                disabled={disabled}
                className={cx('adyen-pe-visually-hidden adyen-pe-checkbox__input', classNameModifiers)}
                id={inputId}
                onInput={handleInput}
            />
            <label className="adyen-pe-checkbox__label" htmlFor={inputId}>
                {checkedInternal ? (
                    <Icon name="checkmark-square-fill" className="adyen-pe-checkbox__icon" />
                ) : (
                    <Icon name="square" className="adyen-pe-checkbox__icon" />
                )}
                <div className="adyen-pe-checkbox__label-content">
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                        {label}
                    </Typography>
                    {description && (
                        <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} className="adyen-pe-checkbox__description">
                            {description}
                        </Typography>
                    )}
                </div>
            </label>
        </div>
    );
};
