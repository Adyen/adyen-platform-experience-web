import cx from 'classnames';
import Alert from '../../../../../../internal/Alert/Alert';
import CopyText from '../../../../../../internal/CopyText/CopyText';
import useCoreContext from '../../../../../../../core/Context/useCoreContext';
import Typography from '../../../../../../internal/Typography/Typography';
import StructuredList from '../../../../../../internal/StructuredList';
import { AlertTypeOption, AlertVariantOption } from '../../../../../../internal/Alert/types';
import { containerQueries, useResponsiveContainer } from '../../../../../../../hooks/useResponsiveContainer';
import { Divider } from '../../../../../../internal/Divider/Divider';
import { TypographyElement, TypographyVariant } from '../../../../../../internal/Typography/types';
import { invisibleFields } from './constants';
import { useWizardFormContext } from '../../../../../../../hooks/form/wizard/WizardFormContext';
import { PBLFormValues } from '../../types';
import { StructuredListItem } from '../../../../../../internal/StructuredList/types';
import { useMemo } from 'preact/hooks';
import { Tag } from '../../../../../../internal/Tag/Tag';
import { PaymentLinkTypeDTO } from '../../../../../../../types/api/models/payByLink';
import type { TranslationKey } from '../../../../../../../translations';
import { SUMMARY_COPYABLE_FIELDS } from './constants';
import './FormSummary.scss';

export const FormSummary = () => {
    const { getSummaryData } = useWizardFormContext<PBLFormValues>();
    const formValues = getSummaryData();
    const { i18n } = useCoreContext();
    const isMobile = useResponsiveContainer(containerQueries.down.xs);

    const paymentListItems = useMemo<StructuredListItem[]>(() => {
        const { payment } = formValues;
        const visibleFields = payment?.fields.filter(({ id }) => !invisibleFields.includes(id));
        const storeField = formValues.store?.fields.find(field => field.id === 'store');

        const jointFields = [...(storeField ? [storeField] : []), ...(visibleFields || [])];

        let items: StructuredListItem[] | undefined = jointFields?.map(({ label, value, id, displayValue }) => ({
            key: (label || id) as TranslationKey,
            value: displayValue || value,
            id: id,
            render: item => {
                switch (item.id) {
                    case 'amount.value':
                        const currencyField = payment?.fields?.find(field => field.id === 'amount.currency');
                        return <>{i18n.amount(item.value, currencyField?.value)}</>;
                    case 'linkType':
                        return <>{i18n.get(`payByLink.linkCreation.form.linkTypes.${item.value as PaymentLinkTypeDTO}`)}</>;
                    default:
                        return <>{item.value}</>;
                }
            },
        }));

        return items || [];
    }, [formValues, i18n]);

    const customerListItems = useMemo(() => {
        const { customer } = formValues;
        const visibleFields = customer?.fields.filter(({ id }) => !invisibleFields.includes(id));

        const createCopyText = (value: string) => (
            <CopyText
                showCopyTextTooltip={false}
                textToCopy={value}
                className="adyen-pe-pay-by-link-creation-form-summary__field-value adyen-pe-pay-by-link-creation-form-summary__field-value-copy-container"
                type="Text"
            >
                {value}
            </CopyText>
        );

        const createListItem = ({
            label,
            value,
            id,
            displayValue,
        }: {
            label?: string;
            value: string;
            id?: string;
            displayValue?: string;
        }): StructuredListItem => ({
            key: (label || id) as TranslationKey,
            value: displayValue || value,
            id,
            render: item => (item.id && SUMMARY_COPYABLE_FIELDS.has(item.id) ? createCopyText(item.value) : <>{item.value}</>),
        });

        const deliveryAddressItems = visibleFields?.filter(field => field.id?.startsWith('deliveryAddress.'))?.map(createListItem);
        const billingAddressItems = visibleFields?.filter(field => field.id?.startsWith('billingAddress.'))?.map(createListItem);
        const nonAddressItems = visibleFields
            ?.filter(field => !field?.id?.startsWith('deliveryAddress.') && !field?.id?.startsWith('billingAddress.'))
            ?.map(createListItem);

        const sendLinkToShopper = customer?.fields.find(field => field.id === 'sendLinkToShopper' && field.value === true);
        const sendPaymentSuccessToShopper = customer?.fields.find(field => field.id === 'sendSuccessEmailToShopper' && field.value === true);

        if (sendLinkToShopper || sendPaymentSuccessToShopper) {
            nonAddressItems?.splice(3, 0, {
                key: 'payByLink.linkCreation.summary.fields.emailNotifications',
                value: [sendPaymentSuccessToShopper, sendLinkToShopper].filter(Boolean),
                render: () => (
                    <div className="adyen-pe-pay-by-link-creation-form-summary__tags-container">
                        {sendLinkToShopper && (
                            <Tag>
                                <Typography variant={TypographyVariant.CAPTION} el={TypographyElement.SPAN} stronger>
                                    {i18n.get('payByLink.linkCreation.summary.fields.emailNotifications.emailCreation')}
                                </Typography>
                            </Tag>
                        )}
                        {sendPaymentSuccessToShopper && (
                            <Tag>
                                <Typography variant={TypographyVariant.CAPTION} el={TypographyElement.SPAN} stronger>
                                    {i18n.get('payByLink.linkCreation.summary.fields.emailNotifications.paymentSuccess')}
                                </Typography>
                            </Tag>
                        )}
                    </div>
                ),
            });
        }

        return { nonAddressItems, deliveryAddressItems, billingAddressItems };
    }, [formValues, i18n]);

    return (
        <section className={cx('adyen-pe-pay-by-link-creation-form-summary', { 'adyen-pe-pay-by-link-creation-form-summary--mobile': isMobile })}>
            <section className="adyen-pe-pay-by-link-creation-form-summary__section">
                <Typography variant={TypographyVariant.SUBTITLE} className="adyen-pe-pay-by-link-creation-form-summary__section-title">
                    {i18n.get('payByLink.linkCreation.summary.paymentDetails')}
                </Typography>
                <div>
                    <StructuredList layout={'5-7'} align={'start'} condensed={false} items={paymentListItems} />
                </div>
            </section>
            <Divider />
            <section className="adyen-pe-pay-by-link-creation-form-summary__section">
                <Typography variant={TypographyVariant.SUBTITLE} className="adyen-pe-pay-by-link-creation-form-summary__section-title">
                    {i18n.get('payByLink.linkCreation.summary.shopperInformation')}
                </Typography>
                <div>
                    <StructuredList layout={'5-7'} align={'start'} condensed={false} items={customerListItems.nonAddressItems || []} />
                </div>
            </section>
            <section className="adyen-pe-pay-by-link-creation-form-summary__section">
                <Typography variant={TypographyVariant.BODY} className="adyen-pe-pay-by-link-creation-form-summary__section-title">
                    {i18n.get('payByLink.linkCreation.summary.deliveryAddress')}
                </Typography>
                <div>
                    <StructuredList layout={'5-7'} align={'start'} condensed={false} items={customerListItems.deliveryAddressItems || []} />
                </div>
            </section>
            <section className="adyen-pe-pay-by-link-creation-form-summary__section">
                <Typography variant={TypographyVariant.BODY} className="adyen-pe-pay-by-link-creation-form-summary__section-title">
                    {i18n.get('payByLink.linkCreation.summary.billingAddress')}
                </Typography>
                <div>
                    <StructuredList layout={'5-7'} align={'start'} condensed={false} items={customerListItems.billingAddressItems || []} />
                </div>
            </section>
            <Alert
                className="adyen-pe-pay-by-link-creation-form-summary__alert"
                variant={AlertVariantOption.TIP}
                type={AlertTypeOption.HIGHLIGHT}
                description={i18n.get('payByLink.linkCreation.summary.alertDescription')}
            />
        </section>
    );
};
