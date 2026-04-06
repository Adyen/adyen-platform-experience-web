import cx from 'classnames';
import Icon from '../Icon';
import Typography from '../Typography/Typography';
import { TypographyElement, TypographyVariant } from '../Typography/types';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { uniqueId } from '../../../utils';
import { CheckboxProps } from './types';
import { h } from 'preact';
import './Checkbox.scss';

export const Checkbox = ({ checked, error, description, disabled, id, label, name, value, onInput, className, ...props }: CheckboxProps) => {
    const [checkedInternal, setCheckedInternal] = useState(checked);
    const stableId = useMemo(uniqueId, []);
    const inputId = id || stableId;

    const handleInput = useCallback(
        (event: h.JSX.TargetedEvent<HTMLInputElement>) => {
            onInput?.(event);
            if (checked === undefined) {
                setCheckedInternal(event?.currentTarget?.checked ?? false);
            }
        },
        [checked, onInput]
    );

    useEffect(() => {
        setCheckedInternal(checked);
    }, [checked]);

    return (
        <div className={cx('adyen-pe-checkbox', className)}>
            <input
                name={name}
                type="checkbox"
                checked={checkedInternal}
                disabled={disabled}
                className={cx('adyen-pe-visually-hidden adyen-pe-checkbox__input')}
                id={inputId}
                onInput={handleInput}
                {...props}
            />
            <label className="adyen-pe-checkbox__label" htmlFor={inputId}>
                {checkedInternal ? (
                    <Icon name="checkmark-square-fill" className="adyen-pe-checkbox__icon" />
                ) : (
                    <Icon name="square" className={cx('adyen-pe-checkbox__icon', { 'adyen-pe-checkbox__icon--error': error })} />
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
