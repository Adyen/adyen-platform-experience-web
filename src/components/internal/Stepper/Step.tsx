import { forwardRef } from 'preact/compat';
import cx from 'classnames';
import { StepProps } from './types';
import Icon from '../Icon';
import Typography from '../Typography/Typography';
import { TypographyElement, TypographyVariant } from '../Typography/types';

const DefaultRenderStep = ({ completed, index }: { completed: boolean; index: number }) => {
    if (completed) {
        return <Icon name="checkmark-circle-fill" />;
    }
    return <span className="adyen-pe-step__number">{index + 1}</span>;
};

export const Step = forwardRef<HTMLButtonElement, StepProps>(({ index, active, completed, disabled, onClick, children, totalSteps }, ref) => {
    return (
        <li
            className={cx('adyen-pe-step__item', {
                'adyen-pe-step--active': active,
                'adyen-pe-step--completed': completed,
                'adyen-pe-step--disabled': disabled,
            })}
        >
            <button
                aria-disabled={disabled}
                aria-current={active ? 'step' : undefined}
                tabIndex={active ? 0 : -1}
                ref={ref}
                type="button"
                className="adyen-pe-step__button"
                onClick={onClick}
                disabled={disabled}
            >
                <div className="adyen-pe-step__icon" aria-hidden="true">
                    <DefaultRenderStep completed={completed} index={index} />
                </div>
                <Typography variant={TypographyVariant.BODY} el={TypographyElement.SPAN} className="adyen-pe-step__label">
                    {children}
                </Typography>
            </button>
        </li>
    );
});
