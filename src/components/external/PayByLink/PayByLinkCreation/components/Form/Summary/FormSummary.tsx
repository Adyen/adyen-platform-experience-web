import cx from 'classnames';
import Alert from '../../../../../../internal/Alert/Alert';
import CopyText from '../../../../../../internal/CopyText/CopyText';
import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import Typography from '../../../../../../internal/Typography/Typography';
import { AlertTypeOption, AlertVariantOption } from '../../../../../../internal/Alert/types';
import { containerQueries, useResponsiveContainer } from '../../../../../../../hooks/useResponsiveContainer';
import { Divider } from '../../../../../../internal/Divider/Divider';
import { TypographyElement, TypographyVariant } from '../../../../../../internal/Typography/types';
import type { TranslationKey } from '../../../../../../../translations';
import './FormSummary.scss';
import { invisibleFields } from './constants';
import { useWizardFormContext } from '../../../../../../../hooks/form/wizard/WizardFormContext';
import { FormValues } from '../../types';
import StructuredList from '../../../../../../internal/StructuredList';
import { StructuredListItem } from '../../../../../../internal/StructuredList/types';
import { useMemo } from 'preact/hooks';
import { Tag } from '../../../../../../internal/Tag/Tag';
import { PaymentLinkTypeDTO } from '../../../../../../../types/api/models/payByLink';

export const FormSummary = () => {
    const { getSummaryData } = useWizardFormContext<FormValues>();
    const formValues = getSummaryData();
    const { i18n } = useCoreContext();
    const isMobile = useResponsiveContainer(containerQueries.down.xs);

    const paymentListItems = useMemo<StructuredListItem[]>(() => {
        const { payment } = formValues;
        const visibleFields = payment?.fields.filter(({ id }) => !invisibleFields.includes(id));
        const items: StructuredListItem[] | undefined = visibleFields?.map(({ label, value, id, displayValue }) => ({
            key: (label || id) as TranslationKey,
            value: displayValue || value,
            id: id,
            render: item => {
                switch (item.id) {
                    case 'amountValue':
                        return <>{i18n.amount(item.value, payment?.fields?.find(field => field.id === 'currency')?.value)}</>;
                    case 'linkType':
                        return <>{i18n.get(`payByLink.linkCreation.form.linkTypes.${item.value as PaymentLinkTypeDTO}`)}</>;
                    default:
                        return <>{item.value}</>;
                }
            },
        }));

        return items || [];
    }, [formValues, i18n]);

    const customerListItems = useMemo<StructuredListItem[]>(() => {
        const { customer } = formValues;
        const visibleFields = customer?.fields.filter(({ id }) => !invisibleFields.includes(id));
        const items: StructuredListItem[] | undefined = visibleFields?.map(({ label, value, id, displayValue }) => ({
            key: (label || id) as TranslationKey,
            value: displayValue || value,
            id,
            render: item => {
                switch (item.id) {
                    case 'shopperReference':
                    case 'fullName':
                    case 'emailAddress':
                    case 'phoneNumber':
                    case 'shippingAddress':
                    case 'billingAddress':
                        return (
                            <CopyText
                                showCopyTextTooltip={false}
                                textToCopy={item.value}
                                className="adyen-pe-pay-by-link-creation-form-summary__field-value adyen-pe-pay-by-link-creation-form-summary__field-value-copy-container"
                                type="Text"
                            >
                                {item.value}
                            </CopyText>
                        );
                    default:
                        return <>{item.value}</>;
                }
            },
        }));

        const sendLinkToShopper = customer?.fields.find(field => field.id === 'sendLinkToShopper' && field.value === true);
        const sendPaymentSuccessToShopper = customer?.fields.find(field => field.id === 'sendPaymentSuccessToShopper' && field.value === true);
        if (sendLinkToShopper || sendPaymentSuccessToShopper) {
            items?.splice(3, 0, {
                key: 'payByLink.creation.summary.fields.emailNotifications',
                value: [sendPaymentSuccessToShopper, sendLinkToShopper].filter(Boolean),
                render: () => {
                    return (
                        <div className="adyen-pe-pay-by-link-creation-form-summary__tags-container">
                            {sendLinkToShopper ? (
                                <Tag>
                                    <Typography variant={TypographyVariant.CAPTION} el={TypographyElement.SPAN} stronger>
                                        {i18n.get('payByLink.creation.summary.fields.emailNotifications.emailCreation')}
                                    </Typography>
                                </Tag>
                            ) : null}
                            {sendPaymentSuccessToShopper ? (
                                <Tag>
                                    <Typography variant={TypographyVariant.CAPTION} el={TypographyElement.SPAN} stronger>
                                        {i18n.get('payByLink.creation.summary.fields.emailNotifications.paymentSuccess')}
                                    </Typography>
                                </Tag>
                            ) : null}
                        </div>
                    );
                },
            });
        }

        return items || [];
    }, [formValues, i18n]);

    return (
        <section className={cx('adyen-pe-pay-by-link-creation-form-summary', { 'adyen-pe-pay-by-link-creation-form-summary--mobile': isMobile })}>
            <section className="adyen-pe-pay-by-link-creation-form-summary__section">
                <Typography variant={TypographyVariant.SUBTITLE} className="adyen-pe-pay-by-link-creation-form-summary__section-title">
                    {i18n.get('payByLink.creation.summary.paymentDetails')}
                </Typography>
                <div>
                    <StructuredList layout={'5-7'} align={'start'} condensed={false} items={paymentListItems} />
                </div>
            </section>
            <Divider />
            <section className="adyen-pe-pay-by-link-creation-form-summary__section">
                <Typography variant={TypographyVariant.SUBTITLE} className="adyen-pe-pay-by-link-creation-form-summary__section-title">
                    {i18n.get('payByLink.creation.summary.shopperInformation')}
                </Typography>
                <div>
                    <StructuredList layout={'5-7'} align={'start'} condensed={false} items={customerListItems} />
                </div>
            </section>
            <Alert
                className="adyen-pe-pay-by-link-creation-form-summary__alert"
                variant={AlertVariantOption.TIP}
                type={AlertTypeOption.HIGHLIGHT}
                description={i18n.get('payByLink.creation.summary.alertDescription')}
            />
        </section>
    );
};
