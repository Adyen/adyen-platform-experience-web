import useCoreContext from '../../../../../core/Context/useCoreContext';
import Card from '../../../../internal/Card/Card';
import { Tag } from '../../../../internal/Tag/Tag';
import { TagVariant } from '../../../../internal/Tag/types';
import { TypographyVariant, TypographyElement } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { DATE_FORMAT_PAYMENT_LINK_DETAILS_SUMMARY } from '../../../../../constants';
import { IPaymentLinkStatus, IPaymentLinkDetails } from '../../../../../types';
import useTimezoneAwareDateFormatting from '../../../../../hooks/useTimezoneAwareDateFormatting';
import './PaymentLinkSummary.scss';

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
    const getStatusVariant = (status: IPaymentLinkStatus): TagVariant => {
        switch (status) {
            case 'active':
                return TagVariant.BLUE;
            case 'completed':
                return TagVariant.SUCCESS;
            case 'expired':
                return TagVariant.DEFAULT;
            case 'paymentPending':
                return TagVariant.WARNING;
            default:
                return TagVariant.DEFAULT;
        }
    };

    return (
        <Card classNameModifiers={[CLASSNAMES.root]}>
            <div className={CLASSNAMES.content}>
                <Tag variant={getStatusVariant(status)}>
                    {i18n.has(`payByLink.common.status.${status}`)
                        ? i18n.get(`payByLink.common.status.${status}`)
                        : paymentLink?.linkInformation.status}
                </Tag>
                <Typography variant={TypographyVariant.TITLE} large>
                    {`${i18n.amount(paymentLink?.linkInformation.amount.value, paymentLink?.linkInformation.amount.currency)} ${paymentLink?.linkInformation.amount.currency}`}
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
