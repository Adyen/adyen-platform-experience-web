import Typography from '../../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../../internal/Typography/types';

import { PropsWithChildren } from 'preact/compat';

const FormField = ({ label, optional, supportText, children }: PropsWithChildren<{ label: string; optional: boolean; supportText?: string }>) => {
    return (
        <div className="adyen-pe-pay-by-link-creation-form__form-field-container">
            <div className="adyen-pe-pay-by-link-creation-form__form-field-label-container">
                <Typography
                    el={TypographyElement.SPAN}
                    variant={TypographyVariant.BODY}
                    stronger
                    className="adyen-pe-pay-by-link-creation-form-form__form-field-label"
                >
                    {label}
                </Typography>
                {optional && (
                    <Typography
                        el={TypographyElement.SPAN}
                        variant={TypographyVariant.BODY}
                        className="adyen-pe-pay-by-link-creation-form__form-field-label-optional"
                    >
                        {'(optional)'}
                    </Typography>
                )}
            </div>

            {children}

            {supportText && (
                <div>
                    <Typography
                        el={TypographyElement.SPAN}
                        variant={TypographyVariant.BODY}
                        className="adyen-pe-pay-by-link-creation-form__form-field-support-text"
                    >
                        {supportText}
                    </Typography>
                </div>
            )}
        </div>
    );
};

export default FormField;
