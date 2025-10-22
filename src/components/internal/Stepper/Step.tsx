import { forwardRef } from 'preact/compat';
import cx from 'classnames';
import { StepProps } from './types';
import Icon from '../Icon';
import Typography from '../Typography/Typography';
import { TypographyElement, TypographyVariant } from '../Typography/types';
import useCoreContext from '../../../core/Context/useCoreContext';
import { useMemo } from 'preact/hooks';

export const Step = forwardRef<HTMLButtonElement, StepProps>(({ index, active, completed, disabled, onClick, children, totalSteps }, ref) => {
    const { i18n } = useCoreContext();

    const renderStep = () => {
        if (completed) {
            return <Icon name="checkmark-circle-fill" />;
        }
        return <span className="adyen-pe-step__number">{index + 1}</span>;
    };

    const ariaLabel = useMemo(() => {
        const label = i18n.get('common.stepper.step.a11y.label', {
            values: {
                step: index + 1,
                totalSteps,
            },
        });
        return typeof children === 'string' ? `${label}: ${children}` : label;
    }, [children, i18n, index, totalSteps]);

    return (
        <li
            className={cx('adyen-pe-step__item', {
                'adyen-pe-step--active': active,
                'adyen-pe-step--completed': completed,
                'adyen-pe-step--disabled': disabled,
            })}
        >
            <button
                aria-label={ariaLabel}
                aria-disabled={disabled}
                aria-current={active ? 'step' : undefined}
                tabIndex={active ? 0 : -1}
                ref={ref}
                type="button"
                className="adyen-pe-step__button"
                onClick={onClick}
                disabled={disabled}
            >
                <div className="adyen-pe-step__icon">{renderStep()}</div>
                <Typography variant={TypographyVariant.BODY} el={TypographyElement.SPAN} className="adyen-pe-step__label">
                    {children}
                </Typography>
            </button>
        </li>
    );
});
