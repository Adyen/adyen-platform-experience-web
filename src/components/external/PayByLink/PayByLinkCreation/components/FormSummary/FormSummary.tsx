import cx from 'classnames';
import Alert from '../../../../../internal/Alert/Alert';
import Button from '../../../../../internal/Button/Button';
import CopyText from '../../../../../internal/CopyText/CopyText';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import Typography from '../../../../../internal/Typography/Typography';
import { AlertTypeOption, AlertVariantOption } from '../../../../../internal/Alert/types';
import { ButtonVariant } from '../../../../../internal/Button/types';
import { containerQueries } from '../../../../../../hooks/useResponsiveContainer';
import { Divider } from '../../../../../internal/Divider/Divider';
import { TypographyVariant } from '../../../../../internal/Typography/types';
import { useForm } from '../../../../../../hooks/form/useForm';
import { useResponsiveContainer } from '../../../../../../hooks/useResponsiveContainer';
import type { TranslationKey } from '../../../../../../translations';

import './FormSummary.scss';
import { customRenders, invisibleFields, shopperFields } from './FormSummary.constants';

const fields = {
    store: 'STORE_NY_001',
    merchantReference: 'HSKJHAJSHJKHSKAHSJKHKS',
    amountValue: 321.23,
    linkValidity: '14 days',
    linkType: 'oneTime',
    description: "Hanno's new shoes",
    shopperReference: '56127384',
    fullName: 'Hanno van der Zee',
    emailAddress: 'hanno.vanderzee@adyen.com',
    phoneNumber: '+31612345678',
    countryCode: 'ES',
    shippingAddress: 'Calle siempre viva 123',
    billingAddress: 'Calle siempre viva 456',

    currency: 'EUR',
    deliveryDate: '2025-12-01',
    emailSender: 'samuel.sarabia@adyen.com',
    shopperLocale: 'en_US',
};

export const FormSummary = () => {
    const { getValues } = useForm({ defaultValues: fields });
    const formValues = getValues();
    const { i18n } = useCoreContext();
    const isMobile = useResponsiveContainer(containerQueries.down.xs);

    const paymentDetails = Object.entries(formValues).filter(
        ([key]) => !shopperFields[key as keyof typeof shopperFields] && !invisibleFields.includes(key)
    );

    return (
        <section className={cx('adyen-pe-pay-by-link-form-summary', { 'adyen-pe-pay-by-link-form-summary--mobile': isMobile })}>
            <section className="adyen-pe-pay-by-link-form-summary__section">
                <Typography variant={TypographyVariant.SUBTITLE} className="adyen-pe-pay-by-link-form-summary__section-title">
                    {i18n.get('payByLink.creation.summary.paymentDetails')}
                </Typography>
                <div>
                    {paymentDetails.map(([key, value]) => (
                        <div className="adyen-pe-pay-by-link-form-summary__field">
                            <span className="adyen-pe-pay-by-link-form-summary__field-label">
                                {i18n.get(`payByLink.creation.summary.fields.${key}` as TranslationKey)}
                            </span>
                            <span className="adyen-pe-pay-by-link-form-summary__field-value">
                                {customRenders[key as keyof typeof customRenders]
                                    ? customRenders[key as keyof typeof customRenders](value as number, formValues.currency)
                                    : (value as string)}
                            </span>
                        </div>
                    ))}
                </div>
            </section>
            <Divider />
            <section className="adyen-pe-pay-by-link-form-summary__section">
                <Typography variant={TypographyVariant.SUBTITLE} className="adyen-pe-pay-by-link-form-summary__section-title">
                    {i18n.get('payByLink.creation.summary.shopperInformation')}
                </Typography>
                <div>
                    {Object.keys(shopperFields).map(key => (
                        <>
                            <div className="adyen-pe-pay-by-link-form-summary__field">
                                <span className="adyen-pe-pay-by-link-form-summary__field-label">
                                    {i18n.get(`payByLink.creation.summary.fields.${key}` as TranslationKey)}
                                </span>
                                {shopperFields[key as keyof typeof shopperFields].copiable ? (
                                    <CopyText
                                        showCopyTextTooltip={false}
                                        textToCopy={formValues[key as keyof typeof shopperFields]}
                                        className="adyen-pe-pay-by-link-form-summary__field-value"
                                        type="Text"
                                    >
                                        {formValues[key as keyof typeof shopperFields]}
                                    </CopyText>
                                ) : (
                                    <span className="adyen-pe-pay-by-link-form-summary__field-value">
                                        {formValues[key as keyof typeof shopperFields]}
                                    </span>
                                )}
                            </div>
                        </>
                    ))}
                </div>
            </section>
            <Alert
                className="adyen-pe-pay-by-link-form-summary__alert"
                variant={AlertVariantOption.TIP}
                type={AlertTypeOption.HIGHLIGHT}
                description={i18n.get('payByLink.creation.summary.alertDescription')}
            />
            <div className="adyen-pe-pay-by-link-form-summary__actions">
                <Button variant={ButtonVariant.SECONDARY} onClick={() => {}}>
                    {i18n.get('payByLink.creation.summary.back')}
                </Button>
                <Button variant={ButtonVariant.PRIMARY} onClick={() => {}}>
                    {i18n.get('payByLink.creation.summary.createPaymentLink')}
                </Button>
            </div>
        </section>
    );
};
