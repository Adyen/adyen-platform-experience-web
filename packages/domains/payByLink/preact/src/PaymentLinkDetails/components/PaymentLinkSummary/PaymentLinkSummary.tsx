import { useMemo } from 'preact/hooks';
import { useCoreContext } from '@integration-components/core/preact';
import Card from '@integration-components/ui-components-preact/Card/Card';
import { Tag } from '@integration-components/ui-components-preact/Tag/Tag';
import { TagVariant } from '@integration-components/ui-components-preact/Tag/types';
import { TypographyVariant, TypographyElement } from '@integration-components/ui-components-preact/Typography/types';
import Typography from '@integration-components/ui-components-preact/Typography/Typography';
import { DATE_FORMAT_PAYMENT_LINK_DETAILS_SUMMARY } from '@integration-components/utils';
import { IPaymentLinkDetails } from '@integration-components/types';
import { useTimezoneAwareDateFormatting } from '@integration-components/hooks-preact';
import { getPaymentLinkStatusLabel, getPaymentLinkStatusTagVariant } from '../../../../../domain/src';
import type { PaymentLinkStatusTagVariant } from '../../../../../domain/src';
import './PaymentLinkSummary.scss';

const TAG_VARIANT_MAP: Record<PaymentLinkStatusTagVariant, TagVariant> = {
    info: TagVariant.BLUE,
    success: TagVariant.SUCCESS,
    neutral: TagVariant.DEFAULT,
    warning: TagVariant.WARNING,
};

const CLASSNAMES = {
    root: 'adyen-pe-payment-link-summary',
    content: 'adyen-pe-payment-link-summary__content',
    expiresLabel: 'adyen-pe-payment-link-summary__expires-label',
};

type PaymentLinkSummaryProps = {
    paymentLink: IPaymentLinkDetails;
};

export const PaymentLinkSummary = ({ paymentLink }: PaymentLinkSummaryProps) => {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting();
    const status = paymentLink?.linkInformation.status;

    const formattedAmount = useMemo(() => {
        if (!paymentLink?.linkInformation.amount) return null;
        const { value, currency } = paymentLink.linkInformation.amount;
        return `${i18n.amount(value, currency, { hideCurrency: true })} ${currency}`;
    }, [i18n, paymentLink?.linkInformation.amount]);

    return (
        <Card classNameModifiers={[CLASSNAMES.root]}>
            <div className={CLASSNAMES.content}>
                <Tag variant={TAG_VARIANT_MAP[getPaymentLinkStatusTagVariant(status)]}>{getPaymentLinkStatusLabel(i18n, status)}</Tag>
                <Typography variant={TypographyVariant.TITLE} large>
                    {formattedAmount}
                </Typography>
                <div>
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} className={CLASSNAMES.expiresLabel}>
                        {`${i18n.get('payByLink.details.fields.expiresOn')}: `}
                    </Typography>
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                        {dateFormat(paymentLink.linkInformation.expirationDate, DATE_FORMAT_PAYMENT_LINK_DETAILS_SUMMARY)}
                    </Typography>
                </div>
            </div>
        </Card>
    );
};
