import { PropsWithChildren } from 'preact/compat';
import useCoreContext from '../../../core/Context/useCoreContext';
import Typography from '../Typography/Typography';
import { TypographyElement, TypographyVariant } from '../Typography/types';
import cx from 'classnames';

const FormField = ({
    label,
    optional,
    supportText,
    children,
    className,
    testId,
}: PropsWithChildren<{ label: string; optional: boolean; supportText?: string; className?: string; testId?: string }>) => {
    const { i18n } = useCoreContext();

    return (
        <div className={cx('adyen-pe-payment-link-creation-form__field-container', className)} data-testid={testId}>
            <div className="adyen-pe-payment-link-creation-form__field-label-container">
                <Typography
                    el={TypographyElement.SPAN}
                    variant={TypographyVariant.BODY}
                    stronger
                    className="adyen-pe-payment-link-creation-form__field-label"
                >
                    {label}
                </Typography>
                {optional && (
                    <Typography
                        el={TypographyElement.SPAN}
                        variant={TypographyVariant.BODY}
                        className="adyen-pe-payment-link-creation-form__field-label-optional"
                    >
                        {`(${i18n.get('payByLink.common.fields.optional.label')})`}
                    </Typography>
                )}
            </div>

            {children}

            {supportText && (
                <div>
                    <Typography
                        el={TypographyElement.SPAN}
                        variant={TypographyVariant.BODY}
                        className="adyen-pe-payment-link-creation-form__field-support-text"
                    >
                        {supportText}
                    </Typography>
                </div>
            )}
        </div>
    );
};

export default FormField;
