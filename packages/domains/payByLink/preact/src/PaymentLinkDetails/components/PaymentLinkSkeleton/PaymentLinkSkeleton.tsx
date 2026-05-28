import './PaymentLinkSkeleton.scss';

const CLASSNAMES = {
    root: 'adyen-pe-payment-link-skeleton',
    summaryContainer: 'adyen-pe-payment-link-skeleton__summary-container',
    status: 'adyen-pe-payment-link-skeleton__status',
    amount: 'adyen-pe-payment-link-skeleton__amount',
    expirationDate: 'adyen-pe-payment-link-skeleton__expiration-date',
    tabsContainer: 'adyen-pe-payment-link-skeleton__tabs-container',
    tabLabelsContainer: 'adyen-pe-payment-link-skeleton__tab-labels-container',
    tabLabel: 'adyen-pe-payment-link-skeleton__tab-label',
    fieldsContainer: 'adyen-pe-payment-link-skeleton__fields-container',
    fieldContainer: 'adyen-pe-payment-link-skeleton__field-container',
    fieldLabel: 'adyen-pe-payment-link-skeleton__field-label',
    fieldValue: 'adyen-pe-payment-link-skeleton__field-value',
};

export const PaymentLinkSkeleton = () => {
    return (
        <div className={CLASSNAMES.root}>
            <div className={CLASSNAMES.summaryContainer}>
                <div className={CLASSNAMES.status}></div>
                <div className={CLASSNAMES.amount}></div>
                <div className={CLASSNAMES.expirationDate}></div>
            </div>
            <div className={CLASSNAMES.tabsContainer}>
                <div className={CLASSNAMES.tabLabelsContainer}>
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className={CLASSNAMES.tabLabel}></div>
                    ))}
                </div>
                <div className={CLASSNAMES.fieldsContainer}>
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className={CLASSNAMES.fieldContainer}>
                            <div className={CLASSNAMES.fieldLabel}></div>
                            <div className={CLASSNAMES.fieldValue}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
